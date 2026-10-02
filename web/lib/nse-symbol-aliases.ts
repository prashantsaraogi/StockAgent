/**
 * Local name aliases for NSE tickers — covers renames and common search phrases
 * when Yahoo search misses or users type partial names.
 */

export interface NseSymbolAlias {
  ticker: string;
  company: string;
  sector: string;
  /** Lowercase phrases that should resolve to this ticker */
  aliases: string[];
}

export const NSE_SYMBOL_ALIASES: NseSymbolAlias[] = [
  {
    ticker: 'NUVAMA',
    company: 'Nuvama Wealth Management Limited',
    sector: 'Asset Management',
    aliases: [
      'nuvama',
      'nuvama wealth',
      'nuvama wealth management',
      'nuvama wealth manage',
      'nuvama wealth manage ltd',
      'ewml',
    ],
  },
];

function normalizeAliasText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[()]/g, ' ')
    .replace(/\blimited\b|\bltd\b|\bprivate\b|\bplc\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(value: string): string[] {
  return normalizeAliasText(value).split(/\s+/).filter(Boolean);
}

/** Match alias index — all query tokens must appear in alias phrase or company name. */
export function searchSymbolAliases(query: string, limit = 10): NseSymbolAlias[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  const hits: NseSymbolAlias[] = [];
  const seen = new Set<string>();

  for (const entry of NSE_SYMBOL_ALIASES) {
    const candidates = [entry.company, ...entry.aliases];
    const matched = candidates.some((phrase) => {
      const normalized = normalizeAliasText(phrase);
      return tokens.every((t) => normalized.includes(t));
    });
    if (!matched || seen.has(entry.ticker)) continue;
    seen.add(entry.ticker);
    hits.push(entry);
    if (hits.length >= limit) break;
  }

  return hits;
}
