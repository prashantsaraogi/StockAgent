/**
 * Search NSE-listed equities outside StockBook (Yahoo Finance search API).
 */

import { fetchLiveNseCmp, resolveNseSymbol } from './nse-cmp';

export interface NseSearchResult {
  ticker: string;
  company: string;
  sector: string;
  exchange: 'NSE';
}

interface YahooQuote {
  symbol?: string;
  shortname?: string;
  longname?: string;
  exchange?: string;
  exchDisp?: string;
  quoteType?: string;
  sectorDisp?: string;
  industryDisp?: string;
}

const SEARCH_CACHE_TTL_MS = 5 * 60 * 1000;
const searchCache = new Map<string, { results: NseSearchResult[]; expiresAt: number }>();

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: 'application/json',
};

function yahooSectorLabel(q: YahooQuote): string {
  return q.industryDisp ?? q.sectorDisp ?? 'NSE Listed';
}

function parseNseTicker(yahooSymbol: string): string | null {
  const sym = yahooSymbol.toUpperCase();
  if (sym.endsWith('.NS')) return sym.slice(0, -3);
  if (sym.endsWith('.BO')) return null;
  return sym;
}

function isNseQuote(q: YahooQuote): boolean {
  if (q.quoteType !== 'EQUITY') return false;
  const sym = (q.symbol ?? '').toUpperCase();
  if (sym.endsWith('.NS')) return true;
  if (q.exchange === 'NSI') return true;
  if ((q.exchDisp ?? '').toUpperCase() === 'NSE') return true;
  return false;
}

/** Live search NSE equities by company name or ticker (not limited to StockBook). */
export async function searchNseSymbols(query: string, limit = 10): Promise<NseSearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const cacheKey = `${q.toLowerCase()}::${limit}`;
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) return cached.results;

  try {
    const url = new URL('https://query1.finance.yahoo.com/v1/finance/search');
    url.searchParams.set('q', q);
    url.searchParams.set('quotesCount', String(Math.min(limit * 2, 20)));
    url.searchParams.set('newsCount', '0');
    url.searchParams.set('listsCount', '0');

    const res = await fetch(url.toString(), {
      headers: BROWSER_HEADERS,
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return [];

    const json = (await res.json()) as { quotes?: YahooQuote[] };
    const seen = new Set<string>();
    const results: NseSearchResult[] = [];

    for (const quote of json.quotes ?? []) {
      if (!isNseQuote(quote) || !quote.symbol) continue;
      const ticker = parseNseTicker(quote.symbol);
      if (!ticker || seen.has(ticker)) continue;
      seen.add(ticker);
      results.push({
        ticker,
        company: quote.longname ?? quote.shortname ?? ticker,
        sector: yahooSectorLabel(quote),
        exchange: 'NSE',
      });
      if (results.length >= limit) break;
    }

    searchCache.set(cacheKey, { results, expiresAt: Date.now() + SEARCH_CACHE_TTL_MS });
    return results;
  } catch {
    return [];
  }
}

/** Validate a raw NSE ticker by fetching live CMP. */
export async function validateNseTicker(ticker: string): Promise<NseSearchResult | null> {
  const upper = ticker.trim().toUpperCase();
  if (!/^[A-Z][A-Z0-9&.-]{0,19}$/.test(upper)) return null;

  const nseSymbol = resolveNseSymbol(upper);
  const quote = await fetchLiveNseCmp(nseSymbol, upper);
  if (!quote?.price) return null;

  const names = await searchNseSymbols(nseSymbol, 3);
  const match = names.find((n) => n.ticker === nseSymbol);

  return {
    ticker: nseSymbol,
    company: match?.company ?? quote.nseSymbol,
    sector: match?.sector ?? 'NSE Listed',
    exchange: 'NSE',
  };
}

/** Extract ticker from inputs like "Asian Paints (ASIANPAINT)" or "MARUTI". */
export function extractTickerFromQuery(query: string): string {
  const trimmed = query.trim();
  const paren = trimmed.match(/\(([A-Z0-9][A-Z0-9&.-]{0,19})\)\s*$/i);
  if (paren) return paren[1].toUpperCase();
  if (/^[A-Z0-9][A-Z0-9&.-]{0,19}$/i.test(trimmed)) return trimmed.toUpperCase();
  return trimmed;
}
