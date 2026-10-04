/**
 * Per-login portfolio — never infer position from shared StockBook markdown.
 */

import type { LotPersistenceContext } from './holding-lots';
import { aggregateRows, listHoldingLots } from './holding-lots';
import { parseHoldingsTable, type HoldingRow } from './holdings';

/** Author-specific blocks in repo StockBook — must not appear for other web users. */
export function stripAuthorPositionFromMarkdown(md: string): string {
  let out = md;
  out = out.replace(/## Your position[\s\S]*?(?=^## |\n---\s*\n|$)/gm, '');
  out = out.replace(/## 2\. Your position math[\s\S]*?(?=^## |\n---\s*\n|$)/gm, '');
  out = out.replace(/^\*\*For:\*\*[^\n]*\n/gm, '');
  out = out.replace(/\n{3,}/g, '\n\n');
  return out.trim();
}

/** Lots (Supabase or lots.json) first; else holdings.md summary table. */
export async function getPortfolioHoldingsRows(
  tenantId: string,
  ctx?: LotPersistenceContext
): Promise<HoldingRow[]> {
  const lots = await listHoldingLots(tenantId, ctx);
  if (lots.length > 0) return aggregateRows(lots);
  return parseHoldingsTable(tenantId);
}

export async function getUserHoldingForTicker(
  tenantId: string,
  ticker: string,
  ctx?: LotPersistenceContext
): Promise<HoldingRow | null> {
  const key = ticker.trim().toUpperCase();
  const rows = await getPortfolioHoldingsRows(tenantId, ctx);
  return rows.find((r) => r.ticker.toUpperCase() === key) ?? null;
}
