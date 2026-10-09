/**
 * Live earnings-quality metrics when EARNINGS_QUALITY_*.md / Part A table is missing.
 * Yahoo Finance quoteSummary ({TICKER}.NS) — aligned with margin-external-metrics.
 */

import { fetchYahooQuoteSummary, rawNum } from './yahoo-finance-session';
import type { EvidenceType, QuarterlyRow } from './earnings-quality';
import type { HistoricalYearRow } from './earnings-quality-parts';

export interface ExternalEarningsQualityMetrics {
  source: 'yahoo-finance';
  label: string;
  annualYears: HistoricalYearRow[];
  epsCagr5y: number | null;
  patCagr5y: number | null;
  revenueCagr5y: number | null;
  cfoPatRatio: number | null;
  latestEps: number | null;
  roePct: number | null;
  quarterly: QuarterlyRow[];
}

function yahooRawToCr(raw: number): number {
  if (raw >= 100_000) return Math.round((raw / 1e7) * 10) / 10;
  return Math.round(raw * 10) / 10;
}

function fiscalLabelFromEndDate(endDate: unknown): string {
  if (typeof endDate === 'object' && endDate !== null && 'fmt' in endDate) {
    const fmt = String((endDate as { fmt?: string }).fmt ?? '');
    const y = fmt.match(/(20\d{2})/);
    if (y) return `FY${y[1].slice(-2)}`;
  }
  return 'FY—';
}

function endDateKey(endDate: unknown): string {
  if (typeof endDate === 'object' && endDate !== null && 'fmt' in endDate) {
    return String((endDate as { fmt?: string }).fmt ?? '');
  }
  return '';
}

function cagrFromSeries(values: number[]): number | null {
  if (values.length < 2) return null;
  const first = values[0];
  const last = values[values.length - 1];
  if (first <= 0 || last <= 0) return null;
  const years = values.length - 1;
  return (Math.pow(last / first, 1 / years) - 1) * 100;
}

function qualityFromEpsYoY(yoy: number | null): HistoricalYearRow['qualitySignal'] {
  if (yoy == null) return '—';
  if (yoy >= 8) return '🟢';
  if (yoy >= 0) return '🟡';
  return '🔴';
}

function annualYearsFromYahoo(
  summary: Record<string, unknown>,
  sharesOutstanding: number | null
): HistoricalYearRow[] {
  const incomeMod = summary.incomeStatementHistory as
    | { incomeStatementHistory?: Record<string, unknown>[] }
    | undefined;
  const cashMod = summary.cashflowStatementHistory as
    | { cashflowStatements?: Record<string, unknown>[] }
    | undefined;

  const stmts = [...(incomeMod?.incomeStatementHistory ?? [])].slice(0, 6);
  const cashByDate = new Map<string, number>();
  for (const cf of cashMod?.cashflowStatements ?? []) {
    const ocf = rawNum(cf.totalCashFromOperatingActivities);
    const key = endDateKey(cf.endDate);
    if (ocf != null && key) cashByDate.set(key, ocf);
  }

  const rows: HistoricalYearRow[] = [];

  for (const stmt of stmts) {
    const revRaw = rawNum(stmt.totalRevenue);
    const patRaw = rawNum(stmt.netIncome);
    if (revRaw == null && patRaw == null) continue;

    const revenueCr = revRaw != null ? yahooRawToCr(revRaw) : null;
    const patCr = patRaw != null ? yahooRawToCr(patRaw) : null;

    let eps: number | null = null;
    const epsField = rawNum(stmt.dilutedEPS) ?? rawNum(stmt.basicEPS);
    if (epsField != null && epsField > 0 && epsField < 5000) {
      eps = Math.round(epsField * 100) / 100;
    } else if (patRaw != null && sharesOutstanding != null && sharesOutstanding > 0) {
      eps = Math.round((patRaw / sharesOutstanding) * 100) / 100;
    }

    const dateKey = endDateKey(stmt.endDate);
    const ocf = cashByDate.get(dateKey);
    let cfoPatRatio: number | null = null;
    if (ocf != null && patRaw != null && patRaw > 0) {
      cfoPatRatio = Math.round((ocf / patRaw) * 100) / 100;
    }

    rows.push({
      fiscalYear: fiscalLabelFromEndDate(stmt.endDate),
      revenueCr,
      patCr,
      eps,
      epsYoYPct: null,
      revenueYoYPct: null,
      cfoPatRatio,
      qualitySignal: '—',
      evidence: 'FACT' as EvidenceType,
      note: 'Yahoo incomeStatementHistory (annual)',
    });
  }

  rows.reverse();

  for (let i = 1; i < rows.length; i++) {
    const prev = rows[i - 1];
    const cur = rows[i];
    if (prev.eps != null && cur.eps != null && prev.eps > 0) {
      cur.epsYoYPct = Math.round(((cur.eps - prev.eps) / prev.eps) * 1000) / 10;
      cur.qualitySignal = qualityFromEpsYoY(cur.epsYoYPct);
    }
    if (prev.revenueCr != null && cur.revenueCr != null && prev.revenueCr > 0) {
      cur.revenueYoYPct = Math.round(((cur.revenueCr - prev.revenueCr) / prev.revenueCr) * 1000) / 10;
    }
  }

  return rows.slice(-5);
}

