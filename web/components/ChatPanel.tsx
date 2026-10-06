'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MarkdownView } from './MarkdownView';
import { StockSearchSuggestions } from './StockSearchSuggestions';
import { createSessionId } from '@/lib/session-id';
import { STOCK_QUICK_QUESTIONS } from '@/lib/stock-question-types';
import { sanitizeUserFacingAnswer } from '@/lib/investor-report-format';
import {
  clearStockChatThread,
  loadStockChatThread,
  persistStockChatThread,
  stockChatThreadKey,
  type StockChatMessage,
} from '@/lib/stock-chat-thread';
import { useStockSearchSuggestions } from '@/hooks/useStockSearchSuggestions';
import type { StockSearchResult } from '@/lib/stock-search';

export type AskAgentQueryMode = 'stock' | 'general';

interface ChatPanelProps {
  /** When true (default if ticker set), show structured quick questions */
  showStockQuestions?: boolean;
  context?: { ticker?: string; sector?: string; stockName?: string };
  /** Global /chat only — StockBook sidebar always uses stock mode. */
  defaultQueryMode?: AskAgentQueryMode;
}

export function ChatPanel({
  showStockQuestions,
  context,
  defaultQueryMode = 'stock',
}: ChatPanelProps) {
  const stockScoped = Boolean(context?.ticker || context?.stockName);
  const showQuick = showStockQuestions ?? stockScoped;
  const threadKey = stockChatThreadKey(context);

  const [queryMode, setQueryMode] = useState<AskAgentQueryMode>(
    stockScoped ? 'stock' : defaultQueryMode
  );
  const [selectedStock, setSelectedStock] = useState<StockSearchResult | null>(
    context?.ticker
      ? {
          ticker: context.ticker.toUpperCase(),
          company: context.stockName ?? context.ticker,
          sector: context.sector ?? 'Other',
          source: 'stockbook' as const,
          inStockBook: true,
          resolvedFrom: context.ticker,
        }
      : null
  );
  const [stockQuery, setStockQuery] = useState('');
  const { suggestions, queueSearch, clearSuggestions } = useStockSearchSuggestions();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const stockWrapRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<StockChatMessage[]>([]);
  const [generalInput, setGeneralInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHint, setLoadingHint] = useState('');
  const [hydrating, setHydrating] = useState(Boolean(threadKey));
  const sessionIdRef = useRef('web-session-pending');
  const bottomRef = useRef<HTMLDivElement>(null);

  const saveThread = useCallback(
    (next: StockChatMessage[]) => {
      if (!threadKey) return;
      persistStockChatThread(threadKey, {
        sessionId: sessionIdRef.current,
        messages: next,
      });
    },
    [threadKey]
  );

  useEffect(() => {
    if (!threadKey) {
      sessionIdRef.current = createSessionId();
      setHydrating(false);
      return;
    }

    let cancelled = false;

    async function hydrate() {
      setHydrating(true);
      const local = loadStockChatThread(threadKey!);
      if (local?.messages.length) {
        sessionIdRef.current = local.sessionId;
        if (!cancelled) setMessages(local.messages);
        if (!cancelled) setHydrating(false);
        return;
      }

      const params = new URLSearchParams();
      if (context?.ticker) params.set('ticker', context.ticker);
      else if (context?.stockName) params.set('stockName', context.stockName);

      try {
        const res = await fetch(`/api/chat/history?${params.toString()}`);
        const data = await res.json();
        if (cancelled) return;
        if (data.ok && Array.isArray(data.messages) && data.messages.length > 0) {
          sessionIdRef.current = data.sessionId ?? createSessionId();
          setMessages(data.messages);
          persistStockChatThread(threadKey!, {
            sessionId: sessionIdRef.current,
            messages: data.messages,
          });
        } else {
          sessionIdRef.current = createSessionId();
        }
      } catch {
        if (!cancelled) sessionIdRef.current = createSessionId();
      } finally {
        if (!cancelled) setHydrating(false);
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [threadKey, context?.ticker, context?.stockName]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (stockWrapRef.current && !stockWrapRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  function pickStock(opt: StockSearchResult) {
    setSelectedStock(opt);
    setStockQuery(`${opt.company} (${opt.ticker})`);
    setShowSuggestions(false);
    clearSuggestions();
  }

  async function postChat(payload: {
    message: string;
    queryMode: AskAgentQueryMode;
    selectedStock?: StockSearchResult | null;
  }) {
    const trimmed = payload.message.trim();
    if (!trimmed || loading || hydrating) return;

    const withUser: StockChatMessage[] = [...messages, { role: 'user', text: trimmed }];
    setMessages(withUser);
    saveThread(withUser);
    setLoading(true);
    setLoadingHint(
      payload.queryMode === 'stock'
        ? `Building investment view${payload.selectedStock ? ` for ${payload.selectedStock.ticker}` : ''}…`
        : 'Preparing summary…'
    );

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          sessionId: sessionIdRef.current,
          queryMode: payload.queryMode,
          selectedStock: payload.selectedStock
            ? {
                ticker: payload.selectedStock.ticker,
                company: payload.selectedStock.company,
                sector: payload.selectedStock.sector,
              }
            : undefined,
          ...context,
        }),
      });
      const data = await res.json();
      const withAgent: StockChatMessage[] = [
        ...withUser,
        {
          role: 'agent',
          text: data.ok ? data.answer : `Error: ${data.error}`,
          meta: data.meta,
        },
      ];
      setMessages(withAgent);
      saveThread(withAgent);
    } catch {
      const withErr: StockChatMessage[] = [
        ...withUser,
        { role: 'agent', text: 'Network error — try again.' },
      ];
      setMessages(withErr);
      saveThread(withErr);
    } finally {
      setLoading(false);
      setLoadingHint('');
    }
  }

  function sendStockAnalysis() {
    const stock =
      selectedStock ??
      (context?.ticker
        ? {
            ticker: context.ticker.toUpperCase(),
            company: context.stockName ?? context.ticker,
            sector: context.sector ?? 'Other',
            source: 'stockbook' as const,
            inStockBook: true,
            resolvedFrom: context.ticker,
          }
        : null);

    if (!stock && !stockScoped) {
      const q = stockQuery.trim();
      if (!q) return;
      void postChat({
        message: q,
        queryMode: 'stock',
        selectedStock: null,
      });
      return;
    }

    if (!stock) return;

    void postChat({
      message: `Investment view for ${stock.company} (${stock.ticker})`,
      queryMode: 'stock',
      selectedStock: stock,
    });
  }

  function sendGeneral() {
    const trimmed = generalInput.trim();
    if (!trimmed) return;
    setGeneralInput('');
    void postChat({ message: trimmed, queryMode: 'general' });
  }

  function sendText(text: string) {
    void postChat({
      message: text,
      queryMode: stockScoped ? 'stock' : queryMode,
      selectedStock: stockScoped ? selectedStock : queryMode === 'stock' ? selectedStock : null,
    });
  }

  function clearThread() {
    if (!threadKey) return;
    if (!window.confirm('Clear this stock’s conversation on this device? (Analysis Log entries stay.)')) {
      return;
    }
    clearStockChatThread(threadKey);
    sessionIdRef.current = createSessionId();
    setMessages([]);
  }

  const activeMode: AskAgentQueryMode = stockScoped ? 'stock' : queryMode;

  return (
    <div className="chat-panel">
      {!stockScoped && (
        <div className="chat-mode-tabs" role="tablist" aria-label="Ask Agent mode">
          <button
            type="button"
            role="tab"
            aria-selected={queryMode === 'stock'}
            className={queryMode === 'stock' ? 'active' : ''}
            onClick={() => setQueryMode('stock')}
          >
            Stock search
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={queryMode === 'general'}
            className={queryMode === 'general' ? 'active' : ''}
            onClick={() => setQueryMode('general')}
          >
            General question
          </button>
        </div>
      )}

      {threadKey && messages.length > 0 && (
        <div className="chat-thread-toolbar">
          <span className="muted small">
            {messages.length} message{messages.length === 1 ? '' : 's'} · saved for this stock
          </span>
          <button type="button" className="link-btn small" onClick={clearThread}>
            Clear
          </button>
        </div>
      )}

      <div className="chat-messages">
        {hydrating && (
          <div className="chat-bubble agent loading muted small">Loading conversation…</div>
        )}
        {!hydrating && messages.length === 0 && (
          <div className="chat-empty">
            {activeMode === 'stock' ? (
              <>
                <p>
                  <strong>Stock search</strong> — pick a name, get a concise{' '}
                  <strong>investment view</strong> (position, valuation, what to do). No jargon or
                  internal workflow in the reply.
                </p>
                <ul>
                  <li>Uses your holdings, StockBook, and live CMP where available</li>
                  <li>Saved to <strong>Analysis Log</strong></li>
                </ul>
              </>
            ) : (
              <>
                <p>
                  <strong>General question</strong> — portfolio, sectors, news, compare names, or
                  process. You get a <strong>summary-first</strong> answer with only useful detail.
                </p>
                <ul>
                  <li>Not a full stock report unless you ask about a specific name</li>
                  <li>Saved to <strong>Analysis Log</strong></li>
                </ul>
              </>
            )}
            {showQuick && activeMode === 'stock' && (
              <div className="stock-quick-questions">
                <p className="muted small">Quick prompts for this stock:</p>
                <div className="stock-quick-questions-grid">
                  {STOCK_QUICK_QUESTIONS.map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      className="stock-quick-q"
                      disabled={loading || hydrating}
                      onClick={() => sendText(q.prompt)}
                      title={q.prompt}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <p className="chat-empty-link">
              <a href="/chat/prompts">Prompt library →</a>
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.role}`}>
            {msg.role === 'agent' ? (
              <>
                <MarkdownView content={sanitizeUserFacingAnswer(msg.text)} />
                {msg.meta?.analysisType === 'stock-full' && (
                  <p className="muted small chat-meta">Investment view report</p>
                )}
                {msg.meta?.analysisType === 'general' && (
                  <p className="muted small chat-meta">Summary answer</p>
                )}
                {msg.meta?.analysisPath && (
                  <p className="muted small chat-meta">
                    <Link href={msg.meta.analysisPath}>Open in Analysis Log →</Link>
                  </p>
                )}
              </>
            ) : (
              <p>{msg.text}</p>
            )}
          </div>
        ))}
        {loading && (
          <div className="chat-bubble agent loading">{loadingHint || 'Working…'}</div>
        )}
        <div ref={bottomRef} />
      </div>

      {activeMode === 'stock' ? (
        <div className="chat-input-stack">
          {!stockScoped && (
            <div className="form-field autocomplete-wrap chat-stock-search" ref={stockWrapRef}>
              <label htmlFor="chat-stock-search">Stock name or ticker</label>
              <input
                id="chat-stock-search"
                type="text"
                placeholder="e.g. ITC or Cipla"
                value={stockQuery}
                onChange={(e) => {
                  setStockQuery(e.target.value);
                  setSelectedStock(null);
                  queueSearch(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => stockQuery && setShowSuggestions(true)}
                disabled={loading || hydrating}
                autoComplete="off"
              />
              {selectedStock && (
                <p className="field-hint ok">
                  {selectedStock.ticker} · {selectedStock.sector}
                </p>
              )}
              {showSuggestions && suggestions.length > 0 && (
                <StockSearchSuggestions suggestions={suggestions} onPick={pickStock} />
              )}
            </div>
          )}
          {stockScoped && context?.ticker && (
            <p className="muted small chat-stock-pinned">
              Stock: <strong>{context.stockName ?? context.ticker}</strong> ({context.ticker})
            </p>
          )}
          <button
            type="button"
            className="btn-primary"
            onClick={sendStockAnalysis}
            disabled={loading || hydrating || (!stockScoped && !selectedStock && !stockQuery.trim())}
          >
            {loading ? '…' : 'Analyze stock'}
          </button>
        </div>
      ) : (
        <div className="chat-input-row">
          <textarea
            value={generalInput}
            onChange={(e) => setGeneralInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendGeneral();
              }
            }}
            placeholder="Ask anything — e.g. Where should surplus go this month? Summarize today’s news for my holdings."
            rows={3}
            disabled={loading || hydrating}
          />
          <button
            type="button"
            className="btn-primary"
            onClick={sendGeneral}
            disabled={loading || hydrating}
          >
            {loading ? '…' : 'Ask'}
          </button>
        </div>
      )}
    </div>
  );
}
