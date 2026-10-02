import { readStockTabContent } from './content';
import { getStockbookByTicker } from './stockbook-index';
import { resolveStock } from './stock-search';
import { fetchLiveNseCmp } from './nse-cmp';
import { parseParametersMetrics } from './stock-calculator-engine';
import {
  parseForwardGrowthTab,
  parseHistoricalGrowthTab,
  type ForwardGrowthTab,
  type HistoricalGrowthTab,
} from './stock-calculator-tabs';
import { stockbookPath } from './navigation';

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
  ttmPe: number | null;
  forwardPe: number | null;
  avg10yPe: number | null;
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
  const md = parameters?.content ?? null;

  const metrics = md ? parseParametersMetrics(md) : {
    ttmPe: null,
    forwardPe: null,
    avg10yPe: null,
    forwardFairPe: null,
    normalizedEps: null,
    framework5yFairPrice: null,
    parametersDate: null,
  };

  let cmp: number | null = null;
  let cmpSource = 'Unavailable';
  try {
    const live = await fetchLiveNseCmp(resolved.ticker);
    if (live?.price != null && live.price > 0) {
      cmp = live.price;
      cmpSource = live.source;
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

  const premiumTo10yPct =
    metrics.ttmPe != null && metrics.avg10yPe != null && metrics.avg10yPe > 0
      ? ((metrics.ttmPe - metrics.avg10yPe) / metrics.avg10yPe) * 100
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
    ttmPe: metrics.ttmPe,
    forwardPe: metrics.forwardPe,
    avg10yPe: metrics.avg10yPe,
    forwardFairPe: metrics.forwardFairPe,
    normalizedEps: metrics.normalizedEps,
    framework5yFairPrice: metrics.framework5yFairPrice,
    premiumTo10yPct,
    historical: parseHistoricalGrowthTab(md),
    forward: parseForwardGrowthTab(md),
    stockbookParametersUrl: stockbookPath(sector, stockName, 'parameters'),
  };
}
