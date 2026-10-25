/**
 * Quarterly consolidated PAT → annualised earnings → run-rate P/E vs TTM reference.
 * StockBook/QUARTERLY-RUN-RATE-PE.md
 */

import type { QuarterlyRow } from './earnings-quality';

export type RunRateQuarterCount = 2 | 3 | 4 | 6;

export interface RunRateQuarterInput {
  quarter: string;
  patCr: number | null;
  eps: number | null;
}

export interface QuarterlyRunRatePeInput {
  cmp?: number | null;
  /** Market cap (₹ cr) — preferred for earnings-based P/E per framework. */
  marketCapCr?: number | null;
  quarterCount: RunRateQuarterCount;
  /** Oldest → newest; only the last `quarterCount` rows are used. */
  quarters: RunRateQuarterInput[];
  /** Diluted shares (crore). Optional if run-rate EPS is taken from quarterly EPS sum. */
  sharesCr?: number | null;
  /** Conventional TTM P/E from PARAMETERS / quote (comparison only). */
  ttmPeReference?: number | null;
  /** TTM EPS from PARAMETERS / quote — used to infer shares when sharesCr omitted. */
  trailingEpsReference?: number | null;
}

export interface QuarterlyRunRatePeResult {
  quarterCount: RunRateQuarterCount;
  usedQuarters: RunRateQuarterInput[];
  sumPatCr: number | null;
  annualisedPatCr: number | null;
  runRateEps: number | null;
  /** Earnings-based P/E = market cap ÷ annualised PAT (primary). */
  earningsBasedPe: number | null;
  /** @deprecated alias */
  runRatePe: number | null;
  ttmPeReference: number | null;
  /** Current TTM P/E − earnings-based P/E (× points). */
  peDifference: number | null;
  /** [(TTM ÷ earnings-based) − 1] × 100 — negative = discount. */
  currentPeDiscountPremiumPct: number | null;
  /** Legacy spread vs TTM — same as currentPeDiscountPremiumPct. */
  spreadVsTtmPct: number | null;
  epsSource: 'pat_and_shares' | 'quarterly_eps' | null;
  sharesCrUsed: number | null;
  annualisationFactor: number;
  warnings: string[];
  notes: string[];
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function inferSharesCrFromTtm(
  annualisedPatCr: number,
  trailingEps: number | null | undefined
): number | null {
  if (trailingEps == null || !Number.isFinite(trailingEps) || trailingEps <= 0) return null;
  if (annualisedPatCr <= 0) return null;
  return round2(annualisedPatCr / trailingEps);
}

export function annualisedPatFromSum(sumPatCr: number, quarterCount: RunRateQuarterCount): number {
  if (quarterCount === 4) return round2(sumPatCr);
  return round2((sumPatCr / quarterCount) * 4);
}

export function computeQuarterlyRunRatePe(input: QuarterlyRunRatePeInput): QuarterlyRunRatePeResult {
  const { cmp = null, marketCapCr = null, quarterCount, ttmPeReference = null, trailingEpsReference = null } =
    input;
  const warnings: string[] = [];
  const notes: string[] = [];
  const annualisationFactor = 4 / quarterCount;

  const slice = input.quarters.slice(-quarterCount);
  const usedQuarters = slice.length === quarterCount ? slice : input.quarters.slice(-slice.length);

  if (usedQuarters.length < quarterCount) {
    warnings.push(
      `Only ${usedQuarters.length} quarter(s) available — need ${quarterCount} for this window.`
    );
  }

  const patValues = usedQuarters.map((q) => q.patCr);
  const allPat = patValues.every((p) => p != null && Number.isFinite(p));
  const sumPatCr = allPat
    ? round1(patValues.reduce((a, b) => a! + b!, 0)!)
    : null;

  const annualisedPatCr =
    sumPatCr != null ? annualisedPatFromSum(sumPatCr, quarterCount) : null;

  let runRateEps: number | null = null;
  let epsSource: QuarterlyRunRatePeResult['epsSource'] = null;
  let sharesCrUsed: number | null =
    input.sharesCr != null && Number.isFinite(input.sharesCr) && input.sharesCr > 0
      ? input.sharesCr
      : null;

  if (annualisedPatCr != null && annualisedPatCr > 0) {
    if (sharesCrUsed == null) {
      sharesCrUsed = inferSharesCrFromTtm(annualisedPatCr, trailingEpsReference);
      if (sharesCrUsed != null) {
        notes.push('Diluted shares (cr) inferred from annualised PAT ÷ TTM EPS — verify in AR.');
      }
    }
    if (sharesCrUsed != null && sharesCrUsed > 0) {
      runRateEps = round2(annualisedPatCr / sharesCrUsed);
      epsSource = 'pat_and_shares';
    }
  }

  if (runRateEps == null) {
    const epsValues = usedQuarters.map((q) => q.eps);
    const allEps = epsValues.every((e) => e != null && Number.isFinite(e) && e > 0);
    if (allEps) {
      const sumEps = epsValues.reduce((a, b) => a! + b!, 0)!;
      runRateEps =
        quarterCount === 4 ? round2(sumEps) : round2(sumEps * annualisationFactor);
      epsSource = 'quarterly_eps';
    } else if (!allPat) {
      warnings.push('Enter consolidated PAT (₹ cr) for each quarter or verified quarterly EPS.');
    }
  }

  let earningsBasedPe: number | null = null;
  if (
    annualisedPatCr != null &&
    annualisedPatCr > 0 &&
    marketCapCr != null &&
    Number.isFinite(marketCapCr) &&
    marketCapCr > 0
  ) {
    earningsBasedPe = round2(marketCapCr / annualisedPatCr);
  } else if (runRateEps != null && runRateEps > 0 && cmp != null && Number.isFinite(cmp) && cmp > 0) {
    earningsBasedPe = round1(cmp / runRateEps);
    notes.push('Earnings-based P/E from CMP ÷ run-rate EPS — provide market cap for framework-primary method.');
  }

  const runRatePe = earningsBasedPe;

  if (quarterCount === 2) {
    notes.push('N=2: H1 annualised run-rate — seasonality may distort full-year PAT.');
  }
  if (quarterCount === 3) {
    notes.push('N=3: nine-month window annualised — use with explicit seasonality assumption.');
  }
  if (quarterCount === 6) {
    notes.push('N=6: longer smoothing window — not comparable to exchange TTM P/E.');
  }
  if (quarterCount === 4 && earningsBasedPe != null && ttmPeReference != null) {
    notes.push('N=4: earnings-based P/E should align with TTM when PAT and market cap match the quote provider.');
  }

  const peDifference =
    ttmPeReference != null && earningsBasedPe != null
      ? round2(ttmPeReference - earningsBasedPe)
      : null;

  const currentPeDiscountPremiumPct =
    ttmPeReference != null && earningsBasedPe != null && earningsBasedPe > 0
      ? round2(((ttmPeReference / earningsBasedPe) - 1) * 100)
      : null;

  const spreadVsTtmPct = currentPeDiscountPremiumPct;

  return {
    quarterCount,
    usedQuarters,
    sumPatCr,
    annualisedPatCr,
    runRateEps,
    earningsBasedPe,
    runRatePe,
    ttmPeReference,
    peDifference,
    currentPeDiscountPremiumPct,
    spreadVsTtmPct,
    epsSource,
    sharesCrUsed,
    annualisationFactor,
    warnings,
    notes,
  };
}

export function quarterlyRowsToRunRateInput(rows: QuarterlyRow[]): RunRateQuarterInput[] {
  return rows.map((r) => ({
    quarter: r.quarter,
    patCr: r.pat,
    eps: r.eps,
  }));
}

export function fmtRunRatePe(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return `${n.toFixed(1)}×`;
}
