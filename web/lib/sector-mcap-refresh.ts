import fs from 'fs/promises';
import path from 'path';
import { getRepoRoot } from './framework-paths';
import { fetchMarketCapCrBatch } from './market-cap';
import { SECTOR_OUTLOOK_PATHS } from './sector-slugs';

const TICKER_RE = /^[A-Z][A-Z0-9&.-]{1,24}$/;

export interface McapRefreshResult {
  filePath: string;
  tickersUpdated: number;
  tickersFailed: string[];
  refreshedAt: string;
}

/** Extract unique NSE tickers from cap-tier tables in markdown. */
export function extractCapTierTickers(md: string): string[] {
  const section = getCapTierSection(md);
  const tickers = new Set<string>();

  for (const line of section.split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    if (/^\|\s*[-#]/.test(line)) continue;
    const cells = line
      .split('|')
      .slice(1, -1)
      .map((c) => c.replace(/\*\*/g, '').trim());
    if (cells.length < 4) continue;
    const rank = parseInt(cells[0] ?? '', 10);
    if (!Number.isFinite(rank)) continue;
    const ticker = (cells[2] ?? '').toUpperCase();
    if (!TICKER_RE.test(ticker)) continue;
    tickers.add(ticker);
  }

  return [...tickers];
}

function getCapTierSection(md: string): string {
  const start = md.search(/## Cap tier universe/i);
  if (start < 0) return '';
  const tail = md.slice(start);
  const next = tail.search(/\n## /);
  return next > 0 ? tail.slice(0, next) : tail;
}

function formatMcapCr(n: number): string {
  return Math.round(n).toLocaleString('en-IN');
}

function updateCapTierLines(
  section: string,
  mcapByTicker: Map<string, number | null>
): string {
  return section
    .split('\n')
    .map((line) => {
      if (!line.trim().startsWith('|')) return line;
      if (/^\|\s*[-#]/.test(line)) return line;
      const parts = line.split('|');
      if (parts.length < 6) return line;
      const rank = parseInt(parts[1]?.replace(/\*\*/g, '').trim() ?? '', 10);
      if (!Number.isFinite(rank)) return line;
      const ticker = (parts[3]?.replace(/\*\*/g, '').trim() ?? '').toUpperCase();
      if (!TICKER_RE.test(ticker)) return line;
      const mcap = mcapByTicker.get(ticker);
      if (mcap == null || !Number.isFinite(mcap)) return line;
      parts[4] = ` ${formatMcapCr(mcap)} `;
      return parts.join('|');
    })
    .join('\n');
}

/** Update Mcap ₹ cr column in cap-tier rows; set refresh stamp. */
export function updateCapTierMcapInMarkdown(
  md: string,
  mcapByTicker: Map<string, number | null>,
  refreshedAt: string
): string {
  const start = md.search(/## Cap tier universe/i);
  if (start < 0) return md;

  const before = md.slice(0, start);
  const tail = md.slice(start);
  const nextSection = tail.search(/\n## /);
  const capBlock = nextSection > 0 ? tail.slice(0, nextSection) : tail;
  const after = nextSection > 0 ? tail.slice(nextSection) : '';

  const stamp = `**Mcap last refreshed:** ${refreshedAt} (Yahoo NSE · weekly auto job)`;
  let body = capBlock.replace(/^## Cap tier universe\s*/i, '');
  if (/^\*\*Mcap last refreshed:/m.test(body)) {
    body = body.replace(/^\*\*Mcap last refreshed:[^\n]*\n?/m, `${stamp}\n\n`);
  } else {
    body = `${stamp}\n\n${body.replace(/^\n+/, '')}`;
  }

  const updatedBody = updateCapTierLines(body, mcapByTicker);
  return `${before}## Cap tier universe\n${updatedBody.trimStart()}${after}`;
}

export function parseMcapLastRefreshed(md: string): string | null {
  const m = md.match(/\*\*Mcap last refreshed:\*\*\s*([\d-]+)/i);
  return m?.[1] ?? null;
}

export async function refreshSectorOutlookMcap(filePath: string): Promise<McapRefreshResult> {
  const fullPath = path.join(getRepoRoot(), filePath.replace(/\//g, path.sep));
  const md = await fs.readFile(fullPath, 'utf8');
  const tickers = extractCapTierTickers(md);
  const mcapMap = await fetchMarketCapCrBatch(tickers);
  const refreshedAt = new Date().toISOString().slice(0, 10);
  const updated = updateCapTierMcapInMarkdown(md, mcapMap, refreshedAt);
  await fs.writeFile(fullPath, updated, 'utf8');

  const tickersFailed = tickers.filter((t) => mcapMap.get(t) == null);
  return {
    filePath,
    tickersUpdated: tickers.length - tickersFailed.length,
    tickersFailed,
    refreshedAt,
  };
}

export async function refreshAllSectorOutlookMcaps(): Promise<McapRefreshResult[]> {
  const paths = Object.values(SECTOR_OUTLOOK_PATHS);
  const results: McapRefreshResult[] = [];
  for (const filePath of paths) {
    results.push(await refreshSectorOutlookMcap(filePath));
  }
  return results;
}
