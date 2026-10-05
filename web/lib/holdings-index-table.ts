import { getCmpQuoteMap } from './cmp';
import { fetchIndexReturnMap, type IndexReturnSnapshot } from './index-benchmark-returns';
import { niftyIndexForSector, type NiftyIndexRef } from './nifty-index-map';
import {
  fetchStockReturnMap,
  formatReturnPct,
  formatSpreadPct,
  spreadPct,
  type PriceReturnSnapshot,
} from './price-return-snapshot';
import type { StockDashboardRow } from './portfolio-dashboard';

export interface HoldingsIndexTableRow {
  stockName: string;
  ticker: string;
  indexCategory: string;
  indexSymbol: string;
  qty: number;
  purchaseCost: number;
  currentValue: number | null;
  /** Weighted average cost per share (purchase cost ÷ qty). */
  avgCostPerShare: number | null;
  cmp: number | null;
  unrealizedPnlInr: number | null;
  /** (CMP − avg cost) / avg cost, or (value − cost) / cost. */
  vsCostPct: number | null;
  vsCostVariation: string;
  unrealizedPnlDisplay: string;
  avgCostDisplay: string;
  cmpDisplay: string;
  monthlyIndexVariation: string;
  monthlyStockVariation: string;
  monthlyStockVsIndex: string;
  yearlyIndexVariation: string;
  yearlyStockVariation: string;
  yearlyStockVsIndex: string;
  monthlySpreadPct: number | null;
  yearlySpreadPct: number | null;
  yearlyStockPct: number | null;
  yearlyIndexPct: number | null;
}

export interface VsIndexRankRow {
  rank: number;
  stockName: string;
  ticker: string;
  indexCategory: string;
  indexVariation: string;
  stockVariation: string;
  stockVsIndex: string;
  spreadPct: number;
}

/** @deprecated Use VsIndexRankRow */
export type YearlyVsIndexRankRow = VsIndexRankRow;

export interface HoldingsIndexTableResult {
  asOf: string;
  rows: HoldingsIndexTableRow[];
  indexNote: string;
  monthlyWorstVsIndex: VsIndexRankRow[];
  monthlyBestVsIndex: VsIndexRankRow[];
  yearlyWorstVsIndex: VsIndexRankRow[];
  yearlyBestVsIndex: VsIndexRankRow[];
}

const RANK_LIMIT = 5;

