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
import type { RiskDecisionResult } from './risk-decision';

export interface RiskDecisionRecord {
  id: string;
  createdAt: string;
  ticker: string;
  stockName: string;
  sector: string;
  cmp: number | null;
  quantitativeScore100: number;
  investmentVerdict: string;
  thesisStatus: string;
  report: string;
  analysis: RiskDecisionResult;
}

interface RiskDecisionIndexFile {
  version: 1;
  entries: RiskDecisionRecord[];
}

interface RiskDecisionHistoryRow {
  id: string;
  user_id: string;
  ticker: string;
  stock_name: string;
  sector: string;
  cmp: number | null;
  quantitative_score_100: number;
  investment_verdict: string;
  thesis_status: string;
  report: string;
  analysis: RiskDecisionResult;
  created_at: string;
}

const RISK_DECISION_HISTORY_TABLE = 'risk_decision_history';

function riskDecisionDir(tenantId: string): string {
  return path.join(getUserPaths(tenantId).portfolioDir, '../stock-calculator/risk-decision');
}

function indexPath(tenantId: string): string {
  return path.join(riskDecisionDir(tenantId), 'index.json');
}

async function readIndex(tenantId: string): Promise<RiskDecisionIndexFile> {
  try {
    const raw = await fs.readFile(indexPath(tenantId), 'utf8');
    const parsed = JSON.parse(raw) as RiskDecisionIndexFile;
    if (parsed?.version === 1 && Array.isArray(parsed.entries)) return parsed;
  } catch {
    /* new */
  }
  return { version: 1, entries: [] };
}

async function writeIndex(tenantId: string, data: RiskDecisionIndexFile): Promise<void> {
  await writeTenantIndexFile(indexPath(tenantId), data);
}

export function formatRiskDecisionReport(analysis: RiskDecisionResult): string {
  const lines: string[] = [
    `# Risk & Decision — ${analysis.stockName} (${analysis.ticker})`,
    '',
    `**Score:** ${analysis.quantitativeScore100}/100 · **Verdict:** ${analysis.investmentVerdict}`,
    `**CMP:** ${analysis.cmp != null ? `₹${analysis.cmp.toLocaleString('en-IN')}` : '—'}`,
    '',
    '## Investment Thesis',
    '',
    `- Status: ${analysis.thesis.status}`,
    `- Valuation: ${analysis.thesis.valuationLabel}`,
    `- Business: ${analysis.thesis.businessLabel}`,
    `- Earnings: ${analysis.thesis.earningsLabel}`,
    `- Risk: ${analysis.thesis.riskLabel}`,
    `- Why own: ${analysis.thesis.whyOwn}`,
    `- Why not aggressive: ${analysis.thesis.whyNotAggressive}`,
    `- Change mind if: ${analysis.thesis.changeMind}`,
    `- Next review: ${analysis.thesis.nextReview}`,
    '',
    '## Component scores',
    '',
    '| Component | Weight | Score |',
    '|-----------|-------:|------:|',
    ...analysis.components.map(
      (c) => `| ${c.label} | ${c.weightPct}% | ${c.score10}/10 |`
    ),
    '',
    '## Positives',
    ...analysis.positives.map((p) => `- ${p}`),
    '',
    '## Concerns',
    ...analysis.concerns.map((c) => `- ${c}`),
    '',
    '## Next quarter watch',
    ...analysis.nextQuarterWatch.map((w) => `- ${w}`),
    '',
    '---',
    '_Stock Calculator Tab 5 — not investment advice._',
  ];
  return lines.join('\n');
}

export function analysisToRecord(analysis: RiskDecisionResult, id?: string): RiskDecisionRecord {
  const recordId = id ?? randomUUID();
  return {
    id: recordId,
    createdAt: new Date().toISOString(),
    ticker: analysis.ticker,
    stockName: analysis.stockName,
    sector: analysis.sector,
    cmp: analysis.cmp,
    quantitativeScore100: analysis.quantitativeScore100,
    investmentVerdict: analysis.investmentVerdict,
    thesisStatus: analysis.thesis.status,
    report: formatRiskDecisionReport(analysis),
    analysis,
  };
}

function rowToRecord(row: RiskDecisionHistoryRow): RiskDecisionRecord {
  return {
    id: row.id,
    createdAt: row.created_at,
    ticker: row.ticker,
    stockName: row.stock_name,
    sector: row.sector,
    cmp: row.cmp != null ? Number(row.cmp) : null,
    quantitativeScore100: Number(row.quantitative_score_100),
    investmentVerdict: row.investment_verdict,
    thesisStatus: row.thesis_status,
    report: row.report,
    analysis: row.analysis,
  };
}

