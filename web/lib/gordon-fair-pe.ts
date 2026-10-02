/**
 * Gordon-style fair P/E anchor:
 *   Fair P/E = 1 / (Required Return − Long-term Earnings Growth)
 *
 * Required return = nominal hurdle (e.g. 12%) — not inflation + extra unless user defines it that way.
 * Earnings growth = sustainable long-term EPS growth — not peak FY forecast.
 *
 * Simplified valuation model — confirmatory only; not a buy signal alone.
 */

export interface GordonFairPeInput {
  /** Nominal required return, percent (e.g. 12 = 12%) */
  requiredReturnPct: number;
  /** Long-term sustainable earnings growth, percent (e.g. 8 = 8%) */
  earningsGrowthPct: number;
}

export interface GordonFairPeResult {
  fairPe: number | null;
  invalid: boolean;
  invalidReason: string | null;
  /** Required return − growth (percentage points) */
  spreadPct: number;
}

export interface GordonSensitivityRow {
  earningsGrowthPct: number;
  fairPe: number | null;
  invalid: boolean;
}

export interface GordonPeComparison {
  currentPe: number;
  fairPe: number;
  premiumToFairPct: number;
  verdict: string;
  tone: 'good' | 'neutral' | 'warn' | 'bad';
}

export const GORDON_DEFAULT_REQUIRED_RETURN_PCT = 12;
export const GORDON_DEFAULT_EARNINGS_GROWTH_PCT = 8;
export const GORDON_SENSITIVITY_GROWTH_PCTS = [6, 7, 8, 9, 10] as const;
/** PE levels for implied-growth sensitivity (inverse Gordon) */
export const GORDON_PE_SENSITIVITY_LEVELS = [20, 35, 60, 100] as const;

export interface GordonImpliedGrowthResult {
  /** G = R − 1/PE (percent) */
  impliedGrowthPct: number | null;
  /** Earnings yield = 100/PE (percent) */
  earningsYieldPct: number | null;
  invalid: boolean;
  invalidReason: string | null;
}

export interface GordonGrowthGapComparison {
  impliedGrowthPct: number;
  expectedGrowthPct: number;
  /** Expected − implied (percentage points) */
  gapPp: number;
  verdict: string;
  tone: 'good' | 'neutral' | 'warn' | 'bad';
}

export interface GordonPeImpliedRow {
  pe: number;
  earningsYieldPct: number;
  impliedGrowthPct: number | null;
  invalid: boolean;
}

export function computeGordonFairPe(input: GordonFairPeInput): GordonFairPeResult {
  const spreadPct = input.requiredReturnPct - input.earningsGrowthPct;

  if (!Number.isFinite(input.requiredReturnPct) || !Number.isFinite(input.earningsGrowthPct)) {
    return {
      fairPe: null,
      invalid: true,
      invalidReason: 'Enter valid numbers for required return and earnings growth.',
      spreadPct,
    };
  }

  if (spreadPct <= 0) {
    return {
      fairPe: null,
      invalid: true,
      invalidReason:
        'Growth ≥ required return — Gordon formula undefined. Lower growth or raise required return.',
      spreadPct,
    };
  }

  const fairPe = 100 / spreadPct;
  return {
    fairPe: Math.round(fairPe * 10) / 10,
    invalid: false,
    invalidReason: null,
    spreadPct,
  };
}

export function buildGordonSensitivityTable(
  requiredReturnPct: number,
  growthValues: readonly number[] = GORDON_SENSITIVITY_GROWTH_PCTS
): GordonSensitivityRow[] {
  return growthValues.map((g) => {
    const r = computeGordonFairPe({
      requiredReturnPct,
      earningsGrowthPct: g,
    });
    return {
      earningsGrowthPct: g,
      fairPe: r.fairPe,
      invalid: r.invalid,
    };
  });
}

export function comparePeToGordonFair(
  currentPe: number,
  fairPe: number
): GordonPeComparison {
  const premiumToFairPct = ((currentPe - fairPe) / fairPe) * 100;

  let verdict: string;
  let tone: GordonPeComparison['tone'];

  if (premiumToFairPct <= -15) {
    verdict = 'Below Gordon fair P/E — cheap vs this hurdle (confirm with PARAMETERS + PCCL)';
    tone = 'good';
  } else if (premiumToFairPct <= 10) {
    verdict = 'Around Gordon fair P/E — roughly fair under these assumptions';
    tone = 'neutral';
  } else if (premiumToFairPct <= 25) {
    verdict = 'Above Gordon fair P/E — premium vs simplified fair value';
    tone = 'warn';
  } else {
    verdict = 'Well above Gordon fair P/E — expensive vs this growth/hurdle pair';
    tone = 'bad';
  }

  return {
    currentPe,
    fairPe,
    premiumToFairPct: Math.round(premiumToFairPct * 10) / 10,
    verdict,
    tone,
  };
}

