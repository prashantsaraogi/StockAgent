/**
 * Live NSE CMP for web Dashboard & Portfolio.
 *
 * Priority (framework rule):
 * 1. NSE India quote API (nseindia.com) — preferred
 * 2. Yahoo Finance `{SYMBOL}.NS` — NSE last traded price when NSE API blocks server IP
 * 3. StockBook PARAMETERS / summary — stale fallback only
 */

export type CmpSource = 'nse' | 'nse-yahoo' | 'stockbook' | 'unavailable';

export interface CmpQuote {
  ticker: string;
  nseSymbol: string;
  price: number;
  source: CmpSource;
  /** ISO timestamp of the market quote */
  asOf: string;
  /** TTM EPS from NSE quote-equity when available */
  trailingEps?: number | null;
  /** Trailing P/E from NSE when available (else derive from price / EPS) */
  trailingPe?: number | null;
}

/** NSE symbol when portfolio ticker differs from NSE trading symbol. */
const NSE_SYMBOL_ALIASES: Record<string, string> = {
  TATAMOTORS: 'TMCV', // Tata Motors CV post-demerger
  GUJGASLTD: 'GUJENERGY',
  GUJGAS: 'GUJENERGY',
  LTIM: 'LTM',
  RMCL: 'RAJMET',
};

const CACHE_TTL_MS = Number(process.env.CMP_CACHE_TTL_MS ?? 5 * 60 * 1000);

const quoteCache = new Map<string, { quote: CmpQuote; expiresAt: number }>();
let nseDirectBlocked = false;

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: '*/*',
  'Accept-Language': 'en-US,en;q=0.9',
};

export function resolveNseSymbol(ticker: string): string {
  const upper = ticker.toUpperCase();
  return NSE_SYMBOL_ALIASES[upper] ?? upper;
}

function cacheGet(ticker: string): CmpQuote | null {
  const hit = quoteCache.get(ticker.toUpperCase());
  if (!hit || Date.now() > hit.expiresAt) return null;
  return hit.quote;
}