function formatInrPrice(n: number): string {
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatPnlInr(n: number | null): string {
  if (n == null) return '—';
  const sign = n >= 0 ? '+' : '-';
  return `${sign}₹${Math.abs(Math.round(n)).toLocaleString('en-IN')}`;
}

export function buildCostBasisFields(
  qty: number,
  purchaseCost: number,
  currentValue: number | null,
  cmp: number | null
): Pick<
  HoldingsIndexTableRow,
  | 'avgCostPerShare'
  | 'cmp'
  | 'unrealizedPnlInr'
  | 'vsCostPct'
  | 'vsCostVariation'
  | 'unrealizedPnlDisplay'
  | 'avgCostDisplay'
  | 'cmpDisplay'
> {
  const avgCostPerShare = qty > 0 && purchaseCost > 0 ? purchaseCost / qty : null;
  let vsCostPct: number | null = null;
  if (avgCostPerShare != null && avgCostPerShare > 0 && cmp != null) {
    vsCostPct = Math.round(((cmp - avgCostPerShare) / avgCostPerShare) * 1000) / 10;
  } else if (purchaseCost > 0 && currentValue != null) {
    vsCostPct = Math.round(((currentValue - purchaseCost) / purchaseCost) * 1000) / 10;
  }
  const unrealizedPnlInr =
    currentValue != null ? Math.round(currentValue - purchaseCost) : null;

  return {
    avgCostPerShare,
    cmp: cmp != null ? cmp : null,
    unrealizedPnlInr,
    vsCostPct,
    vsCostVariation: formatReturnPct(vsCostPct),
    unrealizedPnlDisplay: formatPnlInr(unrealizedPnlInr),
    avgCostDisplay:
      avgCostPerShare != null ? formatInrPrice(avgCostPerShare) : '—',
    cmpDisplay: cmp != null ? formatInrPrice(cmp) : '—',
  };
}

function rankVsIndex(
  rows: HoldingsIndexTableRow[],
  getSpread: (r: HoldingsIndexTableRow) => number | null,
  getDisplay: (r: HoldingsIndexTableRow) => {
    indexVariation: string;
    stockVariation: string;
    stockVsIndex: string;
  },
  limit = RANK_LIMIT
): { worst: VsIndexRankRow[]; best: VsIndexRankRow[] } {
  const eligible = rows.filter((r) => {
    const s = getSpread(r);
    return s != null && Number.isFinite(s);
  });

  const toRank = (sorted: HoldingsIndexTableRow[]): VsIndexRankRow[] =>
    sorted.slice(0, limit).map((r, i) => {
      const spread = getSpread(r)!;
      const display = getDisplay(r);
      return {
        rank: i + 1,
        stockName: r.stockName,
        ticker: r.ticker,
        indexCategory: r.indexCategory,
        ...display,
        spreadPct: spread,
      };
    });

  const bySpread = [...eligible].sort(
    (a, b) => getSpread(a)! - getSpread(b)!
  );
  return {
    worst: toRank(bySpread),
    best: toRank([...bySpread].reverse()),
  };
}

export function rankMonthlyVsIndex(
  rows: HoldingsIndexTableRow[],
  limit = RANK_LIMIT
): Pick<HoldingsIndexTableResult, 'monthlyWorstVsIndex' | 'monthlyBestVsIndex'> {
  const { worst, best } = rankVsIndex(
    rows,
    (r) => r.monthlySpreadPct,
    (r) => ({
      indexVariation: r.monthlyIndexVariation,
      stockVariation: r.monthlyStockVariation,
      stockVsIndex: r.monthlyStockVsIndex,
    }),
    limit
  );
  return { monthlyWorstVsIndex: worst, monthlyBestVsIndex: best };
}

export function rankYearlyVsIndex(
  rows: HoldingsIndexTableRow[],
  limit = RANK_LIMIT
): Pick<HoldingsIndexTableResult, 'yearlyWorstVsIndex' | 'yearlyBestVsIndex'> {
  const { worst, best } = rankVsIndex(
    rows,
    (r) => r.yearlySpreadPct,
    (r) => ({
      indexVariation: r.yearlyIndexVariation,
      stockVariation: r.yearlyStockVariation,
      stockVsIndex: r.yearlyStockVsIndex,
    }),
    limit
  );
  return { yearlyWorstVsIndex: worst, yearlyBestVsIndex: best };
}

function snapForIndex(
  map: Map<string, IndexReturnSnapshot>,
  index: NiftyIndexRef
): PriceReturnSnapshot {
  const hit = map.get(index.yahooSymbol);
  return hit ?? { dailyPct: null, monthlyPct: null, yearlyPct: null };
}

function buildRowFields(
  indexSnap: PriceReturnSnapshot,
  stockSnap: PriceReturnSnapshot
): Pick<
  HoldingsIndexTableRow,
  | 'monthlyIndexVariation'
  | 'monthlyStockVariation'
  | 'monthlyStockVsIndex'
  | 'yearlyIndexVariation'
  | 'yearlyStockVariation'
  | 'yearlyStockVsIndex'
  | 'monthlySpreadPct'
  | 'yearlySpreadPct'
  | 'yearlyStockPct'
  | 'yearlyIndexPct'
> {
  const monthlySpread = spreadPct(stockSnap.monthlyPct, indexSnap.monthlyPct);
  const yearlySpread = spreadPct(stockSnap.yearlyPct, indexSnap.yearlyPct);
  return {
    monthlyIndexVariation: formatReturnPct(indexSnap.monthlyPct),
    monthlyStockVariation: formatReturnPct(stockSnap.monthlyPct),
    monthlyStockVsIndex: formatSpreadPct(monthlySpread),
    yearlyIndexVariation: formatReturnPct(indexSnap.yearlyPct),
    yearlyStockVariation: formatReturnPct(stockSnap.yearlyPct),
    yearlyStockVsIndex: formatSpreadPct(yearlySpread),
    monthlySpreadPct: monthlySpread,
    yearlySpreadPct: yearlySpread,
    yearlyStockPct: stockSnap.yearlyPct,
    yearlyIndexPct: indexSnap.yearlyPct,
  };
}

export async function buildHoldingsIndexTableFromStocks(
  stocks: Pick<
    StockDashboardRow,
    'ticker' | 'company' | 'sector' | 'qty' | 'costBasis' | 'cmp' | 'currentValue'
  >[]
): Promise<HoldingsIndexTableResult> {
  const tickers = stocks.map((s) => s.ticker);
  const [cmpMap, indexReturns, stockReturns] = await Promise.all([
    getCmpQuoteMap(tickers),
    fetchIndexReturnMap(stocks.map((s) => niftyIndexForSector(s.sector))),
    fetchStockReturnMap(tickers),
  ]);

  const rows: HoldingsIndexTableRow[] = stocks.map((s) => {
    const index = niftyIndexForSector(s.sector);
    const indexSnap = snapForIndex(indexReturns, index);
    const stockSnap = stockReturns.get(s.ticker.toUpperCase()) ?? {
      dailyPct: null,
      monthlyPct: null,
      yearlyPct: null,
    };
    const quote = cmpMap.get(s.ticker.toUpperCase());
    const cmp = quote?.price ?? s.cmp;
    const cmpRounded = cmp != null ? Math.round(cmp * 100) / 100 : null;
    const currentValue =
      cmpRounded != null
        ? Math.round(s.qty * cmpRounded)
        : s.currentValue > 0
          ? s.currentValue
          : null;

    return {
      stockName: s.company,
      ticker: s.ticker,
      indexCategory: index.label,
      indexSymbol: index.yahooSymbol,
      qty: s.qty,
      purchaseCost: s.costBasis,
      currentValue,
      ...buildCostBasisFields(s.qty, s.costBasis, currentValue, cmpRounded),
      ...buildRowFields(indexSnap, stockSnap),
    };
  });

  rows.sort((a, b) => b.purchaseCost - a.purchaseCost);

  return {
    asOf: new Date().toISOString(),
    rows,
    ...rankMonthlyVsIndex(rows),
    ...rankYearlyVsIndex(rows),
    indexNote:
      'Vs cost % = (CMP − your avg cost) ÷ avg cost on deployed capital; P&L ₹ = current value − purchase cost. Market windows: stock/index % over ~21 sessions / ~12 months; “Stock vs index” = stock % minus index %. UNVERIFIED live data.',
  };
}
