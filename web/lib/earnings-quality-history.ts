import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { getUserPaths, assertSafeTenantId } from './tenant';
import { writeTenantIndexFile, writeTenantMarkdownFile } from './tenant-disk-persist';
import { groupByYearMonthDate, type DateYearGroup } from './date-history-group';
import { createClientIfConfigured } from './supabase/server';
import {
  isMissingTableError,
  isSupabaseTableUnavailable,
  markSupabaseTableUnavailable,
  warnMissingTableOnce,
} from './supabase/schema-errors';
import type { EarningsQualityResult } from './earnings-quality';
import { findFullAnalysisByChildModuleId } from './full-analysis-child-lookup';

export interface EarningsQualityRecord {
  id: string;
  createdAt: string;
  ticker: string;
  stockName: string;
  sector: string;
  cmp: number | null;
  overallVerdict: string;
  warningCount: number;
  report: string;
  analysis: EarningsQualityResult;
}

interface EarningsQualityIndexFile {
  version: 1;
  entries: EarningsQualityRecord[];
}

interface EarningsQualityHistoryRow {
  id: string;
  user_id: string;
  ticker: string;
  stock_name: string;
  sector: string;
  cmp: number | null;
  overall_verdict: string;
  warning_count: number;
  report: string;
  analysis: EarningsQualityResult;
  created_at: string;
}

const EARNINGS_QUALITY_HISTORY_TABLE = 'earnings_quality_history';

function earningsQualityDir(tenantId: string): string {
  return path.join(getUserPaths(tenantId).portfolioDir, '../stock-calculator/earnings-quality');
}

function indexPath(tenantId: string): string {
  return path.join(earningsQualityDir(tenantId), 'index.json');
}

async function readIndex(tenantId: string): Promise<EarningsQualityIndexFile> {
  try {
    const raw = await fs.readFile(indexPath(tenantId), 'utf8');
    const parsed = JSON.parse(raw) as EarningsQualityIndexFile;
    if (parsed?.version === 1 && Array.isArray(parsed.entries)) return parsed;
  } catch {
    /* new */
  }
  return { version: 1, entries: [] };
}

async function writeIndex(tenantId: string, data: EarningsQualityIndexFile): Promise<void> {
  await writeTenantIndexFile(indexPath(tenantId), data);
}

