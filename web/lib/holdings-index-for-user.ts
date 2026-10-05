import type { AppSession } from './auth';
import { portfolioLotContext } from './auth';
import { aggregateRows, listLotsWithMetrics } from './holding-lots';
import {
  buildHoldingsIndexTableFromStocks,
  type HoldingsIndexTableResult,
} from './holdings-index-table';

/** Per-login portfolio benchmark (aggregated lots → stock vs index + vs cost). */
export async function buildHoldingsIndexTableForSession(
  session: AppSession
): Promise<HoldingsIndexTableResult | null> {
  const lots = await listLotsWithMetrics(session.tenantId, portfolioLotContext(session));
  const summary = aggregateRows(lots);
  if (summary.length === 0) return null;

  return buildHoldingsIndexTableFromStocks(
    summary.map((r) => ({
      ticker: r.ticker,
      company: r.company,
      sector: r.holdingsSector ?? 'Other',
      qty: r.qty,
      costBasis: r.costBasis,
      cmp: null,
      currentValue: 0,
    }))
  );
}
