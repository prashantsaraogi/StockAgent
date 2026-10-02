import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { getUserPaths, assertSafeTenantId } from './tenant';
import { resolveStock } from './stock-search';
import { getStockbookByTicker } from './stockbook-index';
import {
  getMarketCapBucket,
  marketCapBucketLabel,
  CAP_BUCKET_ORDER,
  type MarketCapBucket,
} from './market-cap';
import { createClientIfConfigured } from './supabase/server';
import {
  groupByYearMonthDate,
  type DateYearGroup,
} from './date-history-group';
import type { StockChatMessage } from './stock-chat-thread';

export interface AnalysisRecord {
  id: string;
  createdAt: string;
  query: string;
  answer: string;
  ticker: string | null;
  stockName: string | null;
  sector: string;
  marketCapBucket: MarketCapBucket;
  marketCapCr: number | null;
  verdict: string | null;
  agentMode: string | null;
  sessionId: string | null;
}

interface AnalysisIndexFile {
  version: 1;
  entries: AnalysisRecord[];
}

function analysisDir(tenantId: string): string {
  return path.join(getUserPaths(tenantId).portfolioDir, '../analysis-log');
}

function indexPath(tenantId: string): string {
  return path.join(analysisDir(tenantId), 'index.json');
}

async function readIndex(tenantId: string): Promise<AnalysisIndexFile> {
  try {
    const raw = await fs.readFile(indexPath(tenantId), 'utf8');
    const parsed = JSON.parse(raw) as AnalysisIndexFile;
    if (parsed?.version === 1 && Array.isArray(parsed.entries)) return parsed;
  } catch {
    /* new */
  }
  return { version: 1, entries: [] };
}

async function writeIndex(tenantId: string, data: AnalysisIndexFile): Promise<void> {
  const dir = analysisDir(tenantId);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(indexPath(tenantId), JSON.stringify(data, null, 2), 'utf8');
}

export function extractVerdict(answer: string): string | null {
  const patterns = [
    /\*\*(HOLD|PAUSE ADDS|WAIT|WATCHLIST|INVESTIGATE|ACCUMULATE SIP|STAGED STARTER OK|STAGED STARTER|HIGH ALERT[^*]*)\*\*/i,
    /## Verdict\s*\n+\*\*([^*]+)\*\*/i,
  ];
  for (const re of patterns) {
    const m = answer.match(re);
    if (m?.[1]) return m[1].trim();
  }
  return null;
}

async function resolveStockMeta(
  query: string,
  hints: { ticker?: string; sector?: string; stockName?: string }
): Promise<{
  ticker: string | null;
  stockName: string | null;
  sector: string;
  marketCapBucket: MarketCapBucket;
  marketCapCr: number | null;
}> {
  let ticker = hints.ticker?.toUpperCase() ?? null;
  let stockName = hints.stockName ?? null;
  let sector = hints.sector ?? 'General';

  if (!ticker && hints.stockName) {
    const resolved = await resolveStock(hints.stockName);
    if (resolved) {
      ticker = resolved.ticker;
      stockName = resolved.company;
      sector = resolved.sector;
    }
  }

  if (!ticker) {
    const tokens = query.match(/\b[A-Z]{2,12}\b/g);
    if (tokens) {
      for (const t of tokens) {
        const resolved = await resolveStock(t);
        if (resolved) {
          ticker = resolved.ticker;
          stockName = resolved.company;
          sector = resolved.sector;
          break;
        }
      }
    }
  }

  if (!ticker) {
    const resolved = await resolveStock(query.slice(0, 80));
    if (resolved) {
      ticker = resolved.ticker;
      stockName = resolved.company;
      sector = resolved.sector;
    }
  }

  if (ticker) {
    const loc = await getStockbookByTicker(ticker);
    if (loc) {
      sector = loc.sector;
      stockName = stockName ?? loc.stock;
    }
  }

  let marketCapBucket: MarketCapBucket = 'unknown';
  let marketCapCr: number | null = null;
  if (ticker) {
    const cap = await getMarketCapBucket(ticker);
    marketCapBucket = cap.bucket;
    marketCapCr = cap.mcapCr;
  }

  return { ticker, stockName, sector, marketCapBucket, marketCapCr };
}

export interface SaveAnalysisInput {
  tenantId: string;
  userId: string;
  authMode: 'supabase' | 'cookie-dev';
  query: string;
  answer: string;
  agentMode?: string;
  sessionId?: string;
  ticker?: string;
  sector?: string;
  stockName?: string;
}

