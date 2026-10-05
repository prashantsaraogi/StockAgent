import { resolveNseSymbol } from './nse-cmp';

export interface PriceReturnSnapshot {
  dailyPct: number | null;
  monthlyPct: number | null;
  yearlyPct: number | null;
}

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: '*/*',
};

const CACHE_TTL_MS = 20 * 60 * 1000;
const chartCache = new Map<string, { closes: number[]; expiresAt: number }>();

export function pctFromCloses(closes: number[], tradingDaysBack: number): number | null {
  if (closes.length < 2) return null;
  const last = closes[closes.length - 1];
  const idx = Math.max(0, closes.length - 1 - tradingDaysBack);
  const base = closes[idx];
  if (!Number.isFinite(last) || !Number.isFinite(base) || base <= 0) return null;
  return Math.round(((last - base) / base) * 1000) / 10;
}

export function snapshotFromCloses(closes: number[] | null): PriceReturnSnapshot {
  if (!closes || closes.length < 2) {
    return { dailyPct: null, monthlyPct: null, yearlyPct: null };
  }
  return {
    dailyPct: pctFromCloses(closes, 1),
    monthlyPct: pctFromCloses(closes, 21),
    yearlyPct: pctFromCloses(closes, Math.min(252, closes.length - 1)),
  };
}

export async function fetchYahooChartCloses(yahooSymbol: string): Promise<number[] | null> {
  const key = yahooSymbol.toUpperCase();
  const hit = chartCache.get(key);
  if (hit && Date.now() < hit.expiresAt) return hit.closes;

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1d&range=1y`;
    const res = await fetch(url, {
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const raw = json?.chart?.result?.[0]?.indicators?.quote?.[0]?.close as
      | (number | null)[]
      | undefined;
    if (!raw?.length) return null;
    const closes: number[] = [];
    for (const c of raw) {
      if (typeof c === 'number' && Number.isFinite(c)) closes.push(c);
    }
    if (closes.length < 2) return null;
    chartCache.set(key, { closes, expiresAt: Date.now() + CACHE_TTL_MS });
    return closes;
  } catch {
    return null;
  }
}

export function formatReturnPct(n: number | null): string {
  if (n == null) return '—';
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toFixed(1)}%`;
}

/** Stock return minus index return (positive = stock outperformed index). */
export function spreadPct(
  stock: number | null,
  index: number | null
): number | null {
  if (stock == null || index == null) return null;
  return Math.round((stock - index) * 10) / 10;
}

export function formatSpreadPct(n: number | null): string {
  if (n == null) return '—';
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toFixed(1)} pp`;
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  return out;
}

export async function fetchStockReturnMap(
  tickers: string[]
): Promise<Map<string, PriceReturnSnapshot>> {
  const unique = [...new Set(tickers.map((t) => t.toUpperCase()))];
  const out = new Map<string, PriceReturnSnapshot>();

  await mapPool(unique, 6, async (ticker) => {
    const nse = resolveNseSymbol(ticker);
    const closes = await fetchYahooChartCloses(`${nse}.NS`);
    out.set(ticker, snapshotFromCloses(closes));
  });

  return out;
}
