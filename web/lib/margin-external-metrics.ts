/**
 * Live margin / profitability metrics when StockBook PARAMETERS Block B is empty.
 * Primary source: Yahoo Finance quoteSummary ({TICKER}.NS) — same stack as CMP / mcap.
 */

import { fetchYahooQuoteSummary, rawNum } from './yahoo-finance-session';
import type { EvidenceType, MarginSignal, MarginYearRow } from './margin-analysis';

export interface ExternalMarginTtm {
  ebitdaMarginPct: number | null;
  netMarginPct: number | null;
  grossMarginPct: number | null;
  operatingMarginPct: number | null;
  roePct: number | null;
  roaPct: number | null;
}

export interface ExternalQuarterRow {
  quarter: string;
  revenue: number | null;
  marginPct: number | null;
}

export interface ExternalMarginMetrics {
  source: 'yahoo-finance';
  label: string;
  ttm: ExternalMarginTtm;
  /** Up to 5 annual rows from Yahoo incomeStatementHistory. */
  historyYears: MarginYearRow[];
  avg5yEbitdaPct: number | null;
  avg5yNetPct: number | null;
  avg5yGrossPct: number | null;
  avg5yOperatingPct: number | null;
  avg5yEbitPct: number | null;
  quarterly: ExternalQuarterRow[];
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
    const grossProfit = rawNum(stmt.grossProfit);
    const cogs = rawNum(stmt.costOfRevenue);
    const grossAbs =
      grossProfit ?? (cogs != null ? rev - cogs : null);
    const net = rawNum(stmt.netIncome);
    const ebit = rawNum(stmt.ebit) ?? rawNum(stmt.operatingIncome);

    const grossPct =
      grossAbs != null ? Math.round((grossAbs / rev) * 1000) / 10 : null;
    const netPct = net != null ? Math.round((net / rev) * 1000) / 10 : null;
    const ebitPct = ebit != null ? Math.round((ebit / rev) * 1000) / 10 : null;
    let ebitdaPct = ebitda != null ? Math.round((ebitda / rev) * 1000) / 10 : null;
    if (ebitdaPct == null && ebitPct != null) ebitdaPct = ebitPct;
    if (ebitdaPct == null && netPct != null) ebitdaPct = netPct;

    if (ebitdaPct == null && netPct == null) continue;
    if ((ebitdaPct ?? netPct ?? 0) > 95 || (ebitdaPct ?? netPct ?? 0) < -20) continue;

    rows.push({
      fiscalYear: fiscalLabelFromEndDate(stmt.endDate),
      grossPct,
      ebitdaPct,
      ebitPct: ebitPct ?? (ebitdaPct != null ? Math.round(ebitdaPct * 0.92 * 10) / 10 : null),
      netPct,
      ebitdaDeltaPp: null,
      signal: '🟡',
      evidence: 'FACT' as EvidenceType,
      note: 'Yahoo incomeStatementHistory (annual)',
    });
  }

  rows.reverse();
  for (let i = 0; i < rows.length; i++) {
    if (i === 0) {
      rows[i].ebitdaDeltaPp = 0;
      continue;
    }
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

function enrichHistoryWithTtm(rows: MarginYearRow[], ttm: ExternalMarginTtm): MarginYearRow[] {
  return rows.map((r) => ({
    ...r,
    grossPct: r.grossPct ?? ttm.grossMarginPct,
    ebitPct: r.ebitPct ?? ttm.operatingMarginPct ?? r.ebitdaPct,
    ebitdaPct: r.ebitdaPct ?? ttm.ebitdaMarginPct ?? r.netPct,
    netPct: r.netPct ?? ttm.netMarginPct,
  }));
}

function quartersFromYahoo(summary: Record<string, unknown>, marginPct: number | null): ExternalQuarterRow[] {
  const chart = summary.earningsChart as
    | { quarterly?: { date?: string; revenue?: unknown; earnings?: unknown }[] }
    | undefined;
  const quarterly = chart?.quarterly ?? [];
  const out: ExternalQuarterRow[] = [];

  for (const q of quarterly.slice(-8)) {
    const revRaw = rawNum(q.revenue);
    const revenue =
      revRaw != null
        ? revRaw > 1_000_000
          ? Math.round(revRaw / 10_000_000) / 10
          : Math.round(revRaw / 10) / 10
        : null;
    const earn = rawNum(q.earnings);
    let mPct = marginPct;
    if (earn != null && revRaw != null && revRaw > 0) {
      mPct = Math.round((earn / revRaw) * 1000) / 10;
    }
    const dateStr = typeof q.date === 'string' ? q.date : '';
    const d = dateStr.match(/(20\d{2})-(\d{2})/);
    const label = d ? `Q${Math.ceil(parseInt(d[2], 10) / 3)} FY${d[1].slice(-2)}` : dateStr || 'Q—';

    out.push({ quarter: label, revenue, marginPct: mPct });
  }

  return out.slice(-8);
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
    'financialData,defaultKeyStatistics,incomeStatementHistory,earningsChart'
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

  let historyYears = enrichHistoryWithTtm(rowsFromIncomeHistory(summary), ttm);
  const ebitdaSeries = historyYears.map((y) => y.ebitdaPct).filter((v): v is number => v != null);
  const netSeries = historyYears.map((y) => y.netPct).filter((v): v is number => v != null);
  const grossSeries = historyYears.map((y) => y.grossPct).filter((v): v is number => v != null);
  const ebitSeries = historyYears.map((y) => y.ebitPct).filter((v): v is number => v != null);
  const opProxySeries = historyYears
    .map((y) => y.ebitPct ?? y.ebitdaPct)
    .filter((v): v is number => v != null);

  const latest = historyYears[historyYears.length - 1];
  if (ttm.ebitdaMarginPct == null) {
    ttm.ebitdaMarginPct = latest?.ebitdaPct ?? null;
  }
  if (ttm.netMarginPct == null) {
    ttm.netMarginPct = latest?.netPct ?? null;
  }
  if (ttm.grossMarginPct == null) {
    ttm.grossMarginPct = latest?.grossPct ?? null;
  }
  if (ttm.operatingMarginPct == null) {
    ttm.operatingMarginPct = latest?.ebitPct ?? latest?.ebitdaPct ?? null;
  }

  const quarterly = quartersFromYahoo(summary, ttm.netMarginPct ?? ttm.ebitdaMarginPct);

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
    avg5yGrossPct: avg(grossSeries),
    avg5yOperatingPct: avg(opProxySeries),
    avg5yEbitPct: avg(ebitSeries),
    quarterly,
  };
}