/** Persist Ask Agent Q&A to user Analysis Log (disk + Supabase). */
export async function saveAnalysisRecord(input: SaveAnalysisInput): Promise<AnalysisRecord> {
  assertSafeTenantId(input.tenantId);

  const meta = await resolveStockMeta(input.query, {
    ticker: input.ticker,
    sector: input.sector,
    stockName: input.stockName,
  });

  const record: AnalysisRecord = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    query: input.query,
    answer: input.answer,
    ticker: meta.ticker,
    stockName: meta.stockName,
    sector: meta.sector,
    marketCapBucket: meta.marketCapBucket,
    marketCapCr: meta.marketCapCr,
    verdict: extractVerdict(input.answer),
    agentMode: input.agentMode ?? null,
    sessionId: input.sessionId ?? null,
  };

  const index = await readIndex(input.tenantId);
  index.entries.unshift(record);
  await writeIndex(input.tenantId, index);

  // Per-entry markdown for Cursor cross-ref
  const md = `# Analysis — ${record.stockName ?? record.ticker ?? 'General'}

**Date:** ${record.createdAt}  
**Sector:** ${record.sector} · **${marketCapBucketLabel(record.marketCapBucket)}**  
${record.ticker ? `**Ticker:** ${record.ticker}  ` : ''}
${record.verdict ? `**Verdict:** ${record.verdict}  ` : ''}

## Question

${record.query}

## Answer

${record.answer}
`;
  await fs.writeFile(path.join(analysisDir(input.tenantId), `${record.id}.md`), md, 'utf8');

  if (input.authMode === 'supabase') {
    const supabase = await createClientIfConfigured();
    if (supabase) {
      const { error } = await supabase.from('analysis_history').insert({
        id: record.id,
        user_id: input.userId,
        session_id: record.sessionId,
        query: record.query,
        answer: record.answer,
        ticker: record.ticker,
        stock_name: record.stockName,
        sector: record.sector,
        market_cap_bucket: record.marketCapBucket,
        market_cap_cr: record.marketCapCr,
        verdict: record.verdict,
        agent_mode: record.agentMode,
        metadata: { mode: record.agentMode },
      });
      if (error) console.error('analysis_history insert failed:', error.message);
    }
  }

  return record;
}

export async function listAnalysisRecords(tenantId: string): Promise<AnalysisRecord[]> {
  assertSafeTenantId(tenantId);
  const index = await readIndex(tenantId);
  return index.entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Ask Agent entries for one stock (newest first). */
export async function listAnalysisRecordsForStock(
  tenantId: string,
  opts: { ticker?: string; stockName?: string; limit?: number }
): Promise<AnalysisRecord[]> {
  const limit = opts.limit ?? 12;
  const ticker = opts.ticker?.toUpperCase();
  const stockName = opts.stockName?.trim();
  const all = await listAnalysisRecords(tenantId);
  const filtered = all.filter((e) => {
    if (ticker && e.ticker?.toUpperCase() === ticker) return true;
    if (stockName && e.stockName?.toLowerCase() === stockName.toLowerCase()) return true;
    return false;
  });
  return filtered.slice(0, limit);
}

/** Flatten analysis log entries to chat messages (oldest first). */
export function analysisRecordsToChatMessages(records: AnalysisRecord[]): StockChatMessage[] {
  const chronological = [...records].reverse();
  const out: StockChatMessage[] = [];
  for (const r of chronological) {
    out.push({ role: 'user', text: r.query });
    out.push({
      role: 'agent',
      text: r.answer,
      meta: {
        mode: r.agentMode ?? undefined,
        analysisId: r.id,
        analysisPath: `/journal/analysis/${r.id}`,
      },
    });
  }
  return out;
}

export async function getAnalysisRecord(
  tenantId: string,
  id: string
): Promise<AnalysisRecord | null> {
  const entries = await listAnalysisRecords(tenantId);
  return entries.find((e) => e.id === id) ?? null;
}

export interface AnalysisLogSectorGroup {
  sector: string;
  capBuckets: {
    bucket: MarketCapBucket;
    label: string;
    entries: AnalysisRecord[];
  }[];
  totalEntries: number;
}

/** Group history: Sector → Large/Mid/Small cap → entries (newest first). */
export function groupAnalysisBySectorAndCap(
  entries: AnalysisRecord[]
): AnalysisLogSectorGroup[] {
  const bySector = new Map<string, AnalysisRecord[]>();

  for (const e of entries) {
    const sector = e.sector || 'General';
    const list = bySector.get(sector) ?? [];
    list.push(e);
    bySector.set(sector, list);
  }

  const groups: AnalysisLogSectorGroup[] = [];

  for (const [sector, sectorEntries] of [...bySector.entries()].sort((a, b) =>
    a[0].localeCompare(b[0])
  )) {
    const capBuckets = CAP_BUCKET_ORDER.map((bucket) => ({
      bucket,
      label: marketCapBucketLabel(bucket),
      entries: sectorEntries
        .filter((e) => e.marketCapBucket === bucket)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    })).filter((b) => b.entries.length > 0);

    groups.push({
      sector,
      capBuckets,
      totalEntries: sectorEntries.length,
    });
  }

  return groups.sort((a, b) => b.totalEntries - a.totalEntries);
}

/** Group history: Year → Month → Date → entries (newest first, IST). */
export function groupAnalysisByDate(
  entries: AnalysisRecord[]
): DateYearGroup<AnalysisRecord>[] {
  return groupByYearMonthDate(entries, (e) => e.createdAt);
}

export type AnalysisLogDateGroup = DateYearGroup<AnalysisRecord>;
