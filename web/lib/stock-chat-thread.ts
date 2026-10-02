/**
 * Per-stock Ask Agent thread — survives navigation (browser localStorage).
 * Server backup: GET /api/chat/history?ticker=
 */

export interface StockChatMessage {
  role: 'user' | 'agent';
  text: string;
  meta?: {
    mode?: string;
    inboxPath?: string;
    analysisId?: string;
    analysisPath?: string;
  };
}

export interface StockChatThread {
  version: 1;
  sessionId: string;
  updatedAt: string;
  messages: StockChatMessage[];
}

const STORAGE_PREFIX = 'my-agent-stock-thread:v1:';

export type StockChatScope = {
  ticker?: string;
  sector?: string;
  stockName?: string;
};

/** Stable key for this stock's sidebar thread (null = global /chat — no persist). */
export function stockChatThreadKey(scope: StockChatScope | undefined): string | null {
  if (!scope) return null;
  if (scope.ticker?.trim()) return scope.ticker.trim().toUpperCase();
  if (scope.stockName?.trim() && scope.sector?.trim()) {
    return `${scope.sector.trim()}::${scope.stockName.trim()}`;
  }
  if (scope.stockName?.trim()) return scope.stockName.trim();
  return null;
}

function storageKey(threadKey: string): string {
  return STORAGE_PREFIX + threadKey;
}

export function loadStockChatThread(threadKey: string): StockChatThread | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(storageKey(threadKey));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StockChatThread;
    if (parsed?.version !== 1 || !Array.isArray(parsed.messages)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function persistStockChatThread(threadKey: string, thread: Omit<StockChatThread, 'version' | 'updatedAt'>): void {
  if (typeof window === 'undefined') return;
  const payload: StockChatThread = {
    version: 1,
    sessionId: thread.sessionId,
    updatedAt: new Date().toISOString(),
    messages: thread.messages,
  };
  try {
    localStorage.setItem(storageKey(threadKey), JSON.stringify(payload));
  } catch {
    /* quota or private mode */
  }
}

export function clearStockChatThread(threadKey: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(storageKey(threadKey));
  } catch {
    /* ignore */
  }
}
