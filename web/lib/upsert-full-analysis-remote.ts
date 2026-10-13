/**
 * Persist a full analysis row to Supabase (session-cache recovery on serverless).
 */

import { createClientIfConfigured } from './supabase/server';
import {
  isMissingTableError,
  isSupabaseTableUnavailable,
  markSupabaseTableUnavailable,
  warnMissingTableOnce,
} from './supabase/schema-errors';
import type { StockCalculatorFullRecord } from './stock-calculator-full-history';
import { formatFullAnalysisReport } from './stock-calculator-full-history';
import type { CachedFullAnalysis } from './stock-full-analysis-session-cache';

const FULL_HISTORY_TABLE = 'stock_calculator_full_history';

export function cachedPayloadToFullRecord(c: CachedFullAnalysis): StockCalculatorFullRecord {
  return {
    id: c.id,
    createdAt: c.createdAt,
    ticker: c.ticker,
    stockName: c.stockName,
    sector: c.sector,
    cmp: c.analysis.cagr?.snapshot?.cmp ?? null,
    expectedCagrPct: c.analysis.inputs.expectedCagrPct,
    years: c.analysis.inputs.years,
    overviewVerdict: c.analysis.overview.cagrVerdict,
    childIds: c.childIds,
    report: formatFullAnalysisReport(c.analysis),
    analysis: c.analysis,
  };
}

export async function upsertFullAnalysisRecordRemote(
  userId: string,
  record: StockCalculatorFullRecord
): Promise<{ ok: boolean; error?: string }> {
  if (isSupabaseTableUnavailable(FULL_HISTORY_TABLE)) {
    return { ok: false, error: 'History table unavailable' };
  }
  const supabase = await createClientIfConfigured();
  if (!supabase) return { ok: false, error: 'Supabase not configured' };

  const row = {
    id: record.id,
    user_id: userId,
    ticker: record.ticker,
    stock_name: record.stockName,
    sector: record.sector,
    cmp: record.cmp,
    expected_cagr_pct: record.expectedCagrPct,
    years: record.years,
    overview_verdict: record.overviewVerdict,
    child_ids: record.childIds,
    report: record.report,
    analysis: record.analysis,
    created_at: record.createdAt,
  };

  const { error } = await supabase.from(FULL_HISTORY_TABLE).upsert(row, { onConflict: 'id' });

  if (error) {
    if (isMissingTableError(error)) {
      markSupabaseTableUnavailable(FULL_HISTORY_TABLE);
      warnMissingTableOnce(FULL_HISTORY_TABLE, '009_stock_calculator_full_history.sql');
    }
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
