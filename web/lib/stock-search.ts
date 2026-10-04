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
  /** Closest-name match (not exact ticker/company hit) */
  fuzzyMatch?: boolean;
  /** Phrase that produced this resolution */
  resolvedFrom?: string;
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

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const row = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j++) row[j] = j;
  for (let i = 1; i <= a.length; i++) {
    let prev = i - 1;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const next = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
      prev = row[j];
      row[j] = next;
    }
  }
  return row[b.length];
}

/** 0–100 similarity for fuzzy company / ticker pick. */
function similarityScore(query: string, target: string): number {
  const q = normalizeSearchText(query);
  const t = normalizeSearchText(target);
  if (!q || !t) return 0;
  if (q === t) return 100;
  if (t.includes(q)) return 92;
  if (q.includes(t) && t.length >= 3) return 88;

  const qTokens = q.split(/\s+/).filter((x) => x.length >= 2);
  const tTokens = t.split(/\s+/).filter(Boolean);
  if (qTokens.length > 0 && tTokens.length > 0) {
    let sum = 0;
    for (const qt of qTokens) {
      let best = 0;
      for (const tt of tTokens) {
        if (qt === tt) best = Math.max(best, 1);
        else if (tt.startsWith(qt) || qt.startsWith(tt)) best = Math.max(best, 0.88);
        else if (tt.includes(qt) || qt.includes(tt)) best = Math.max(best, 0.75);
        else {
          const maxLen = Math.max(qt.length, tt.length);
          const sim = 1 - levenshtein(qt, tt) / maxLen;
          best = Math.max(best, sim);
        }
      }
      sum += best;
    }
    const tokenScore = (sum / qTokens.length) * 82;
    const fullLev = 1 - levenshtein(q, t) / Math.max(q.length, t.length);
    return Math.max(tokenScore, fullLev * 72);
  }

  const fullLev = 1 - levenshtein(q, t) / Math.max(q.length, t.length);
  return fullLev * 70;
}

const FUZZY_MIN_SCORE = 44;

/** Nudge fuzzy pick when user names a sector (e.g. "mahindra auto" → Auto, not Kotak Bank). */
function sectorHintAdjust(query: string, sector: string, company: string): number {
  const n = normalizeSearchText(query);
  const sec = normalizeSearchText(sector);
  const co = normalizeSearchText(company);

  const wantsAuto = /\bauto\b|\bmotor|\bmotors|\bvehicle|\bcar\b|\bcv\b/.test(n);
  const wantsBank = /\bbank|\bnbfc|\bfinance\b/.test(n);
  const wantsPharma = /\bpharma|\bdrug|\blab|\breddy|\bsun\b/.test(n);

  if (wantsAuto) {
    if (sec.includes('auto')) return 14;
    if (co.startsWith('tech ') && n.includes('mahindra')) return -22;
    if (co.includes('bank') || sec.includes('bank') || sec.includes('financial')) return -28;
  }
  if (wantsBank && (sec.includes('bank') || co.includes('bank'))) return 14;
  if (wantsPharma && (sec.includes('pharma') || sec.includes('health'))) return 10;
  return 0;
}

/**
 * Pick closest StockBook (+ alias) name when exact resolve fails.
 * Uses query tokens and full phrase against company name and ticker.
 */
export async function resolveStockClosest(
  query: string,
  opts?: { minScore?: number }
): Promise<StockSearchResult | null> {
  const q = normalizeStockQuery(query).trim();
  if (q.length < 2) return null;

  const minScore = opts?.minScore ?? FUZZY_MIN_SCORE;
  const index = await buildStockbookTickerIndex();
  const phrases = [q, ...tokenizeQuery(q).filter((t) => t.length >= 3)];

  type FuzzyCandidate = { result: StockSearchResult; score: number };
  const candidates: FuzzyCandidate[] = [];

  function consider(
    item: { ticker: string; company: string; sector: string },
    source: StockSearchSource,
    inStockBook: boolean,
    from: string
  ) {
    for (const phrase of phrases) {
      let score = Math.max(
        similarityScore(phrase, item.ticker),
        similarityScore(phrase, item.company)
      );
      score += sectorHintAdjust(q, item.sector, item.company);
      if (score < minScore) continue;
      candidates.push({
        result: {
          ...toResult({ ...item, ticker: item.ticker.toUpperCase() }, source, inStockBook),
          fuzzyMatch: true,
          resolvedFrom: from,
        },
        score,
      });
    }
  }

  for (const loc of index.values()) {
    consider(
      { ticker: loc.ticker, company: loc.stock, sector: loc.sector },
      'stockbook',
      true,
      q
    );
  }

  for (const alias of searchSymbolAliases(q, 20)) {
    consider(
      { ticker: alias.ticker, company: alias.company, sector: alias.sector },
      'alias',
      index.has(alias.ticker),
      q
    );
    for (const a of alias.aliases) {
      if (a.length >= 3) {
        consider(
          { ticker: alias.ticker, company: alias.company, sector: alias.sector },
          'alias',
          index.has(alias.ticker),
          a
        );
      }
    }
  }

  if (candidates.length === 0) {
    const nse = await searchNseSymbols(q, 8);
    for (const hit of nse) {
      consider(hit, 'nse', index.has(hit.ticker), q);
    }
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0].result;
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

/** "Maruti Suzuki (MARUTI)" → MARUTI; else trimmed query. */
export function normalizeStockQuery(raw: string): string {
  const q = raw.trim();
  const paren = q.match(/\(([A-Z][A-Z0-9.&-]{1,20})\)\s*$/);
  if (paren) return paren[1];
  return q;
}

/** Resolve a single stock — StockBook, aliases, then live NSE lookup. */
export async function resolveStock(query: string): Promise<StockSearchResult | null> {
  const q = normalizeStockQuery(query);
  if (!q) return null;

  const index = await buildStockbookTickerIndex();
  const upper = extractTickerFromQuery(q);
  const tokens = tokenizeQuery(q);

  if (index.has(upper)) {
    const loc = index.get(upper)!;
    return toResult(
      { ticker: loc.ticker, company: loc.stock, sector: loc.sector },
      'stockbook',
      true
    );
  }

  for (const loc of index.values()) {
    if (!matchesStockbookEntry(loc, q, tokens)) continue;
    return toResult(
      { ticker: loc.ticker, company: loc.stock, sector: loc.sector },
      'stockbook',
      true
    );
  }

  if (/^[A-Z][A-Z0-9&.-]{0,19}$/.test(upper)) {
    const validated = await validateNseTicker(upper);
    if (validated) {
      const loc = index.get(validated.ticker);
      return toResult(
        loc
          ? { ticker: loc.ticker, company: loc.stock, sector: loc.sector }
          : validated,
        loc ? 'stockbook' : 'nse',
        Boolean(loc)
      );
    }
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

  const fromNse = await resolveFromNse(q);
  if (fromNse) return fromNse;

  const fuzzy = await resolveStockClosest(q);
  if (fuzzy) return fuzzy;

  return null;
}

/** Re-export for callers that need external-only search. */
export type { NseSearchResult };