export function formatEarningsQualityReport(analysis: EarningsQualityResult): string {
  const lines: string[] = [
    `# Earnings Quality — ${analysis.stockName} (${analysis.ticker})`,
    '',
    `**Sector:** ${analysis.sector}`,
    `**CMP:** ${analysis.cmp != null ? `₹${analysis.cmp.toLocaleString('en-IN')}` : '—'} (${analysis.cmpSource})`,
    `**Data:** ${analysis.dataSource}`,
    `**Verdict:** ${analysis.overallVerdict}`,
    '',
    `> ${analysis.coreQuestion}`,
    '',
  ];

  if (analysis.partA) {
    lines.push(
      '## Part A — Five-year rear-view',
      '',
      `**Verdict:** ${analysis.partA.verdict}`,
      '',
      `| FY | Revenue (₹ cr) | PAT (₹ cr) | EPS | EPS YoY | Rev YoY | CFO/PAT | Quality | Evidence |`,
      `|----|---------------:|-----------:|----:|--------:|--------:|--------:|---------|----------|`,
      ...analysis.partA.years.map(
        (y) =>
          `| ${y.fiscalYear} | ${y.revenueCr ?? '—'} | ${y.patCr ?? '—'} | ${y.eps ?? '—'} | ${y.epsYoYPct != null ? `${y.epsYoYPct}%` : '—'} | ${y.revenueYoYPct != null ? `${y.revenueYoYPct}%` : '—'} | ${y.cfoPatRatio ?? '—'} | ${y.qualitySignal} | ${y.evidence} |`
      ),
      '',
      `**EPS CAGR (5Y):** ${analysis.partA.epsCagr5y ?? '—'}% · **PAT CAGR:** ${analysis.partA.patCagr5y ?? '—'}% · **Revenue CAGR:** ${analysis.partA.revenueCagr5y ?? '—'}%`,
      `**Cash:** ${analysis.partA.cashQualityNote}`,
      ''
    );
  }

  if (analysis.partB) {
    lines.push(
      '## Part B — Five-year forward (risk-adjusted)',
      '',
      `**Verdict:** ${analysis.partB.verdict}`,
      '',
      analysis.partB.currentYearHighlight,
      '',
      `| FY | Base growth | Int. haircut | Ext. haircut | Adj growth | Projected EPS | Internal | External |`,
      `|----|------------:|-------------:|-------------:|-----------:|--------------:|----------|----------|`,
      ...analysis.partB.years.map(
        (y) =>
          `| ${y.fiscalYear} | ${y.baseEpsGrowthPct}% | −${y.internalHaircutPp} pp | −${y.externalHaircutPp} pp | ${y.adjustedEpsGrowthPct}% | ₹${y.projectedEps} | ${y.internalFactor.slice(0, 40)} | ${y.externalFactor.slice(0, 40)} |`
      ),
      ''
    );
  }

  lines.push(
    '## Supplementary — A. Growth',
    '',
    '| Metric | Value | Evidence |',
    '|--------|-------|----------|',
    ...analysis.growth.map((m) => `| ${m.label} | ${m.value} | ${m.evidence} |`),
    '',
    '## B. Profitability',
    '',
    '| Metric | Value | Evidence |',
    '|--------|-------|----------|',
    ...analysis.profitability.map((m) => `| ${m.label} | ${m.value} | ${m.evidence} |`),
    '',
    '## C. Cash quality',
    '',
    '| Metric | Value | Evidence |',
    '|--------|-------|----------|',
    ...analysis.cashQuality.map((m) => `| ${m.label} | ${m.value} | ${m.evidence} |`),
    '',
    '## D. Quarterly trend',
    ''
  );

  if (analysis.quarterly.length > 0) {
    lines.push(
      '| Quarter | Revenue | EBITDA | Margin | PAT | EPS | CFO |',
      '|---------|---------|--------|--------|-----|-----|-----|',
      ...analysis.quarterly.map(
        (q) =>
          `| ${q.quarter} | ${q.revenue ?? '—'} | ${q.ebitda ?? '—'} | ${q.marginPct ?? '—'} | ${q.pat ?? '—'} | ${q.eps ?? '—'} | ${q.cfo ?? '—'} |`
      ),
      '',
      '| Metric | Trend | Change |',
      '|--------|-------|--------|',
      ...analysis.quarterlyTrends.map(
        (t) =>
          `| ${t.metric} | ${t.trendLabel} | ${t.changePct != null ? `${t.changePct > 0 ? '+' : ''}${t.changePct.toFixed(1)}%` : '—'} |`
      )
    );
  } else {
    lines.push('_No quarterly table — add `EARNINGS_QUALITY_[TICKER].md` section D._');
  }

  if (analysis.warnings.length > 0) {
    lines.push('', '## Warnings', '');
    for (const w of analysis.warnings) {
      lines.push(`- **${w.title}:** ${w.detail}`);
    }
  }

  lines.push(
    '',
    '---',
    '',
    '_Generated by Stock Calculator — Earnings Quality. Not investment advice._'
  );
  return lines.join('\n');
}

export function analysisToRecord(analysis: EarningsQualityResult, id?: string): EarningsQualityRecord {
  const recordId = id ?? randomUUID();
  return {
    id: recordId,
    createdAt: new Date().toISOString(),
    ticker: analysis.ticker,
    stockName: analysis.stockName,
    sector: analysis.sector,
    cmp: analysis.cmp,
    overallVerdict: analysis.overallVerdict,
    warningCount: analysis.warnings.length,
    report: formatEarningsQualityReport(analysis),
    analysis,
  };
}

function rowToRecord(row: EarningsQualityHistoryRow): EarningsQualityRecord {
  return {
    id: row.id,
    createdAt: row.created_at,
    ticker: row.ticker,
    stockName: row.stock_name,
    sector: row.sector,
    cmp: row.cmp != null ? Number(row.cmp) : null,
    overallVerdict: row.overall_verdict,
    warningCount: Number(row.warning_count),
    report: row.report,
    analysis: row.analysis,
  };
}

async function persistRecordToDisk(tenantId: string, record: EarningsQualityRecord): Promise<void> {
  const index = await readIndex(tenantId);
  const existing = index.entries.findIndex((e) => e.id === record.id);
  if (existing >= 0) {
    index.entries[existing] = record;
  } else {
    index.entries.unshift(record);
  }
  await writeIndex(tenantId, index);
  await writeTenantMarkdownFile(
    path.join(earningsQualityDir(tenantId), `${record.id}.md`),
    record.report
  );
}

