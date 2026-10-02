import type { HoldingLot } from './holding-lots';

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
  if (days <= 0) {
    return {
      holdingYears: 0,
      simpleReturnPct: ((cmp - lot.price) / lot.price) * 100,
      cagrPct: null,
    };
  }

  const years = days / 365.25;
  const simpleReturnPct = ((cmp - lot.price) / lot.price) * 100;
  const cagrPct = (Math.pow(cmp / lot.price, 1 / years) - 1) * 100;

  return {
    holdingYears: Math.round(years * 100) / 100,
    simpleReturnPct: Math.round(simpleReturnPct * 10) / 10,
    cagrPct: Math.round(cagrPct * 10) / 10,
  };
}

export { formatCagr, formatGainInr, formatGainPct, gainClass } from './format-gain';
