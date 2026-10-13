export function formatInr(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`;
}

export function formatGainInr(n: number | null): string {
  if (n == null) return '—';
  const sign = n >= 0 ? '+' : '−';
  return `${sign}${formatInr(Math.abs(Math.round(n)))}`;
}

export function formatGainPct(pct: number | null): string {
  if (pct == null) return '—';
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
}

/** Portfolio lot CAGR above this is treated as not meaningful (e.g. 1-day annualized blow-up). */
export const MAX_MEANINGFUL_CAGR_PCT = 100;

/** Do not annualize returns until the lot is held at least this long. */
export const MIN_HOLDING_DAYS_FOR_CAGR = 30;

export function sanitizeCagrPct(cagr: number | null | undefined): number | null {
  if (cagr == null || !Number.isFinite(cagr)) return null;
  if (Math.abs(cagr) > MAX_MEANINGFUL_CAGR_PCT) return null;
  return cagr;
}

export function formatCagr(pct: number | null): string {
  if (pct == null) return '—';
  if (!Number.isFinite(pct) || Math.abs(pct) > MAX_MEANINGFUL_CAGR_PCT) return 'N/A';
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
}

export function gainClass(n: number | null): string {
  if (n == null) return '';
  if (n > 0) return 'gain-pos';
  if (n < 0) return 'gain-neg';
  return '';
}

/** Weighted average by cost basis; skips null values. */
export function weightedAverage(
  items: { weight: number; value: number | null }[]
): number | null {
  let wSum = 0;
  let vSum = 0;
  for (const { weight, value } of items) {
    if (value == null || weight <= 0) continue;
    wSum += weight;
    vSum += weight * value;
  }
  if (wSum <= 0) return null;
  return Math.round((vSum / wSum) * 10) / 10;
}
