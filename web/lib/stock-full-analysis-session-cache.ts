import type { StockCalculatorFullResult } from './stock-calculator-full';
import type { FullAnalysisChildIds } from './stock-calculator-full-history';

const KEY_PREFIX = 'stock-full-v1:';

export interface CachedFullAnalysis {
  id: string;
  createdAt: string;
  ticker: string;
  stockName: string;
  sector: string;
  childIds: FullAnalysisChildIds;
  analysis: StockCalculatorFullResult;
  historyPersisted?: boolean;
}

export function sessionCacheKey(recordId: string): string {
  return `${KEY_PREFIX}${recordId}`;
}

export function writeFullAnalysisSessionCache(payload: CachedFullAnalysis): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(sessionCacheKey(payload.id), JSON.stringify(payload));
  } catch {
    /* quota / private mode */
  }
}

export function readFullAnalysisSessionCache(recordId: string): CachedFullAnalysis | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(sessionCacheKey(recordId));
    if (!raw) return null;
    return JSON.parse(raw) as CachedFullAnalysis;
  } catch {
    return null;
  }
}

/** Runs stored in this browser tab/session (Vercel fallback when server history is empty). */
export function listFullAnalysisSessionCache(): CachedFullAnalysis[] {
  if (typeof window === 'undefined') return [];
  const out: CachedFullAnalysis[] = [];
  try {
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (!key?.startsWith(KEY_PREFIX)) continue;
      const id = key.slice(KEY_PREFIX.length);
      const item = readFullAnalysisSessionCache(id);
      if (item) out.push(item);
    }
  } catch {
    return [];
  }
  return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
