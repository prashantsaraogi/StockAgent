import type { HoldingLot } from './holding-lots';
import {
  MIN_HOLDING_DAYS_FOR_CAGR,
  sanitizeCagrPct,
} from './format-gain';

/** Per-lot holding return metrics (CAGR-FRAMEWORK.md). */
export function calcLotCagr(
  lot: Pick<HoldingLot, 'price' | 'purchaseDate'>,
  cmp: number | null,
  asOf: Date = new Date()
): {
  holdingYears: number | null;
  simpleReturnPct: number | null;
  cagrPct: number | null;
} {
  if (!cmp || cmp <= 0 || lot.price <= 0) {
    return { holdingYears: null, simpleReturnPct: null, cagrPct: null };
  }

  const buyDate = new Date(`${lot.purchaseDate}T00:00:00`);
  if (Number.isNaN(buyDate.getTime())) {
    return { holdingYears: null, simpleReturnPct: null, cagrPct: null };
  }

  const days =
    (asOf.getTime() - buyDate.getTime()) / (1000 * 60 * 60 * 24);
  const simpleReturnPct = ((cmp - lot.price) / lot.price) * 100;
  const simpleRounded = Math.round(simpleReturnPct * 10) / 10;

  if (days <= 0) {
    return {
      holdingYears: 0,
      simpleReturnPct: simpleRounded,
      cagrPct: null,
    };
  }

  const years = days / 365.25;

  if (days < MIN_HOLDING_DAYS_FOR_CAGR) {
    return {
      holdingYears: Math.round(years * 100) / 100,
      simpleReturnPct: simpleRounded,
      cagrPct: null,
    };
  }

  const rawCagr = (Math.pow(cmp / lot.price, 1 / years) - 1) * 100;
  const cagrPct = sanitizeCagrPct(Math.round(rawCagr * 10) / 10);

  return {
    holdingYears: Math.round(years * 100) / 100,
    simpleReturnPct: simpleRounded,
    cagrPct,
  };
}

export { formatCagr, formatGainInr, formatGainPct, gainClass } from './format-gain';
