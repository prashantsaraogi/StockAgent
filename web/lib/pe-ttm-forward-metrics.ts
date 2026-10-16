/**
 * TTM P/E (trailing) vs Forward P/E (normalized / estimate) — shown together across Stock Analysis.
 */

import type { StockCalculatorFullResult } from './stock-calculator-full';
export interface TtmForwardPeMetrics {
  ttmPe: number | null;
  forwardPe: number | null;
  avg10yPe: number | null;
  forwardFairPe: number | null;
  /** Forward P/E minus TTM P/E (× points, not percent). */
  spreadTimes: number | null;
  /** (Forward P/E − forward fair P/E) / forward fair P/E */
  premiumForwardVsFairPct: number | null;
  /** (TTM P/E − 10Y reference) / 10Y reference */
  premiumTtmVs10yPct: number | null;
  ttmLabel: string;
  forwardLabel: string;
}

function num(v: number | null | undefined): number | null {
  if (v == null || !Number.isFinite(v) || v <= 0) return null;
  return v;
}

export function resolveTtmForwardPeMetrics(
  analysis: Pick<StockCalculatorFullResult, 'peParameters' | 'cagr'>
): TtmForwardPeMetrics {
  const pe = analysis.peParameters;
  const snap = analysis.cagr.snapshot;
  const ext = pe.externalSupplement;
  const fwdTab = analysis.cagr.tabAnalysis?.forward;

  const parsePeCell = (raw: string | null | undefined): number | null => {
    if (!raw) return null;
    const m = raw.replace(/,/g, '').match(/([\d.]+)\s*×/i);
    return m ? num(parseFloat(m[1])) : null;
  };

  const ttmPe =
    num(pe.ttmPe) ??
    num(snap.ttmPe) ??
    num(ext?.trailingPe ?? null);

  let forwardPe =
    num(pe.forwardPe) ??
    num(snap.forwardPe) ??
    parsePeCell(fwdTab?.forwardPe ?? null) ??
    num(ext?.forwardPe ?? null);

  if (forwardPe == null && pe.cmp != null && pe.normalizedEps != null && pe.normalizedEps > 0) {
    forwardPe = Math.round((pe.cmp / pe.normalizedEps) * 10) / 10;
  }

  const avg10yPe = num(pe.avg10yPe) ?? num(snap.avg10yPe) ?? num(pe.median10yPe);
  const forwardFairPe =
    num(pe.forwardFairPe) ??
    num(snap.forwardFairPe) ??
    parsePeCell(fwdTab?.forwardFairPe ?? null);

  const spreadTimes =
    ttmPe != null && forwardPe != null ? Math.round((forwardPe - ttmPe) * 10) / 10 : null;

  const premiumForwardVsFairPct =
    forwardPe != null && forwardFairPe != null && forwardFairPe > 0
      ? Math.round(((forwardPe - forwardFairPe) / forwardFairPe) * 1000) / 10
      : null;

  const premiumTtmVs10yPct = pe.premiumTo10yPct ?? null;

  return {
    ttmPe,
    forwardPe,
    avg10yPe,
    forwardFairPe,
    spreadTimes,
    premiumForwardVsFairPct,
    premiumTtmVs10yPct,
    ttmLabel: 'TTM P/E',
    forwardLabel: 'Forward P/E',
  };
}

export function fmtPeTimes(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return `${n.toFixed(1)}×`;
}

export function fmtSpreadTimes(spread: number | null): string | null {
  if (spread == null || !Number.isFinite(spread)) return null;
  const sign = spread > 0 ? '+' : '';
  return `${sign}${spread.toFixed(1)}× vs TTM`;
}
