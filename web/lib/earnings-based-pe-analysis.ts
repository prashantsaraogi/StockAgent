/**
 * Earnings-based P/E vs market TTM P/E — Stock Analysis PE tab.
 * StockBook/QUARTERLY-RUN-RATE-PE.md · user framework (market cap ÷ annualised PAT).
 */

import { runEarningsQualityAnalysis } from './earnings-quality';
import { loadPeEvaluation } from './pe-evaluation';
import { fetchMarketCapCr } from './market-cap';
import { fetchLiveNseCmp, resolveNseSymbol } from './nse-cmp';
import { resolveStock } from './stock-search';
import { fetchYahooQuoteSummary } from './yahoo-finance-session';
import {
  computeQuarterlyRunRatePe,
  quarterlyRowsToRunRateInput,
  type RunRateQuarterCount,
} from './pe-quarterly-run-rate';

export type EvidenceLabel = 'FACT' | 'UNVERIFIED' | 'OUR ASSUMPTION';

export interface EarningsBasedPeQuarterRow {
  quarter: string;
  patCr: number | null;
  source: string;
  evidence: EvidenceLabel;
  periodEnded: string | null;
  announcedOn: string | null;
}

export interface EarningsBasedPeAnalysisResult {
  ticker: string;
  stockName: string;
  exchange: 'NSE';
  calculationDate: string;
  quarterCount: RunRateQuarterCount;
  quarters: EarningsBasedPeQuarterRow[];
  sumPatCr: number | null;
  annualisedPatCr: number | null;
  cmp: number | null;
  cmpDate: string | null;
  cmpSource: string;
  sharesCr: number | null;
  sharesSource: string;
  marketCapCr: number | null;
  marketCapSource: string;
  earningsBasedPe: number | null;
  ttmPe: number | null;
  ttmPeSource: string;
  peDifference: number | null;
  currentPeDiscountPremiumPct: number | null;
  conclusion: string;
  warnings: string[];
  limitations: string[];
  notes: string[];
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

async function fetchYahooCapAndShares(ticker: string): Promise<{
  marketCapCr: number | null;
  sharesCr: number | null;
  price: number | null;
  source: string;
}> {
  const nseSymbol = resolveNseSymbol(ticker);
  const summary = await fetchYahooQuoteSummary(nseSymbol, 'summaryDetail,defaultKeyStatistics,price');
  if (!summary) {
    return { marketCapCr: null, sharesCr: null, price: null, source: 'Yahoo Finance — unavailable' };
  }
  const summaryDetail = summary.summaryDetail as Record<string, { raw?: number; fmt?: string }> | undefined;
  const priceMod = summary.price as Record<string, { raw?: number }> | undefined;
  const stats = summary.defaultKeyStatistics as Record<string, { raw?: number }> | undefined;

  const mcapRaw = summaryDetail?.marketCap?.raw ?? priceMod?.marketCap?.raw;
  const marketCapCr =
    typeof mcapRaw === 'number' && mcapRaw > 0 ? Math.round(mcapRaw / 1e7) : null;

  const sharesRaw = stats?.sharesOutstanding?.raw;
  const sharesCr =
    typeof sharesRaw === 'number' && sharesRaw > 0
      ? Math.round((sharesRaw / 1e7) * 100) / 100
      : null;

  const price =
    priceMod?.regularMarketPrice?.raw ??
    summaryDetail?.previousClose?.raw ??
    null;

  return {
    marketCapCr,
    sharesCr,
    price: typeof price === 'number' && price > 0 ? price : null,
    source: 'Yahoo Finance (.NS) — cross-check with NSE/filings',
  };
}

function buildConclusion(
  stockName: string,
  earningsBasedPe: number | null,
  ttmPe: number | null,
  discountPremiumPct: number | null,
  quarterCount: number
): string {
  if (earningsBasedPe == null || ttmPe == null) {
    return `${stockName}: earnings-based P/E or market TTM P/E could not be fully verified — treat any partial figures as provisional.`;
  }
  const eb = earningsBasedPe.toFixed(2);
  const ttm = ttmPe.toFixed(2);
  if (discountPremiumPct == null) {
    return `${stockName}'s earnings-based P/E is approximately ${eb}× vs market TTM ${ttm}× (latest ${quarterCount} quarters annualised). This compares two earnings windows — not proof of undervaluation.`;
  }
  const abs = Math.abs(discountPremiumPct).toFixed(2);
  if (Math.abs(discountPremiumPct) < 0.05) {
    return `${stockName}'s earnings-based P/E (${eb}×) and market TTM P/E (${ttm}×) are effectively aligned on the selected inputs.`;
  }
  if (discountPremiumPct < 0) {
    return `${stockName}'s calculated earnings-based P/E is approximately ${eb}×, vs market TTM ${ttm}×. The current market multiple is about ${abs}% lower (discount vs the ${quarterCount}-quarter run-rate). This is not proof of undervaluation — TTM uses trailing earnings; the calculated P/E annualises the selected quarters.`;
  }
  return `${stockName}'s calculated earnings-based P/E is approximately ${eb}×, vs market TTM ${ttm}×. The current market multiple is about ${abs}% higher (premium vs the ${quarterCount}-quarter run-rate). Different earnings periods — not a fair-value verdict.`;
}

export async function runEarningsBasedPeAnalysis(
  tickerQuery: string,
  quarterCount: RunRateQuarterCount,
  tenantId: string
): Promise<EarningsBasedPeAnalysisResult | null> {
  const resolved = await resolveStock(tickerQuery.trim());
  if (!resolved) return null;

  const calculationDate = todayIsoDate();
  const limitations: string[] = [
    'Do not treat earnings-based P/E as fair value or a justified multiple.',
    'Market TTM P/E providers may use different earnings definitions than consolidated PAT.',
  ];

  const [peEval, eq, yahooCap, liveCmp, mcapFallback] = await Promise.all([
    loadPeEvaluation(resolved.ticker, tenantId),
    runEarningsQualityAnalysis({ ticker: resolved.ticker, tenantId }),
    fetchYahooCapAndShares(resolved.ticker),
    fetchLiveNseCmp(resolved.ticker).catch(() => null),
    fetchMarketCapCr(resolved.ticker),
  ]);

  let cmp: number | null = liveCmp?.price ?? peEval?.cmp ?? yahooCap.price ?? null;
  let cmpSource = liveCmp?.source ?? peEval?.cmpSource ?? yahooCap.source;
  let cmpDate: string | null = calculationDate;

  let marketCapCr = yahooCap.marketCapCr ?? mcapFallback;
  let marketCapSource = yahooCap.marketCapCr != null ? yahooCap.source : 'Yahoo / market data';
  let sharesCr = yahooCap.sharesCr;
  let sharesSource = sharesCr != null ? yahooCap.source : 'Not verified — infer from mcap ÷ CMP if needed';

  if (marketCapCr == null && cmp != null && sharesCr != null) {
    marketCapCr = Math.round(cmp * sharesCr);
    marketCapSource = 'CMP × shares outstanding (computed)';
  }

  if (sharesCr == null && marketCapCr != null && cmp != null && cmp > 0) {
    sharesCr = Math.round((marketCapCr / cmp) * 100) / 100;
    sharesSource = 'Implied from market cap ÷ CMP — verify in latest filing';
  }

  const eqRows = eq?.quarterly ?? [];
  const quarterInputs = quarterlyRowsToRunRateInput(eqRows);
  const quarterRows: EarningsBasedPeQuarterRow[] = eqRows.map((r) => ({
    quarter: r.quarter,
    patCr: r.pat,
    source: eq?.dataSource ?? 'Earnings Quality module',
    evidence: 'UNVERIFIED' as EvidenceLabel,
    periodEnded: null,
    announcedOn: null,
  }));

  const ttmPe = peEval?.ttmPe ?? liveCmp?.trailingPe ?? null;
  const ttmPeSource =
    peEval?.ttmPe != null
      ? `${peEval.cmpSource} / PARAMETERS`
      : liveCmp?.trailingPe != null
        ? liveCmp.source
        : 'Unavailable — verify on Moneycontrol / VRO';

  const computed = computeQuarterlyRunRatePe({
    cmp,
    marketCapCr,
    quarterCount,
    quarters: quarterInputs,
    sharesCr,
    ttmPeReference: ttmPe,
    trailingEpsReference: peEval?.trailingEps ?? liveCmp?.trailingEps ?? null,
  });

  const warnings = [...computed.warnings];
  if (eqRows.length === 0) {
    warnings.push('No quarterly PAT in StockBook — add EARNINGS_QUALITY section D or refresh Earnings Quality tab.');
  }
  if (marketCapCr == null) {
    warnings.push('Market capitalisation could not be verified — earnings-based P/E may be incomplete.');
  }
  if (ttmPe == null) {
    warnings.push('Market TTM P/E could not be verified — comparison row omitted or provisional.');
  }

  return {
    ticker: resolved.ticker,
    stockName: resolved.company,
    exchange: 'NSE',
    calculationDate,
    quarterCount,
    quarters: quarterRows.slice(-Math.max(quarterRows.length, quarterCount)),
    sumPatCr: computed.sumPatCr,
    annualisedPatCr: computed.annualisedPatCr,
    cmp,
    cmpDate,
    cmpSource,
    sharesCr,
    sharesSource,
    marketCapCr,
    marketCapSource,
    earningsBasedPe: computed.earningsBasedPe,
    ttmPe,
    ttmPeSource,
    peDifference: computed.peDifference,
    currentPeDiscountPremiumPct: computed.currentPeDiscountPremiumPct,
    conclusion: buildConclusion(
      resolved.company,
      computed.earningsBasedPe,
      ttmPe,
      computed.currentPeDiscountPremiumPct,
      quarterCount
    ),
    warnings,
    limitations,
    notes: computed.notes,
  };
}
