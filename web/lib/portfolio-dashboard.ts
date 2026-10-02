import { listLotsWithMetrics, aggregateRows } from './holding-lots';
import { getStockbookByTicker } from './stockbook-index';
import { toSlug } from './navigation';
import { weightedAverage } from './format-gain';
import { assertSafeTenantId } from './tenant';
import type { CmpSource } from './cmp-labels';

export interface SectorDashboardRow {
  sector: string;
  stockCount: number;
  allocationPct: number;
  currentValue: number;
  costBasis: number;
  absoluteGain: number | null;
  gainPct: number | null;
}

export interface LotDashboardRow {
  id: string;
  purchaseDate: string;
  qty: number;
  price: number;
  costBasis: number;
  cmp: number | null;
  cmpSource: CmpSource | null;
  cmpAsOf: string | null;
  currentValue: number;
  absoluteGain: number | null;
  gainPct: number | null;
  cagrPct: number | null;
  holdingYears: number | null;
  legacy?: boolean;
}

export interface StockDashboardRow {
  ticker: string;
  company: string;
  sector: string;
  sectorSlug: string;
  stockSlug: string;
  qty: number;
  avgCost: number;
  costBasis: number;
  cmp: number | null;
  cmpSource: CmpSource | null;
  cmpAsOf: string | null;
  currentValue: number;
  absoluteGain: number | null;
  gainPct: number | null;
  cagrPct: number | null;
  allocationPct: number;
  lotCount: number;
  lots: LotDashboardRow[];
}

export interface PortfolioDashboard {
  totalStocks: number;
  totalLots: number;
  totalSectors: number;
  totalCostBasis: number;
  totalCurrentValue: number;
  absoluteGain: number | null;
  gainPct: number | null;
  overallCagrPct: number | null;
  cmpCoveragePct: number;
  cmpLivePct: number;
  cmpRefreshNote: string;
  sectors: SectorDashboardRow[];
  stocks: StockDashboardRow[];
}

function lotCurrentValue(lot: { qty: number; cmp: number | null; price: number }): number {
  const unit = lot.cmp ?? lot.price;
  return Math.round(lot.qty * unit);
}

function lotAbsoluteGain(
  lot: { qty: number; price: number; cmp: number | null },
  costBasis: number
): number | null {
  if (lot.cmp == null) return null;
  return Math.round(lot.qty * lot.cmp - costBasis);
}

function lotGainPct(lot: { price: number; cmp: number | null }): number | null {
  if (lot.cmp == null) return null;
  return Math.round(((lot.cmp - lot.price) / lot.price) * 1000) / 10;
}