/**
 * Inverse Gordon — implied sustainable EPS growth at current P/E:
 *   G = R − 1/PE   (all in percent: G = R% − 100/PE)
 *
 * Example: R=12%, PE=35 → G = 12 − 2.86 = 9.14%
 */
export function computeImpliedGrowthFromPe(
  requiredReturnPct: number,
  currentPe: number
): GordonImpliedGrowthResult {
  if (!Number.isFinite(requiredReturnPct) || !Number.isFinite(currentPe) || currentPe <= 0) {
    return {
      impliedGrowthPct: null,
      earningsYieldPct: null,
      invalid: true,
      invalidReason: 'Enter valid required return and positive P/E.',
    };
  }

  const earningsYieldPct = 100 / currentPe;
  const impliedGrowthPct = requiredReturnPct - earningsYieldPct;

  if (impliedGrowthPct < 0) {
    return {
      impliedGrowthPct: Math.round(impliedGrowthPct * 100) / 100,
      earningsYieldPct: Math.round(earningsYieldPct * 100) / 100,
      invalid: true,
      invalidReason:
        'Earnings yield exceeds required return — P/E too low for this hurdle or assumptions inconsistent.',
    };
  }

  if (impliedGrowthPct >= requiredReturnPct) {
    return {
      impliedGrowthPct: Math.round(impliedGrowthPct * 100) / 100,
      earningsYieldPct: Math.round(earningsYieldPct * 100) / 100,
      invalid: true,
      invalidReason: 'Implied growth ≥ required return — check P/E input.',
    };
  }

  return {
    impliedGrowthPct: Math.round(impliedGrowthPct * 100) / 100,
    earningsYieldPct: Math.round(earningsYieldPct * 100) / 100,
    invalid: false,
    invalidReason: null,
  };
}

/** Compare PARAMETERS / thesis EPS growth vs growth implied by current P/E. */
export function compareImpliedToExpectedGrowth(
  impliedGrowthPct: number,
  expectedGrowthPct: number
): GordonGrowthGapComparison {
  const gapPp = Math.round((expectedGrowthPct - impliedGrowthPct) * 100) / 100;

  let verdict: string;
  let tone: GordonGrowthGapComparison['tone'];

  if (gapPp >= 2) {
    verdict =
      'Expected growth exceeds implied — current P/E may be justified at this hurdle (verify AUM/fees/cycle)';
    tone = 'good';
  } else if (gapPp >= -1) {
    verdict =
      'Expected growth ≈ implied — P/E roughly consistent with hurdle; confirm with PARAMETERS + PCCL';
    tone = 'neutral';
  } else if (gapPp >= -3) {
    verdict =
      'Expected growth below implied — need faster EPS path than thesis to justify P/E at 12% hurdle';
    tone = 'warn';
  } else {
    verdict =
      'Expected growth well below implied — high P/E demands more growth than base case delivers';
    tone = 'bad';
  }

  return {
    impliedGrowthPct,
    expectedGrowthPct,
    gapPp,
    verdict,
    tone,
  };
}

export function buildPeImpliedGrowthTable(
  requiredReturnPct: number,
  peLevels: readonly number[] = GORDON_PE_SENSITIVITY_LEVELS
): GordonPeImpliedRow[] {
  return peLevels.map((pe) => {
    const r = computeImpliedGrowthFromPe(requiredReturnPct, pe);
    return {
      pe,
      earningsYieldPct: r.earningsYieldPct ?? 0,
      impliedGrowthPct: r.impliedGrowthPct,
      invalid: r.invalid,
    };
  });
}

/** Parse PARAMETERS forward EPS CAGR cell → percent number, else null. */
export function parseEarningsGrowthDefault(epsCagrCell: string | null | undefined): number {
  if (!epsCagrCell) return GORDON_DEFAULT_EARNINGS_GROWTH_PCT;
  const m = epsCagrCell.replace(/,/g, '').match(/(-?\d+(?:\.\d+)?)/);
  if (!m) return GORDON_DEFAULT_EARNINGS_GROWTH_PCT;
  const n = parseFloat(m[1]);
  if (!Number.isFinite(n) || n <= 0 || n >= 20) return GORDON_DEFAULT_EARNINGS_GROWTH_PCT;
  return n;
}
