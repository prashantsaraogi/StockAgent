import fs from 'fs/promises';
import path from 'path';
import { getUserPaths, assertSafeTenantId } from './tenant';
import { createClientIfConfigured } from './supabase/server';
import {
  isMissingTableError,
  isSupabaseTableUnavailable,
  markSupabaseTableUnavailable,
  warnMissingTableOnce,
} from './supabase/schema-errors';
import type {
  FullAnalysisChildIds,
  StockCalculatorFullRecord,
} from './stock-calculator-full-history';
import type { StockCalculatorFullResult } from './stock-calculator-full';

const FULL_HISTORY_TABLE = 'stock_calculator_full_history';

interface FullIndexFile {
  version: 1;
  entries: StockCalculatorFullRecord[];
}

interface FullHistoryRow {
  id: string;
  user_id: string;
  ticker: string;
  stock_name: string;
  sector: string;
  cmp: number | null;
  expected_cagr_pct: number;
  years: number;
  overview_verdict: string;
  child_ids: FullAnalysisChildIds;
  report: string;
  analysis: StockCalculatorFullResult;
  created_at: string;
}

function fullIndexPath(tenantId: string): string {
  return path.join(getUserPaths(tenantId).portfolioDir, '../stock-calculator/full/index.json');
}

async function readFullIndex(tenantId: string): Promise<FullIndexFile> {
  try {
    const raw = await fs.readFile(fullIndexPath(tenantId), 'utf8');
    const parsed = JSON.parse(raw) as FullIndexFile;
    if (parsed?.version === 1 && Array.isArray(parsed.entries)) return parsed;
  } catch {
    /* empty */
  }
  return { version: 1, entries: [] };
}

function rowToFullRecord(row: FullHistoryRow): StockCalculatorFullRecord {
  return {
    id: row.id,
    createdAt: row.created_at,
    ticker: row.ticker,
    stockName: row.stock_name,
    sector: row.sector,
    cmp: row.cmp != null ? Number(row.cmp) : null,
    expectedCagrPct: Number(row.expected_cagr_pct),
    years: Number(row.years),
    overviewVerdict: row.overview_verdict,
    childIds: row.child_ids,
    report: row.report,
    analysis: row.analysis,
  };
}

function childIdsInclude(childIds: FullAnalysisChildIds, childId: string): boolean {
  return (
    childIds.cagr === childId ||
    childIds.pe === childId ||
    childIds.earningsQuality === childId ||
    childIds.margin === childId ||
    childIds.businessQuality === childId ||
    childIds.riskDecision === childId
  );
}

async function fetchFullAnalysisByChildIdSupabase(
  userId: string,
  childId: string
): Promise<StockCalculatorFullRecord | null> {
  if (isSupabaseTableUnavailable(FULL_HISTORY_TABLE)) return null;
  const supabase = await createClientIfConfigured();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(FULL_HISTORY_TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(80);

  if (error) {
    if (isMissingTableError(error)) {
      markSupabaseTableUnavailable(FULL_HISTORY_TABLE);
      warnMissingTableOnce(FULL_HISTORY_TABLE, '009_stock_calculator_full_history.sql');
    }
    return null;
  }

  for (const row of (data ?? []) as FullHistoryRow[]) {
    const rec = rowToFullRecord(row);
    if (childIdsInclude(rec.childIds, childId)) return rec;
  }
  return null;
}

/** When per-module history is missing on serverless disk, load from saved full analysis. */
export async function findFullAnalysisByChildModuleId(
  tenantId: string,
  childId: string,
  userId?: string,
  authMode?: 'supabase' | 'cookie-dev'
): Promise<StockCalculatorFullRecord | null> {
  assertSafeTenantId(tenantId);
  for (const entry of (await readFullIndex(tenantId)).entries) {
    if (childIdsInclude(entry.childIds, childId)) return entry;
  }
  if (authMode === 'supabase' && userId) {
    return fetchFullAnalysisByChildIdSupabase(userId, childId);
  }
  return null;
}