function cacheSet(quote: CmpQuote): void {
  quoteCache.set(quote.ticker.toUpperCase(), {
    quote,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

function pickPositiveNum(...values: unknown[]): number | null {
  for (const v of values) {
    if (typeof v === 'number' && Number.isFinite(v) && v > 0) return v;
    if (typeof v === 'string') {
      const n = parseFloat(v.replace(/,/g, ''));
      if (Number.isFinite(n) && n > 0) return n;
    }
  }
  return null;
}

/** Best-effort TTM EPS / P/E from NSE quote-equity JSON (shape varies). */
export function extractNsePeMetrics(json: unknown): {
  trailingEps: number | null;
  trailingPe: number | null;
} {
  const root = json as Record<string, unknown> | null;
  if (!root) return { trailingEps: null, trailingPe: null };

  const securityInfo = root.securityInfo as Record<string, unknown> | undefined;
  const keyMetrics = root.keyMetrics as Record<string, unknown> | undefined;
  const metadata = root.metadata as Record<string, unknown> | undefined;

  const trailingEps = pickPositiveNum(
    securityInfo?.eps,
    securityInfo?.earningPerShare,
    securityInfo?.earningsPerShare,
    keyMetrics?.epsTtm,
    keyMetrics?.trailingEps,
    metadata?.eps
  );

  let trailingPe = pickPositiveNum(
    securityInfo?.pe,
    securityInfo?.peRatio,
    securityInfo?.priceToEarnings,
    keyMetrics?.peRatio,
    keyMetrics?.trailingPe,
    keyMetrics?.pe
  );

  const price =
    pickPositiveNum(
      (root.priceInfo as Record<string, unknown> | undefined)?.lastPrice,
      (root.priceInfo as Record<string, unknown> | undefined)?.close
    ) ?? null;

  if (trailingPe == null && price != null && trailingEps != null) {
    trailingPe = Math.round((price / trailingEps) * 10) / 10;
  }

  return { trailingEps, trailingPe };
}

async function fetchNseCookies(): Promise<string> {
  const res = await fetch('https://www.nseindia.com/', {
    headers: {
      ...BROWSER_HEADERS,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    signal: AbortSignal.timeout(12000),
  });
  const setCookie = res.headers.getSetCookie?.() ?? [];
  return setCookie.map((c) => c.split(';')[0]).join('; ');
}

async function fetchNseDirect(nseSymbol: string): Promise<CmpQuote | null> {
  if (nseDirectBlocked) return null;

  try {
    const cookie = await fetchNseCookies();
    const url = `https://www.nseindia.com/api/quote-equity?symbol=${encodeURIComponent(nseSymbol)}`;
    const res = await fetch(url, {
      headers: {
        ...BROWSER_HEADERS,
        Referer: `https://www.nseindia.com/get-quotes/equity?symbol=${encodeURIComponent(nseSymbol)}`,
        Cookie: cookie,
      },
      signal: AbortSignal.timeout(12000),
    });

    if (res.status === 403 || res.status === 401) {
      nseDirectBlocked = true;
      return null;
    }
    if (!res.ok) return null;

    const json = await res.json();
    const price =
      json?.priceInfo?.lastPrice ??
      json?.priceInfo?.close ??
      json?.priceInfo?.last_price;
    if (typeof price !== 'number' || price <= 0) return null;

    const asOf =
      json?.metadata?.lastUpdateTime ??
      json?.priceInfo?.lastUpdateTime ??
      new Date().toISOString();

    const peMetrics = extractNsePeMetrics(json);

    return {
      ticker: nseSymbol,
      nseSymbol,
      price,
      source: 'nse',
      asOf: typeof asOf === 'string' ? asOf : new Date().toISOString(),
      trailingEps: peMetrics.trailingEps,
      trailingPe: peMetrics.trailingPe,
    };
  } catch {
    return null;
  }
}

async function fetchYahooNse(nseSymbol: string, originalTicker: string): Promise<CmpQuote | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(nseSymbol)}.NS?interval=1d&range=1d`;
    const res = await fetch(url, {
      headers: { ...BROWSER_HEADERS },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;

    const json = await res.json();
    const meta = json?.chart?.result?.[0]?.meta;
    const price = meta?.regularMarketPrice;
    if (typeof price !== 'number' || price <= 0) return null;

    const ts = meta?.regularMarketTime;
    const asOf =
      typeof ts === 'number' ? new Date(ts * 1000).toISOString() : new Date().toISOString();

    return {
      ticker: originalTicker.toUpperCase(),
      nseSymbol,
      price,
      source: 'nse-yahoo',
      asOf,
    };
  } catch {
    return null;
  }
}

/** Fetch live NSE CMP — cached per ticker. */
export async function fetchLiveNseCmp(
  ticker: string,
  originalTicker?: string
): Promise<CmpQuote | null> {
  const upper = (originalTicker ?? ticker).toUpperCase();
  const cached = cacheGet(upper);
  if (cached) return cached;

  const nseSymbol = resolveNseSymbol(ticker);

  const direct = await fetchNseDirect(nseSymbol);
  if (direct) {
    const quote: CmpQuote = { ...direct, ticker: upper };
    cacheSet(quote);
    return quote;
  }

  const yahoo = await fetchYahooNse(nseSymbol, upper);
  if (yahoo) {
    cacheSet(yahoo);
    return yahoo;
  }

  return null;
}

/** Batch live NSE quotes with concurrency limit. */
export async function fetchLiveNseCmpMap(
  tickers: string[]
): Promise<Map<string, CmpQuote | null>> {
  const unique = [...new Set(tickers.map((t) => t.toUpperCase()))];
  const map = new Map<string, CmpQuote | null>();

  const concurrency = 6;
  for (let i = 0; i < unique.length; i += concurrency) {
    const batch = unique.slice(i, i + concurrency);
    await Promise.all(
      batch.map(async (t) => {
        map.set(t, await fetchLiveNseCmp(t));
      })
    );
  }

  return map;
}