function quartersFromYahoo(summary: Record<string, unknown>): QuarterlyRow[] {
  const chart = summary.earningsChart as
    | { quarterly?: { date?: string; revenue?: unknown; earnings?: unknown }[] }
    | undefined;
  const quarterly = chart?.quarterly ?? [];
  const out: QuarterlyRow[] = [];

  for (const q of quarterly.slice(-8)) {
    const revRaw = rawNum(q.revenue);
    const earnRaw = rawNum(q.earnings);
    const dateStr = typeof q.date === 'string' ? q.date : '';
    const d = dateStr.match(/(20\d{2})-(\d{2})/);
    const month = d ? parseInt(d[2], 10) : 0;
    const fyYear = month >= 4 ? parseInt(d![1], 10) + 1 : parseInt(d![1], 10);
    const qNum = d ? Math.ceil(((month + 8) % 12) / 3) || 4 : 0;
    const label = d ? `Q${qNum} FY${String(fyYear).slice(-2)}` : dateStr || 'Q—';

    out.push({
      quarter: label,
      revenue: revRaw != null ? yahooRawToCr(revRaw) : null,
      ebitda: null,
      marginPct: null,
      pat: earnRaw != null ? yahooRawToCr(earnRaw) : null,
      eps: null,
      cfo: null,
    });
  }

  const isq = summary.incomeStatementHistoryQuarterly as
    | { incomeStatementHistory?: Record<string, unknown>[] }
    | undefined;
  if (out.length < 2 && isq?.incomeStatementHistory?.length) {
    for (const stmt of isq.incomeStatementHistory.slice(0, 8)) {
      const revRaw = rawNum(stmt.totalRevenue);
      const patRaw = rawNum(stmt.netIncome);
      const fmt =
        typeof stmt.endDate === 'object' && stmt.endDate !== null && 'fmt' in stmt.endDate
          ? String((stmt.endDate as { fmt?: string }).fmt ?? '')
          : '';
      const d = fmt.match(/(20\d{2})-(\d{2})/);
      const month = d ? parseInt(d[2], 10) : 0;
      const fyYear = d ? (month >= 4 ? parseInt(d[1], 10) + 1 : parseInt(d[1], 10)) : 0;
      const qNum = d ? Math.ceil(((month + 8) % 12) / 3) || 4 : 0;
      const label = d ? `Q${qNum} FY${String(fyYear).slice(-2)}` : fmt || 'Q—';
      out.push({
        quarter: label,
        revenue: revRaw != null ? yahooRawToCr(revRaw) : null,
        ebitda: null,
        marginPct: null,
        pat: patRaw != null ? yahooRawToCr(patRaw) : null,
        eps: null,
        cfo: null,
      });
    }
    out.reverse();
  }

  return out.slice(-8);
}

/** Fetch Yahoo when StockBook Part A table is missing or thin (< 3 FY rows). */
export function earningsQualityNeedsExternal(eqMd: string): boolean {
  if (!eqMd.trim()) return true;
  return parsePartARowCount(eqMd) < 3;
}

