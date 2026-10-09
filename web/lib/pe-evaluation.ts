import { readStockTabContent } from './content';
import { getStockbookByTicker } from './stockbook-index';
import { resolveStock } from './stock-search';
import { fetchLiveNseCmp } from './nse-cmp';
import { enrichParametersPeMetrics, parseParametersMetrics } from './stock-calculator-engine';
import { getBundledParametersMd } from './load-bundled-stockbook';
import {
  parseForwardGrowthTab,
  parseHistoricalGrowthTab,
  type ForwardGrowthTab,
  type HistoricalGrowthTab,
} from './stock-calculator-tabs';
import { stockbookPath } from './navigation';
import { parseMedian10yPeFromMd, resolve10yPeReference } from './pe-history-reference';

export interface PeEvaluationResult {
  ticker: string;
  stockName: string;
  sector: string;
  sectorSlug: string;
  stockSlug: string;
  parametersFile: string | null;
  parametersDate: string | null;
  cmp: number | null;
  cmpSource: string;
  /** TTM EPS from live quote or PARAMETERS when available */
  trailingEps: number | null;
  ttmPe: number | null;
  forwardPe: number | null;
  avg10yPe: number | null;
  median10yPe: number | null;
  forwardFairPe: number | null;
  normalizedEps: number | null;
  framework5yFairPrice: number | null;
  premiumTo10yPct: number | null;
  historical: HistoricalGrowthTab;
  forward: ForwardGrowthTab;
  stockbookParametersUrl: string;
}

export async function loadPeEvaluation(
  query: string,
  tenantId: string
): Promise<PeEvaluationResult | null> {
  const resolved = await resolveStock(query.trim());
  if (!resolved) return null;

  const loc = await getStockbookByTicker(resolved.ticker);
  const sector = loc?.sector ?? resolved.sector;
  const stockName = loc?.stock ?? resolved.company;

  const parameters = await readStockTabContent(sector, stockName, 'parameters', tenantId);
  const md = parameters?.content ?? getBundledParametersMd(resolved.ticker) ?? null;

  let detailMd: string | null = null;
  if (!md || !parseMedian10yPeFromMd(md)) {
    const detail = await readStockTabContent(sector, stockName, 'detail', tenantId);
    detailMd = detail?.content ?? null;
  }

  const metrics = md ? parseParametersMetrics(md) : {
    ttmPe: null,
    forwardPe: null,
    avg10yPe: null,
    median10yPe: null,
    forwardFairPe: null,
    normalizedEps: null,
    framework5yFairPrice: null,
    parametersDate: null,
  };

  if (!metrics.median10yPe && detailMd) {
    metrics.median10yPe = parseMedian10yPeFromMd(detailMd);
  }

  let cmp: number | null = null;
  let cmpSource = 'Unavailable';
  let trailingEps: number | null = metrics.normalizedEps;
  try {
    const live = await fetchLiveNseCmp(resolved.ticker);
    if (live?.price != null && live.price > 0) {
      cmp = live.price;
      cmpSource = live.source;
      if (live.trailingEps != null && live.trailingEps > 0) {
        trailingEps = live.trailingEps;
      }
      if (metrics.ttmPe == null && live.trailingPe != null && live.trailingPe > 0) {
        metrics.ttmPe = live.trailingPe;
      }
      if (
        metrics.ttmPe == null &&
        live.trailingEps != null &&
        live.trailingEps > 0
      ) {
        metrics.ttmPe = Math.round((live.price / live.trailingEps) * 10) / 10;
      }
    }
  } catch {
    /* fallback below */
  }

  if (cmp == null && md) {
    const cmpMatch = md.match(/\*\*CMP:\*\*\s*Rs\.?\s*([\d,]+(?:\.\d+)?)/i);
    if (cmpMatch) {
      cmp = parseFloat(cmpMatch[1].replace(/,/g, ''));
      cmpSource = 'PARAMETERS file';
    }
  }

  enrichParametersPeMetrics(metrics, cmp, trailingEps);

  const histRef = resolve10yPeReference(metrics);
  const premiumTo10yPct =
    metrics.ttmPe != null && histRef.value != null && histRef.value > 0
      ? ((metrics.ttmPe - histRef.value) / histRef.value) * 100
      : null;

  const sectorSlug = sector.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const stockSlug = stockName.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  return {
    ticker: resolved.ticker,
    stockName,
    sector,
    sectorSlug,
    stockSlug,
    parametersFile: parameters?.filename ?? null,
    parametersDate: metrics.parametersDate,
    cmp,
    cmpSource,
    trailingEps,
    ttmPe: metrics.ttmPe,
    forwardPe: metrics.forwardPe,
    avg10yPe: metrics.avg10yPe,
    median10yPe: metrics.median10yPe,
    forwardFairPe: metrics.forwardFairPe,
    normalizedEps: metrics.normalizedEps,
    framework5yFairPrice: metrics.framework5yFairPrice,
    premiumTo10yPct,
    historical: parseHistoricalGrowthTab(md),
    forward: parseForwardGrowthTab(md),
    stockbookParametersUrl: stockbookPath(sector, stockName, 'parameters'),
  };
}
