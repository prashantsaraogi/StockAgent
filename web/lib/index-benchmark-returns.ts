import type { NiftyIndexRef } from './nifty-index-map';
import {
  fetchYahooChartCloses,
  formatReturnPct,
  snapshotFromCloses,
  type PriceReturnSnapshot,
} from './price-return-snapshot';

export type IndexReturnSnapshot = PriceReturnSnapshot & { asOf: string | null };

const indexSnapCache = new Map<string, { data: IndexReturnSnapshot; expiresAt: number }>();
const CACHE_TTL_MS = 20 * 60 * 1000;

export async function fetchIndexReturnSnapshot(
  index: NiftyIndexRef
): Promise<IndexReturnSnapshot> {
  const key = index.yahooSymbol;
  const hit = indexSnapCache.get(key);
  if (hit && Date.now() < hit.expiresAt) return hit.data;

  const closes = await fetchYahooChartCloses(index.yahooSymbol);
  const snap = snapshotFromCloses(closes);
  const data: IndexReturnSnapshot = {
    ...snap,
    asOf: closes ? new Date().toISOString() : null,
  };
  indexSnapCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
  return data;
}

export async function fetchIndexReturnMap(
  indices: NiftyIndexRef[]
): Promise<Map<string, IndexReturnSnapshot>> {
  const bySymbol = new Map<string, NiftyIndexRef>();
  for (const idx of indices) bySymbol.set(idx.yahooSymbol, idx);

  const out = new Map<string, IndexReturnSnapshot>();
  await Promise.all(
    [...bySymbol.values()].map(async (idx) => {
      out.set(idx.yahooSymbol, await fetchIndexReturnSnapshot(idx));
    })
  );
  return out;
}

/** @deprecated use formatReturnPct */
export const formatIndexPct = formatReturnPct;