async function fetchAllFromSupabase(userId: string): Promise<EarningsQualityRecord[]> {
  if (isSupabaseTableUnavailable(EARNINGS_QUALITY_HISTORY_TABLE)) return [];

  const supabase = await createClientIfConfigured();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from(EARNINGS_QUALITY_HISTORY_TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    if (isMissingTableError(error)) {
      markSupabaseTableUnavailable(EARNINGS_QUALITY_HISTORY_TABLE);
      warnMissingTableOnce(EARNINGS_QUALITY_HISTORY_TABLE, '005_earnings_quality_history.sql');
      return [];
    }
    if (process.env.NODE_ENV === 'development') {
      console.warn('earnings_quality_history fetch failed:', error.message);
    }
    return [];
  }

  return (data as EarningsQualityHistoryRow[]).map(rowToRecord);
}

async function fetchOneFromSupabase(
  userId: string,
  id: string
): Promise<EarningsQualityRecord | null> {
  if (isSupabaseTableUnavailable(EARNINGS_QUALITY_HISTORY_TABLE)) return null;

  const supabase = await createClientIfConfigured();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(EARNINGS_QUALITY_HISTORY_TABLE)
    .select('*')
    .eq('user_id', userId)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    if (isMissingTableError(error)) {
      markSupabaseTableUnavailable(EARNINGS_QUALITY_HISTORY_TABLE);
      warnMissingTableOnce(EARNINGS_QUALITY_HISTORY_TABLE, '005_earnings_quality_history.sql');
      return null;
    }
    return null;
  }

  if (!data) return null;
  return rowToRecord(data as EarningsQualityHistoryRow);
}

export interface SaveEarningsQualityInput {
  tenantId: string;
  userId: string;
  authMode: 'supabase' | 'cookie-dev';
  analysis: EarningsQualityResult;
}

export async function saveEarningsQualityRecord(
  input: SaveEarningsQualityInput
): Promise<EarningsQualityRecord> {
  assertSafeTenantId(input.tenantId);
  const record = analysisToRecord(input.analysis);

  await persistRecordToDisk(input.tenantId, record);

  if (input.authMode === 'supabase') {
    const supabase = await createClientIfConfigured();
    if (supabase && !isSupabaseTableUnavailable(EARNINGS_QUALITY_HISTORY_TABLE)) {
      const { error } = await supabase.from(EARNINGS_QUALITY_HISTORY_TABLE).insert({
        id: record.id,
        user_id: input.userId,
        ticker: record.ticker,
        stock_name: record.stockName,
        sector: record.sector,
        cmp: record.cmp,
        overall_verdict: record.overallVerdict,
        warning_count: record.warningCount,
        report: record.report,
        analysis: record.analysis,
      });
      if (error) {
        if (isMissingTableError(error)) {
          markSupabaseTableUnavailable(EARNINGS_QUALITY_HISTORY_TABLE);
          warnMissingTableOnce(EARNINGS_QUALITY_HISTORY_TABLE, '005_earnings_quality_history.sql');
        } else if (process.env.NODE_ENV === 'development') {
          console.warn('earnings_quality_history insert failed:', error.message);
        }
      }
    }
  }

  return record;
}

export async function listEarningsQualityRecords(
  tenantId: string,
  userId?: string,
  authMode?: 'supabase' | 'cookie-dev'
): Promise<EarningsQualityRecord[]> {
  assertSafeTenantId(tenantId);
  let entries = (await readIndex(tenantId)).entries;

  if (entries.length === 0 && authMode === 'supabase' && userId) {
    const remote = await fetchAllFromSupabase(userId);
    if (remote.length > 0) {
      for (const record of remote) {
        await persistRecordToDisk(tenantId, record);
      }
      entries = remote;
    }
  }

  return entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getEarningsQualityRecord(
  tenantId: string,
  id: string,
  userId?: string,
  authMode?: 'supabase' | 'cookie-dev'
): Promise<EarningsQualityRecord | null> {
  const index = await readIndex(tenantId);
  const local = index.entries.find((e) => e.id === id);
  if (local) return local;

  if (authMode === 'supabase' && userId) {
    const remote = await fetchOneFromSupabase(userId, id);
    if (remote) {
      await persistRecordToDisk(tenantId, remote);
      return remote;
    }
  }

  const full = await findFullAnalysisByChildModuleId(tenantId, id, userId, authMode);
  if (full?.childIds.earningsQuality === id) {
    return analysisToRecord(full.analysis.earningsQuality, id);
  }

  return null;
}

export function groupEarningsQualityByDate(
  entries: EarningsQualityRecord[]
): DateYearGroup<EarningsQualityRecord>[] {
  return groupByYearMonthDate(entries, (e) => e.createdAt);
}
