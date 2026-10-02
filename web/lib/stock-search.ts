import { buildStockbookTickerIndex } from './stockbook-index';
import {
  extractTickerFromQuery,
  searchNseSymbols,
  validateNseTicker,
  type NseSearchResult,
} from './nse-symbol-search';
import { searchSymbolAliases } from './nse-symbol-aliases';

export type StockSearchSource = 'stockbook' | 'nse' | 'alias';

export interface StockSearchResult {
  ticker: string;
  company: string;
  sector: string;
  /** Where this result came from */
  source: StockSearchSource;
  /** True when StockBook folder exists for this ticker */
  inStockBook: boolean;
}

function toResult(
  item: { ticker: string; company: string; sector: string },
  source: StockSearchSource,
  inStockBook: boolean
): StockSearchResult {
  return { ...item, source, inStockBook };
}

function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[()]/g, ' ')
    .replace(/\blimited\b|\bltd\b|\bprivate\b|\bplc\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenizeQuery(query: string): string[] {
  return normalizeSearchText(query).split(/\s+/).filter(Boolean);
}

function matchesAllTokens(text: string, tokens: string[]): boolean {
  if (tokens.length === 0) return false;
  const normalized = normalizeSearchText(text);
  return tokens.every((token) => normalized.includes(token));
}

function matchesStockbookEntry(
  loc: { ticker: string; stock: string },
  q: string,
  tokens: string[]
): boolean {
  const tickerLower = loc.ticker.toLowerCase();
  const companyLower = loc.stock.toLowerCase();
  const qLower = q.toLowerCase();

  if (tickerLower.includes(qLower) || companyLower.includes(qLower)) return true;
  if (tokens.length > 1) {
    return (
      matchesAllTokens(loc.stock, tokens) ||
      matchesAllTokens(loc.ticker, tokens)
    );
  }
  return false;
}

function rankSearchResult(result: StockSearchResult, q: string, tokens: string[]): number {
  const qLower = q.toLowerCase();
  const tickerLower = result.ticker.toLowerCase();
  const companyLower = result.company.toLowerCase();

  if (tickerLower === qLower || companyLower === qLower) return 0;
  if (tickerLower.startsWith(qLower) || companyLower.startsWith(qLower)) return 1;
  if (matchesAllTokens(result.company, tokens) || matchesAllTokens(result.ticker, tokens)) {
    return 2;
  }
  if (result.inStockBook) return 3;
  if (result.source === 'alias') return 4;
  return 5;
}

function sortSearchResults(results: StockSearchResult[], q: string, tokens: string[]): StockSearchResult[] {
  return [...results].sort((a, b) => {
    const rankDiff = rankSearchResult(a, q, tokens) - rankSearchResult(b, q, tokens);
    if (rankDiff !== 0) return rankDiff;
    return a.company.localeCompare(b.company);
  });
}

/** Search StockBook + local aliases + NSE (Yahoo) — merged and ranked. */
export async function searchStocks(query: string, limit = 12): Promise<StockSearchResult[]> {
  const q = query.trim();
  const qLower = q.toLowerCase();
  const tokens = tokenizeQuery(q);
  if (q.length < 1) return [];

  const index = await buildStockbookTickerIndex();
  const seen = new Set<string>();
  const merged: StockSearchResult[] = [];

  function push(
    item: { ticker: string; company: string; sector: string },
    source: StockSearchSource,
    inStockBook: boolean
  ) {
    const ticker = item.ticker.toUpperCase();
    if (seen.has(ticker)) return;
    seen.add(ticker);
    merged.push(toResult({ ...item, ticker }, source, inStockBook));
  }

  for (const loc of index.values()) {
    if (!matchesStockbookEntry(loc, q, tokens)) continue;
    push(
      { ticker: loc.ticker, company: loc.stock, sector: loc.sector },
      'stockbook',
      true
    );
  }

  for (const alias of searchSymbolAliases(q, limit)) {
    push(
      { ticker: alias.ticker, company: alias.company, sector: alias.sector },
      'alias',
      index.has(alias.ticker)
    );
  }

  const nseNeeded = Math.max(limit, limit - merged.length);
  const external = q.length >= 2 ? await searchNseSymbols(q, nseNeeded) : [];
  for (const hit of external) {
    const inBook = index.has(hit.ticker);
    const loc = index.get(hit.ticker);
    push(
      inBook && loc
        ? { ticker: loc.ticker, company: loc.stock, sector: loc.sector }
        : hit,
      inBook ? 'stockbook' : 'nse',
      inBook
    );
  }

  return sortSearchResults(merged, qLower, tokens).slice(0, limit);
}

async function resolveFromNse(query: string): Promise<StockSearchResult | null> {
  const tickerCandidate = extractTickerFromQuery(query);

  if (/^[A-Z][A-Z0-9&.-]{0,19}$/.test(tickerCandidate)) {
    const validated = await validateNseTicker(tickerCandidate);
    if (validated) {
      const index = await buildStockbookTickerIndex();
      const inBook = index.has(validated.ticker);
      const loc = index.get(validated.ticker);
      return toResult(
        inBook && loc
          ? { ticker: loc.ticker, company: loc.stock, sector: loc.sector }
          : validated,
        inBook ? 'stockbook' : 'nse',
        inBook
      );
    }
  }

  const aliasHits = searchSymbolAliases(query, 1);
  if (aliasHits.length > 0) {
    const alias = aliasHits[0];
    const index = await buildStockbookTickerIndex();
    const inBook = index.has(alias.ticker);
    const loc = index.get(alias.ticker);
    return toResult(
      inBook && loc
        ? { ticker: loc.ticker, company: loc.stock, sector: loc.sector }
        : { ticker: alias.ticker, company: alias.company, sector: alias.sector },
      inBook ? 'stockbook' : 'alias',
      inBook
    );
  }

  const external = await searchNseSymbols(query, 5);
  if (external.length === 0) return null;

  const qLower = query.trim().toLowerCase();
  const tokens = tokenizeQuery(query);
  const exact = external.find(
    (m) =>
      m.ticker.toLowerCase() === qLower ||
      m.company.toLowerCase() === qLower ||
      m.ticker.toLowerCase() === tickerCandidate.toLowerCase() ||
      matchesAllTokens(m.company, tokens)
  );
  const pick = exact ?? external[0];
  const index = await buildStockbookTickerIndex();
  const inBook = index.has(pick.ticker);
  const loc = index.get(pick.ticker);

  if (inBook && loc) {
    return toResult(
      { ticker: loc.ticker, company: loc.stock, sector: loc.sector },
      'stockbook',
      true
    );
  }

  return toResult(pick, 'nse', false);
}

/** Resolve a single stock — StockBook, aliases, then live NSE lookup. */
export async function resolveStock(query: string): Promise<StockSearchResult | null> {
  const q = query.trim();
  if (!q) return null;

  const index = await buildStockbookTickerIndex();
  const upper = extractTickerFromQuery(q);

  if (index.has(upper)) {
    const loc = index.get(upper)!;
    return toResult(
      { ticker: loc.ticker, company: loc.stock, sector: loc.sector },
      'stockbook',
      true
    );
  }

  const aliasExact = searchSymbolAliases(q, 3).find(
    (a) =>
      a.ticker === upper ||
      a.company.toLowerCase() === q.toLowerCase() ||
      a.aliases.some((alias) => alias === q.toLowerCase())
  );
  if (aliasExact) {
    const inBook = index.has(aliasExact.ticker);
    const loc = index.get(aliasExact.ticker);
    return toResult(
      inBook && loc
        ? { ticker: loc.ticker, company: loc.stock, sector: loc.sector }
        : {
            ticker: aliasExact.ticker,
            company: aliasExact.company,
            sector: aliasExact.sector,
          },
      inBook ? 'stockbook' : 'alias',
      inBook
    );
  }

  const matches = await searchStocks(q, 8);
  const qLower = q.toLowerCase();
  const tokens = tokenizeQuery(q);
  const exact = matches.find(
    (m) =>
      m.ticker.toLowerCase() === qLower ||
      m.company.toLowerCase() === qLower ||
      m.ticker.toLowerCase() === upper.toLowerCase() ||
      matchesAllTokens(m.company, tokens)
  );
  if (exact) return exact;

  if (matches.length === 1) return matches[0];

  const stockbookPartial = matches.find((m) => m.inStockBook);
  if (stockbookPartial && matches.length > 0) return stockbookPartial;

  if (matches.length > 0) return matches[0];

  return resolveFromNse(q);
}

/** Re-export for callers that need external-only search. */
export type { NseSearchResult };
