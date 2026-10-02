import { resolveNseSymbol } from './nse-cmp';

export type MarketCapBucket = 'large' | 'mid' | 'small' | 'micro' | 'unknown';

const BUCKET_LABELS: Record<MarketCapBucket, string> = {
  large: 'Large cap',
  mid: 'Mid cap',
  small: 'Small cap',
  micro: 'Micro cap',
  unknown: 'Cap unknown',
};

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: '*/*',
  'Accept-Language': 'en-US,en;q=0.9',
};

/** Trendlyne-style INR crore thresholds (Mega >1L cr excluded → large top bucket). */
export function classifyMarketCapCr(mcapCr: number | null | undefined): MarketCapBucket {
  if (mcapCr == null || !Number.isFinite(mcapCr) || mcapCr <= 0) return 'unknown';
  if (mcapCr >= 40_000) return 'large';
  if (mcapCr >= 10_000) return 'mid';
  if (mcapCr >= 1_000) return 'small';
  return 'micro';
}

export function marketCapBucketLabel(bucket: MarketCapBucket): string {
  return BUCKET_LABELS[bucket];
}

const capCache = new Map<string, { bucket: MarketCapBucket; mcapCr: number | null; expires: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000;

let yahooSession: { cookies: string; crumb: string; expires: number } | null = null;

async function getYahooSession(): Promise<{ cookies: string; crumb: string } | null> {
  if (yahooSession && Date.now() < yahooSession.expires) {
    return yahooSession;
  }
  try {
    const cookieRes = await fetch('https://fc.yahoo.com', {
      redirect: 'manual',
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(12000),
    });
    const cookies = (cookieRes.headers.getSetCookie?.() ?? []).map((c) => c.split(';')[0]).join('; ');
    const crumbRes = await fetch('https://query1.finance.yahoo.com/v1/test/getcrumb', {
      headers: { ...BROWSER_HEADERS, Cookie: cookies },
      signal: AbortSignal.timeout(12000),
    });
    if (!crumbRes.ok) return null;
    const crumb = (await crumbRes.text()).trim();
    if (!crumb) return null;
    yahooSession = { cookies, crumb, expires: Date.now() + 60 * 60 * 1000 };
    return yahooSession;
  } catch {
    return null;
  }
}

async function fetchChartPrice(nseSymbol: string): Promise<number | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(nseSymbol)}.NS?interval=1d&range=1d`;
    const res = await fetch(url, { headers: BROWSER_HEADERS, signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const json = await res.json();
    const price = json?.chart?.result?.[0]?.meta?.regularMarketPrice;
    return typeof price === 'number' && price > 0 ? price : null;
  } catch {
    return null;
  }
}

/** Fetch live NSE market cap in ₹ crore (Yahoo quoteSummary + crumb; chart fallback). */
export async function fetchMarketCapCr(ticker: string): Promise<number | null> {
  const nseSymbol = resolveNseSymbol(ticker);
  const session = await getYahooSession();

  if (session) {
    try {
      const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(nseSymbol)}.NS?modules=summaryDetail,defaultKeyStatistics&crumb=${encodeURIComponent(session.crumb)}`;
      const res = await fetch(url, {
        headers: { ...BROWSER_HEADERS, Cookie: session.cookies },
        signal: AbortSignal.timeout(12000),
      });
      if (res.ok) {
        const json = await res.json();
        const result = json?.quoteSummary?.result?.[0];
        const raw =
          result?.summaryDetail?.marketCap?.raw ?? result?.price?.marketCap?.raw;
        if (typeof raw === 'number' && raw > 0) {
          return Math.round(raw / 1e7);
        }
        const shares = result?.defaultKeyStatistics?.sharesOutstanding?.raw;
        const price = result?.summaryDetail?.previousClose?.raw ?? result?.price?.regularMarketPrice?.raw;
        if (typeof shares === 'number' && typeof price === 'number' && shares > 0 && price > 0) {
          return Math.round((shares * price) / 1e7);
        }
      }
    } catch {
      /* fall through */
    }
  }

  try {
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(nseSymbol)}.NS?modules=summaryDetail,price`;
    const res = await fetch(url, { headers: BROWSER_HEADERS, signal: AbortSignal.timeout(10000) });
    if (res.ok) {
      const json = await res.json();
      const raw =
        json?.quoteSummary?.result?.[0]?.summaryDetail?.marketCap?.raw ??
        json?.quoteSummary?.result?.[0]?.price?.marketCap?.raw;
      if (typeof raw === 'number' && raw > 0) return Math.round(raw / 1e7);
    }
  } catch {
    /* fall through */
  }

  const price = await fetchChartPrice(nseSymbol);
  if (price == null) return null;
  // Without shares outstanding we cannot compute mcap from chart alone
  return null;
}

/** Resolve NSE market-cap bucket for a ticker (cached 24h). */
export async function getMarketCapBucket(ticker: string): Promise<{
  bucket: MarketCapBucket;
  mcapCr: number | null;
}> {
  const key = ticker.toUpperCase();
  const hit = capCache.get(key);
  if (hit && Date.now() < hit.expires) {
    return { bucket: hit.bucket, mcapCr: hit.mcapCr };
  }

  const mcapCr = await fetchMarketCapCr(key);
  const bucket = classifyMarketCapCr(mcapCr);
  capCache.set(key, { bucket, mcapCr, expires: Date.now() + CACHE_TTL });
  return { bucket, mcapCr };
}

export const CAP_BUCKET_ORDER: MarketCapBucket[] = [
  'large',
  'mid',
  'small',
  'micro',
  'unknown',
];

const BATCH_DELAY_MS = 350;

/** Batch-fetch market caps with gentle rate limiting (reuses Yahoo session). */
export async function fetchMarketCapCrBatch(
  tickers: string[]
): Promise<Map<string, number | null>> {
  const unique = [...new Set(tickers.map((t) => t.toUpperCase()))];
  const out = new Map<string, number | null>();
  await getYahooSession();
  for (const ticker of unique) {
    out.set(ticker, await fetchMarketCapCr(ticker));
    if (BATCH_DELAY_MS > 0) {
      await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
    }
  }
  return out;
}
