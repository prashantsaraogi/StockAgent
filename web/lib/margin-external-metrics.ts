/**
 * Live margin / profitability metrics when StockBook PARAMETERS Block B is empty.
 * Primary source: Yahoo Finance quoteSummary ({TICKER}.NS) — same stack as CMP / mcap.
 */

import { fetchYahooQuoteSummary, rawNum } from './yahoo-finance-session';
import type { EvidenceType, MarginYearRow } from './margin-analysis';

export interface ExternalMarginTtm {
  ebitdaMarginPct: number | null;
  netMarginPct: number | null;
  grossMarginPct: number | null;
  operatingMarginPct: number | null;
  roePct: number | null;
  roaPct: number | null;
}

export interface ExternalMarginMetrics {
  source: 'yahoo-finance';
  label: string;
  ttm: ExternalMarginTtm;
  /** Up to 5 annual rows from Yahoo incomeStatementHistory. */
  historyYears: MarginYearRow[];
  avg5yEbitdaPct: number | null;
  avg5yNetPct: number | null;
}

function pctFromRatio(n: number | null): number | null {
  if (n == null || !Number.isFinite(n)) return null;
  if (n > 0 && n <= 1.5) return Math.round(n * 1000) / 10;
  if (n > 1.5 && n <= 100) return Math.round(n * 10) / 10;
  return null;
}

function fiscalLabelFromEndDate(endDate: unknown): string {
  if (typeof endDate === 'object' && endDate !== null && 'fmt' in endDate) {
    const fmt = String((endDate as { fmt?: string }).fmt ?? '');
    const y = fmt.match(/(20\d{2})/);
    if (y) return `FY${y[1].slice(-2)}`;
  }
  return 'FY—';
}

function rowsFromIncomeHistory(summary: Record<string, unknown>): MarginYearRow[] {
  const mod = summary.incomeStatementHistory as
    | { incomeStatementHistory?: Record<string, unknown>[] }
    | undefined;
  const stmts = mod?.incomeStatementHistory ?? [];
  const rows: MarginYearRow[] = [];

  for (const stmt of stmts.slice(0, 6)) {
    const rev = rawNum(stmt.totalRevenue);
    if (rev == null || rev <= 0) continue;

    const ebitda = rawNum(stmt.ebitda);
    const gross = rawNum(stmt.grossProfit);
    const net = rawNum(stmt.netIncome);
    const ebit = rawNum(stmt.ebit);

    const ebitdaPct = ebitda != null ? Math.round((ebitda / rev) * 1000) / 10 : null;
    const grossPct = gross != null ? Math.round((gross / rev) * 1000) / 10 : null;
    const netPct = net != null ? Math.round((net / rev) * 1000) / 10 : null;
    const ebitPct = ebit != null ? Math.round((ebit / rev) * 1000) / 10 : null;

    if (ebitdaPct == null && netPct == null) continue;
    if ((ebitdaPct ?? netPct ?? 0) > 80 || (ebitdaPct ?? netPct ?? 0) < -20) continue;

    rows.push({
      fiscalYear: fiscalLabelFromEndDate(stmt.endDate),
      grossPct,
      ebitdaPct: ebitdaPct ?? netPct,
      ebitPct,
      netPct,
      ebitdaDeltaPp: null,
      signal: '🟡',
      evidence: 'FACT' as EvidenceType,
      note: 'Yahoo incomeStatementHistory (annual)',
    });
  }

  rows.reverse();
  for (let i = 1; i < rows.length; i++) {
    const prev = rows[i - 1].ebitdaPct;
    const cur = rows[i].ebitdaPct;
    if (prev != null && cur != null) {
      rows[i].ebitdaDeltaPp = Math.round((cur - prev) * 10) / 10;
      rows[i].signal =
        rows[i].ebitdaDeltaPp! > 0.3 ? '🟢' : rows[i].ebitdaDeltaPp! < -0.3 ? '🔴' : '🟡';
    }
  }

  return rows.slice(-5);
}

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
}

/** Fetch TTM margins + up to 5Y annual history from Yahoo (.NS). */
export async function fetchExternalMarginMetrics(
  nseSymbol: string,
  isFinancial: boolean
): Promise<ExternalMarginMetrics | null> {
  const summary = await fetchYahooQuoteSummary(
    nseSymbol,
    'financialData,defaultKeyStatistics,incomeStatementHistory'
  );
  if (!summary) return null;

  const financial = summary.financialData as Record<string, unknown> | undefined;
  const stats = summary.defaultKeyStatistics as Record<string, unknown> | undefined;

  const ttm: ExternalMarginTtm = {
    ebitdaMarginPct: pctFromRatio(rawNum(financial?.ebitdaMargins)),
    netMarginPct: pctFromRatio(rawNum(financial?.profitMargins)),
    grossMarginPct: pctFromRatio(rawNum(financial?.grossMargins)),
    operatingMarginPct: pctFromRatio(rawNum(financial?.operatingMargins)),
    roePct: pctFromRatio(rawNum(financial?.returnOnEquity) ?? rawNum(stats?.returnOnEquity)),
    roaPct: pctFromRatio(rawNum(financial?.returnOnAssets)),
  };

  const historyYears = rowsFromIncomeHistory(summary);
  const ebitdaSeries = historyYears.map((y) => y.ebitdaPct).filter((v): v is number => v != null);
  const netSeries = historyYears.map((y) => y.netPct).filter((v): v is number => v != null);

  const hasTtm =
    ttm.ebitdaMarginPct != null ||
    ttm.netMarginPct != null ||
    ttm.roePct != null ||
    ttm.operatingMarginPct != null;

  if (!hasTtm && historyYears.length === 0) return null;

  const primaryForFin = isFinancial && ttm.roePct != null ? 'ROE (Yahoo TTM)' : 'EBITDA margin (Yahoo TTM)';

  return {
    source: 'yahoo-finance',
    label: primaryForFin,
    ttm,
    historyYears,
    avg5yEbitdaPct: avg(ebitdaSeries),
    avg5yNetPct: avg(netSeries),
  };
}

export function partBNeedsExternal(rows: { todayPct: number | null; avg10yPct: number | null }[]): boolean {
  if (rows.length === 0) return true;
  const useful = rows.some((r) => r.todayPct != null || r.avg10yPct != null);
  return !useful;
}