function parsePartARowCount(md: string): number {
  const section =
    md.match(/## Part A[^\n]*\n([\s\S]*?)(?=\n## Part B|\n## [A-D]\.|\n---\n|$)/i)?.[1] ?? '';
  let n = 0;
  for (const line of section.split('\n')) {
    if (/^\|\s*FY/i.test(line.trim()) && !/---/.test(line)) n++;
  }
  return n;
}

export async function fetchExternalEarningsQualityMetrics(
  nseSymbol: string
): Promise<ExternalEarningsQualityMetrics | null> {
  const summary = await fetchYahooQuoteSummary(
    nseSymbol,
    'financialData,defaultKeyStatistics,incomeStatementHistory,cashflowStatementHistory,earningsChart,incomeStatementHistoryQuarterly'
  );
  if (!summary) return null;

  const financial = summary.financialData as Record<string, unknown> | undefined;
  const stats = summary.defaultKeyStatistics as Record<string, unknown> | undefined;

  const sharesOutstanding = rawNum(stats?.sharesOutstanding);
  let annualYears = annualYearsFromYahoo(summary, sharesOutstanding);

  const epsSeries = annualYears.map((y) => y.eps).filter((v): v is number => v != null && v > 0);
  const patSeries = annualYears.map((y) => y.patCr).filter((v): v is number => v != null && v > 0);
  const revSeries = annualYears.map((y) => y.revenueCr).filter((v): v is number => v != null && v > 0);

  let epsCagr5y = cagrFromSeries(epsSeries);
  let patCagr5y = cagrFromSeries(patSeries);
  let revenueCagr5y = cagrFromSeries(revSeries);

  const earningsGrowth = rawNum(stats?.earningsQuarterlyGrowth);
  if (epsCagr5y == null && earningsGrowth != null) {
    const g = earningsGrowth > 1.5 ? earningsGrowth : earningsGrowth * 100;
    if (g > -50 && g < 80) epsCagr5y = Math.round(g * 10) / 10;
  }

  const revenueGrowth = rawNum(financial?.revenueGrowth);
  if (revenueCagr5y == null && revenueGrowth != null) {
    const g = revenueGrowth > 1.5 ? revenueGrowth : revenueGrowth * 100;
    if (g > -50 && g < 80) revenueCagr5y = Math.round(g * 10) / 10;
  }

  let latestEps = rawNum(stats?.trailingEps) ?? rawNum(financial?.revenuePerShare);
  if (latestEps != null && latestEps > 5000) latestEps = null;
  if (latestEps == null && epsSeries.length > 0) {
    latestEps = epsSeries[epsSeries.length - 1];
  }

  const cfoRatios = annualYears
    .map((y) => y.cfoPatRatio)
    .filter((v): v is number => v != null && v > 0 && v < 5);
  const cfoPatRatio =
    cfoRatios.length > 0
      ? Math.round((cfoRatios.reduce((a, b) => a + b, 0) / cfoRatios.length) * 100) / 100
      : null;

  const roeRaw = rawNum(financial?.returnOnEquity) ?? rawNum(stats?.returnOnEquity);
  const roePct =
    roeRaw != null ? (roeRaw <= 1.5 ? Math.round(roeRaw * 1000) / 10 : Math.round(roeRaw * 10) / 10) : null;

  const quarterly = quartersFromYahoo(summary);

  if (annualYears.length === 0 && epsCagr5y == null && latestEps == null && quarterly.length === 0) {
    return null;
  }

  return {
    source: 'yahoo-finance',
    label: 'Yahoo Finance — income & cashflow history',
    annualYears,
    epsCagr5y: epsCagr5y != null ? Math.round(epsCagr5y * 10) / 10 : null,
    patCagr5y: patCagr5y != null ? Math.round(patCagr5y * 10) / 10 : null,
    revenueCagr5y: revenueCagr5y != null ? Math.round(revenueCagr5y * 10) / 10 : null,
    cfoPatRatio,
    latestEps: latestEps != null ? Math.round(latestEps * 100) / 100 : null,
    roePct,
    quarterly,
  };
}
