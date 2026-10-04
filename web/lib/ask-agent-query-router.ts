/**
 * Ask Agent — infer stock from short / one-word messages and route to analysis vs general Q&A.
 */

import { resolveStock, resolveStockClosest, type StockSearchResult } from './stock-search';
import { shouldRunNewsAgent } from './agent/news-agent';

const LEADING_FILLER =
  /^(please|can you|could you|tell me|what is|what's|how is|give me|show me|i want|need)\s+/i;
const TRAILING_FILLER = /\s+(please|thanks|thank you)[!.?]*$/i;
const ANALYSIS_VERBS =
  /^(analyze|analysis|analyse|review|check|evaluate|assess|explain|summarize|summarise)\b/i;

const STOP_WORDS = new Set([
  'analyze',
  'analysis',
  'analyse',
  'stock',
  'stocks',
  'share',
  'shares',
  'equity',
  'company',
  'please',
  'the',
  'a',
  'an',
  'for',
  'of',
  'on',
  'my',
  'me',
  'about',
  'review',
  'check',
  'tell',
  'what',
  'is',
  'are',
  'how',
  'why',
  'should',
  'i',
  'buy',
  'hold',
  'sell',
  'add',
]);

export type AskAgentRouteKind = 'news' | 'stock-analysis' | 'general';

export interface AskAgentRoute {
  kind: AskAgentRouteKind;
  /** Resolved NSE symbol when applicable */
  stock: StockSearchResult | null;
  /** Text used for resolveStock */
  stockPhrase: string | null;
  /** True when symbol was chosen by closest-name match */
  fuzzyStockMatch?: boolean;
}

/** Strip filler so "Analysis ITC Stock?" → "ITC", "ITC" → "ITC". */
export function extractStockPhraseFromMessage(message: string): string {
  let s = message.trim().replace(/[?!.]+$/g, '').replace(TRAILING_FILLER, '');
  s = s.replace(LEADING_FILLER, '').trim();
  s = s.replace(ANALYSIS_VERBS, '').trim();
  s = s.replace(/\b(stock|stocks|share|shares|ltd|limited)\b/gi, ' ').replace(/\s+/g, ' ').trim();

  const tokens = s.split(/\s+/).filter(Boolean);
  const kept = tokens.filter((t) => !STOP_WORDS.has(t.toLowerCase()));
  if (kept.length > 0) return kept.join(' ');
  if (tokens.length === 1) return tokens[0];
  return s;
}

function looksLikeStockAnalysisIntent(message: string, stockPhrase: string): boolean {
  if (shouldRunNewsAgent(message)) return false;
  if (/^(news|macro|market today|nifty|sensex)\b/i.test(message)) return false;

  if (ANALYSIS_VERBS.test(message.trim())) return true;
  if (/\b(buy|add|hold|pccl|verdict|fall|fell|results?|average)\b/i.test(message)) return true;

  const words = stockPhrase.split(/\s+/).filter(Boolean);
  // One word or short name → treat as ticker / company (e.g. "ITC", "HDFC Bank")
  if (words.length <= 3 && stockPhrase.length >= 2) return true;

  return false;
}

export async function routeAskAgentQuery(
  message: string,
  hints: { ticker?: string; sector?: string; stockName?: string }
): Promise<AskAgentRoute> {
  if (shouldRunNewsAgent(message)) {
    return { kind: 'news', stock: null, stockPhrase: null };
  }

  if (hints.ticker) {
    const fromTicker = await resolveStock(hints.ticker);
    if (fromTicker) {
      return { kind: 'stock-analysis', stock: fromTicker, stockPhrase: hints.ticker };
    }
  }

  if (hints.stockName && !hints.ticker) {
    const fromName = await resolveStock(hints.stockName);
    if (fromName) {
      return { kind: 'stock-analysis', stock: fromName, stockPhrase: hints.stockName };
    }
  }

  const phrase = extractStockPhraseFromMessage(message);
  if (!phrase) {
    return { kind: 'general', stock: null, stockPhrase: null };
  }

  let resolved = await resolveStock(phrase);
  let fuzzyStockMatch = Boolean(resolved?.fuzzyMatch);

  if (!resolved) {
    resolved = await resolveStockClosest(phrase);
    fuzzyStockMatch = Boolean(resolved);
  }

  if (!resolved) {
    const tokens = phrase.split(/\s+/).filter((t) => t.length >= 3);
    for (const tok of tokens) {
      resolved = (await resolveStock(tok)) ?? (await resolveStockClosest(tok));
      if (resolved) {
        fuzzyStockMatch = Boolean(resolved.fuzzyMatch ?? true);
        break;
      }
    }
  }

  if (!resolved) {
    return { kind: 'general', stock: null, stockPhrase: phrase };
  }

  if (looksLikeStockAnalysisIntent(message, phrase)) {
    return {
      kind: 'stock-analysis',
      stock: resolved,
      stockPhrase: resolved.resolvedFrom ?? phrase,
      fuzzyStockMatch,
    };
  }

  // Resolved symbol but open-ended question — still attach stock for context
  return {
    kind: 'general',
    stock: resolved,
    stockPhrase: resolved.resolvedFrom ?? phrase,
    fuzzyStockMatch,
  };
}
