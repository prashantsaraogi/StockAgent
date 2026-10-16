/**
 * Fill PARAMETERS gaps from Yahoo Finance (.NS) — same trusted stack as CMP / Margin tab.
 * Cross-check VRO / Moneycontrol manually; this avoids blank Overview cells on serverless.
 */

import { resolveNseSymbol } from './nse-cmp';
import {
  fetchYahooChartCloses,
  snapshotFromCloses,
} from './price-return-snapshot';
import { fetchYahooQuoteSummary, rawNum } from './yahoo-finance-session';

export interface ParameterExternalSupplement {
  source: 'yahoo-finance';
  trailingPe: number | null;
  forwardPe: number | null;
  trailingEps: number | null;
  earningsYieldPct: number | null;
  roePct: number | null;
  operatingMarginPct: number | null;
  ebitdaMarginPct: number | null;
  earningsGrowthPct: number | null;
  revenueGrowthPct: number | null;
  pegRatio: number | null;
  priceReturn1yPct: number | null;
  priceReturn1mPct: number | null;
}

function pctFromRatio(raw: number | null): number | null {
  if (raw == null || !Number.isFinite(raw)) return null;
  if (Math.abs(raw) <= 1.5) return Math.round(raw * 1000) / 10;
  return Math.round(raw * 10) / 10;
}

export async function fetchParameterExternalSupplement(
  ticker: string
): Promise<ParameterExternalSupplement | null> {
  try {
    const nse = resolveNseSymbol(ticker);
    const [summary, closes] = await Promise.all([
      fetchYahooQuoteSummary(
        ticker,
        'summaryDetail,defaultKeyStatistics,financialData,price'
      ),
      fetchYahooChartCloses(`${nse}.NS`),
    ]);
    const returns = snapshotFromCloses(closes);
    if (!summary) return null;

    const detail = summary.summaryDetail as Record<string, unknown> | undefined;
    const stats = summary.defaultKeyStatistics as Record<string, unknown> | undefined;
    const financial = summary.financialData as Record<string, unknown> | undefined;

    const trailingEps = rawNum(stats?.trailingEps) ?? rawNum(financial?.epsTrailingTwelveMonths);
    let trailingPe =
      rawNum(detail?.trailingPE) ??
      rawNum(stats?.trailingPE) ??
      rawNum(financial?.trailingPE);
    const forwardPe =
      rawNum(detail?.forwardPE) ??
      rawNum(stats?.forwardPE) ??
      rawNum(financial?.forwardPE);

    const price =
      rawNum(detail?.regularMarketPrice) ??
      rawNum((summary.price as Record<string, unknown> | undefined)?.regularMarketPrice);

    if (trailingPe == null && price != null && trailingEps != null) {
      trailingPe = Math.round((price / trailingEps) * 10) / 10;
    }

    const earningsYieldPct =
      trailingPe != null && trailingPe > 0 ? Math.round((100 / trailingPe) * 10) / 10 : null;

    const roePct = pctFromRatio(rawNum(financial?.returnOnEquity));
    const operatingMarginPct = pctFromRatio(rawNum(financial?.operatingMargins));
    const ebitdaMarginPct = pctFromRatio(rawNum(financial?.ebitdaMargins));

    const earningsGrowthPct = pctFromRatio(
      rawNum(financial?.earningsGrowth) ?? rawNum(stats?.earningsQuarterlyGrowth)
    );
    const revenueGrowthPct = pctFromRatio(rawNum(financial?.revenueGrowth));

    const pegRaw = rawNum(stats?.pegRatio) ?? rawNum(detail?.pegRatio);

    return {
      source: 'yahoo-finance',
      trailingPe,
      forwardPe,
      trailingEps,
      earningsYieldPct,
      roePct,
      operatingMarginPct,
      ebitdaMarginPct,
      earningsGrowthPct,
      revenueGrowthPct,
      pegRatio: pegRaw != null ? Math.round(pegRaw * 100) / 100 : null,
      priceReturn1yPct: returns?.yearlyPct ?? null,
      priceReturn1mPct: returns?.monthlyPct ?? null,
    };
  } catch {
    return null;
  }
}