async function persistRecordToDisk(tenantId: string, record: RiskDecisionRecord): Promise<void> {
  const index = await readIndex(tenantId);
  const existing = index.entries.findIndex((e) => e.id === record.id);
  if (existing >= 0) index.entries[existing] = record;
  else index.entries.unshift(record);
  await writeIndex(tenantId, index);
  await writeTenantMarkdownFile(
    path.join(riskDecisionDir(tenantId), `${record.id}.md`),
    record.report
  );
}

async function fetchAllFromSupabase(userId: string): Promise<RiskDecisionRecord[]> {
  if (isSupabaseTableUnavailable(RISK_DECISION_HISTORY_TABLE)) return [];
  const supabase = await createClientIfConfigured();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(RISK_DECISION_HISTORY_TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    if (isMissingTableError(error)) {
      markSupabaseTableUnavailable(RISK_DECISION_HISTORY_TABLE);
      warnMissingTableOnce(RISK_DECISION_HISTORY_TABLE, '007_risk_decision_history.sql');
    }
    return [];
  }
  return (data as RiskDecisionHistoryRow[]).map(rowToRecord);
}

async function fetchOneFromSupabase(userId: string, id: string): Promise<RiskDecisionRecord | null> {
  if (isSupabaseTableUnavailable(RISK_DECISION_HISTORY_TABLE)) return null;
  const supabase = await createClientIfConfigured();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from(RISK_DECISION_HISTORY_TABLE)
    .select('*')
    .eq('user_id', userId)
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  return rowToRecord(data as RiskDecisionHistoryRow);
}

export async function saveRiskDecisionRecord(input: {
  tenantId: string;
  userId: string;
  authMode: 'supabase' | 'cookie-dev';
  analysis: RiskDecisionResult;
}): Promise<RiskDecisionRecord> {
  assertSafeTenantId(input.tenantId);
  const record = analysisToRecord(input.analysis);
  await persistRecordToDisk(input.tenantId, record);

  if (input.authMode === 'supabase') {
    const supabase = await createClientIfConfigured();
    if (supabase && !isSupabaseTableUnavailable(RISK_DECISION_HISTORY_TABLE)) {
      const { error } = await supabase.from(RISK_DECISION_HISTORY_TABLE).insert({
        id: record.id,
        user_id: input.userId,
        ticker: record.ticker,
        stock_name: record.stockName,
        sector: record.sector,
        cmp: record.cmp,
        quantitative_score_100: record.quantitativeScore100,
        investment_verdict: record.investmentVerdict,
        thesis_status: record.thesisStatus,
        report: record.report,
        analysis: record.analysis,
      });
      if (error && isMissingTableError(error)) {
        markSupabaseTableUnavailable(RISK_DECISION_HISTORY_TABLE);
        warnMissingTableOnce(RISK_DECISION_HISTORY_TABLE, '007_risk_decision_history.sql');
      }
    }
  }
  return record;
}

export async function listRiskDecisionRecords(
  tenantId: string,
  userId?: string,
  authMode?: 'supabase' | 'cookie-dev'
): Promise<RiskDecisionRecord[]> {
  assertSafeTenantId(tenantId);
  let entries = (await readIndex(tenantId)).entries;
  if (entries.length === 0 && authMode === 'supabase' && userId) {
    const remote = await fetchAllFromSupabase(userId);
    for (const r of remote) await persistRecordToDisk(tenantId, r);
    if (remote.length) entries = remote;
  }
  return entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getRiskDecisionRecord(
  tenantId: string,
  id: string,
  userId?: string,
  authMode?: 'supabase' | 'cookie-dev'
): Promise<RiskDecisionRecord | null> {
  const local = (await readIndex(tenantId)).entries.find((e) => e.id === id);
  if (local) return local;
  if (authMode === 'supabase' && userId) {
    const remote = await fetchOneFromSupabase(userId, id);
    if (remote) {
      await persistRecordToDisk(tenantId, remote);
      return remote;
    }
  }
  return null;
}

export function groupRiskDecisionByDate(
  entries: RiskDecisionRecord[]
): DateYearGroup<RiskDecisionRecord>[] {
  return groupByYearMonthDate(entries, (e) => e.createdAt);
}