/** Fill missing today/avg/delta on Part B rows using Yahoo snapshot. */
export function completeExternalMarginRows(
  rows: {
    metric: string;
    todayPct: number | null;
    avg10yPct: number | null;
    deltaPp: number | null;
    read: string;
    signal: MarginSignal;
  }[],
  ext: ExternalMarginMetrics
): typeof rows {
  const latest = ext.historyYears[ext.historyYears.length - 1];
  const map: Record<string, { today: number | null; avg: number | null }> = {
    'EBITDA margin': {
      today: ext.ttm.ebitdaMarginPct ?? latest?.ebitdaPct ?? null,
      avg: ext.avg5yEbitdaPct,
    },
    'Net margin': {
      today: ext.ttm.netMarginPct ?? latest?.netPct ?? null,
      avg: ext.avg5yNetPct,
    },
    'Gross margin': {
      today: ext.ttm.grossMarginPct ?? latest?.grossPct ?? null,
      avg: ext.avg5yGrossPct,
    },
    'Operating margin': {
      today: ext.ttm.operatingMarginPct ?? latest?.ebitPct ?? latest?.ebitdaPct ?? null,
      avg: ext.avg5yOperatingPct,
    },
    ROE: { today: ext.ttm.roePct, avg: null },
    ROA: { today: ext.ttm.roaPct, avg: null },
  };

  return rows.map((r) => {
    const m = map[r.metric];
    if (!m) return r;
    const todayPct = r.todayPct ?? m.today;
    const avg10yPct = r.avg10yPct ?? m.avg;
    const deltaPp =
      todayPct != null && avg10yPct != null
        ? Math.round((todayPct - avg10yPct) * 10) / 10
        : r.deltaPp;
    let signal = r.signal;
    if (deltaPp != null) {
      if (deltaPp >= 1) signal = '🟢';
      else if (deltaPp <= -3) signal = '🔴';
      else if (deltaPp <= -1) signal = '🟡';
      else signal = '🟢';
    }
    return {
      ...r,
      todayPct,
      avg10yPct,
      deltaPp,
      signal,
      read:
        r.read.includes('Refresh') || r.read === '—'
          ? 'Yahoo Finance · TTM + 5Y annual avg proxy for 10Y normal'
          : r.read,
    };
  });
}

export function partBNeedsExternal(rows: { todayPct: number | null; avg10yPct: number | null }[]): boolean {
  if (rows.length === 0) return true;
  const useful = rows.some((r) => r.todayPct != null || r.avg10yPct != null);
  return !useful;
}