/** Full dashboard: gains, overall CAGR, sector charts, per-stock detail with lots. */
export async function getPortfolioDashboard(tenantId: string): Promise<PortfolioDashboard> {
  assertSafeTenantId(tenantId);
  const lots = await listLotsWithMetrics(tenantId);
  const summary = aggregateRows(lots);

  if (lots.length === 0) {
    return {
      totalStocks: 0,
      totalLots: 0,
      totalSectors: 0,
      totalCostBasis: 0,
      totalCurrentValue: 0,
      absoluteGain: null,
      gainPct: null,
      overallCagrPct: null,
      cmpCoveragePct: 0,
      cmpLivePct: 0,
      cmpRefreshNote: '',
      sectors: [],
      stocks: [],
    };
  }

  const lotsByTicker = new Map<string, typeof lots>();
  for (const lot of lots) {
    const key = lot.ticker.toUpperCase();
    const arr = lotsByTicker.get(key) ?? [];
    arr.push(lot);
    lotsByTicker.set(key, arr);
  }

  let totalCurrentValue = 0;
  let totalCostBasis = 0;
  let cmpHits = 0;
  let nseLiveHits = 0;
  const stockRows: StockDashboardRow[] = [];

  for (const agg of summary) {
    const tickerLots = lotsByTicker.get(agg.ticker.toUpperCase()) ?? [];
    const cmp = tickerLots[0]?.cmp ?? null;
    const cmpSource = tickerLots[0]?.cmpSource ?? null;
    const cmpAsOf = tickerLots[0]?.cmpAsOf ?? null;
    if (cmp != null) cmpHits += 1;
    if (cmpSource === 'nse' || cmpSource === 'nse-yahoo') nseLiveHits += 1;

    const costBasis = agg.costBasis;
    const currentValue = cmp != null ? Math.round(agg.qty * cmp) : costBasis;
    const absoluteGain = cmp != null ? currentValue - costBasis : null;
    const gainPct =
      absoluteGain != null && costBasis > 0
        ? Math.round((absoluteGain / costBasis) * 1000) / 10
        : null;

    const lotRows: LotDashboardRow[] = tickerLots.map((lot) => {
      const cv = lotCurrentValue(lot);
      const ag = lotAbsoluteGain(lot, lot.costBasis);
      return {
        id: lot.id,
        purchaseDate: lot.purchaseDate,
        qty: lot.qty,
        price: lot.price,
        costBasis: lot.costBasis,
        cmp: lot.cmp,
        cmpSource: lot.cmpSource,
        cmpAsOf: lot.cmpAsOf,
        currentValue: cv,
        absoluteGain: ag,
        gainPct: lotGainPct(lot),
        cagrPct: lot.cagrPct,
        holdingYears: lot.holdingYears,
        legacy: lot.legacy,
      };
    });

    const stockCagr = weightedAverage(
      lotRows.map((l) => ({ weight: l.costBasis, value: l.cagrPct }))
    );

    const loc = await getStockbookByTicker(agg.ticker);
    const sector = loc?.sector ?? agg.holdingsSector;
    const company = loc?.stock ?? agg.company;

    totalCurrentValue += currentValue;
    totalCostBasis += costBasis;

    stockRows.push({
      ticker: agg.ticker,
      company,
      sector,
      sectorSlug: toSlug(sector),
      stockSlug: toSlug(company),
      qty: agg.qty,
      avgCost: agg.avgCost,
      costBasis,
      cmp,
      cmpSource,
      cmpAsOf,
      currentValue,
      absoluteGain,
      gainPct,
      cagrPct: stockCagr,
      allocationPct: 0,
      lotCount: lotRows.length,
      lots: lotRows.sort((a, b) => a.purchaseDate.localeCompare(b.purchaseDate)),
    });
  }

  stockRows.sort((a, b) => b.currentValue - a.currentValue);
  for (const s of stockRows) {
    s.allocationPct =
      totalCurrentValue > 0
        ? Math.round((s.currentValue / totalCurrentValue) * 1000) / 10
        : 0;
  }

  const absoluteGain =
    totalCurrentValue > totalCostBasis || cmpHits > 0
      ? totalCurrentValue - totalCostBasis
      : null;
  const gainPct =
    absoluteGain != null && totalCostBasis > 0
      ? Math.round((absoluteGain / totalCostBasis) * 1000) / 10
      : null;

  const overallCagr = weightedAverage(
    stockRows.flatMap((s) =>
      s.lots.map((l) => ({ weight: l.costBasis, value: l.cagrPct }))
    )
  );

  const sectorMap = new Map<
    string,
    { stockCount: number; currentValue: number; costBasis: number }
  >();
  for (const s of stockRows) {
    const prev = sectorMap.get(s.sector) ?? {
      stockCount: 0,
      currentValue: 0,
      costBasis: 0,
    };
    prev.stockCount += 1;
    prev.currentValue += s.currentValue;
    prev.costBasis += s.costBasis;
    sectorMap.set(s.sector, prev);
  }

  const sectors: SectorDashboardRow[] = [...sectorMap.entries()]
    .map(([sector, v]) => {
      const ag = v.currentValue - v.costBasis;
      return {
        sector,
        stockCount: v.stockCount,
        allocationPct:
          totalCurrentValue > 0
            ? Math.round((v.currentValue / totalCurrentValue) * 1000) / 10
            : 0,
        currentValue: Math.round(v.currentValue),
        costBasis: v.costBasis,
        absoluteGain: Math.round(ag),
        gainPct:
          v.costBasis > 0 ? Math.round((ag / v.costBasis) * 1000) / 10 : null,
      };
    })
    .sort((a, b) => b.currentValue - a.currentValue);

  const cmpRefreshNote =
    nseLiveHits > 0
      ? `CMP: live NSE quotes for ${nseLiveHits}/${stockRows.length} tickers (refreshed each page load, 5 min cache).`
      : cmpHits > 0
        ? 'CMP: StockBook fallback — NSE fetch unavailable for this session.'
        : 'CMP: unavailable — check network or ticker symbols.';

  return {
    totalStocks: stockRows.length,
    totalLots: lots.length,
    totalSectors: sectors.length,
    totalCostBasis,
    totalCurrentValue: Math.round(totalCurrentValue),
    absoluteGain: absoluteGain != null ? Math.round(absoluteGain) : null,
    gainPct,
    overallCagrPct: overallCagr,
    cmpCoveragePct: Math.round((cmpHits / stockRows.length) * 100),
    cmpLivePct: Math.round((nseLiveHits / stockRows.length) * 100),
    cmpRefreshNote,
    sectors,
    stocks: stockRows,
  };
}
