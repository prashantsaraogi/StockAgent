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
  isGlobalAskAgentThread,
  loadStockChatThread,
  persistStockChatThread,
  stockChatThreadKey,
  type StockChatMessage,
} from '@/lib/stock-chat-thread';
import { useStockSearchSuggestions } from '@/hooks/useStockSearchSuggestions';
import type { StockSearchResult } from '@/lib/stock-search';

interface ChatPanelProps {
  /** When true (default if ticker set), show structured quick questions */
  showStockQuestions?: boolean;
  context?: { ticker?: string; sector?: string; stockName?: string };
}

export function ChatPanel({ showStockQuestions, context }: ChatPanelProps) {
  const stockScoped = Boolean(context?.ticker || context?.stockName);
  const showQuick = showStockQuestions ?? stockScoped;
  const threadKey = stockChatThreadKey(context);

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
  const [loading, setLoading] = useState(false);
  const [loadingHint, setLoadingHint] = useState('');
  const [hydrating, setHydrating] = useState(threadKey != null);
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
      const globalThread = isGlobalAskAgentThread(threadKey);
      const local = loadStockChatThread(threadKey!);

      const params = new URLSearchParams();
      if (context?.ticker) params.set('ticker', context.ticker);
      else if (context?.stockName) params.set('stockName', context.stockName);
      else if (globalThread) params.set('scope', 'user');

      let serverMessages: StockChatMessage[] | null = null;
      let serverSessionId: string | undefined;

      try {
        const res = await fetch(`/api/chat/history?${params.toString()}`);
        const data = await res.json();
        if (data.ok && Array.isArray(data.messages) && data.messages.length > 0) {
          serverMessages = data.messages as StockChatMessage[];
          serverSessionId = data.sessionId;
        }
      } catch {
        /* offline — fall back to local only */
      }

      if (globalThread && serverMessages?.length) {
        const useServer =
          !local?.messages.length ||
          serverMessages.length > local.messages.length ||
          (serverSessionId != null && local.sessionId !== serverSessionId);
        if (useServer) {
          sessionIdRef.current = serverSessionId ?? createSessionId();
          if (!cancelled) setMessages(serverMessages);
          persistStockChatThread(threadKey!, {
            sessionId: sessionIdRef.current,
            messages: serverMessages,
          });
          if (!cancelled) setHydrating(false);
          return;
        }
      }

      if (local?.messages.length) {
        sessionIdRef.current = local.sessionId;
        if (!cancelled) setMessages(local.messages);
        if (!cancelled) setHydrating(false);
        return;
      }

      if (serverMessages?.length) {
        sessionIdRef.current = serverSessionId ?? createSessionId();
        if (!cancelled) setMessages(serverMessages);
        persistStockChatThread(threadKey!, {
          sessionId: sessionIdRef.current,
          messages: serverMessages,
        });
      } else {
        sessionIdRef.current = createSessionId();
      }

      if (!cancelled) setHydrating(false);
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
    selectedStock?: StockSearchResult | null;
  }) {
    const trimmed = payload.message.trim();
    if (!trimmed || loading || hydrating) return;

    const withUser: StockChatMessage[] = [...messages, { role: 'user', text: trimmed }];
    setMessages(withUser);
    saveThread(withUser);
    setLoading(true);
    setLoadingHint(
      `Building investment view${payload.selectedStock ? ` for ${payload.selectedStock.ticker}` : ''}…`
    );

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          sessionId: sessionIdRef.current,
          queryMode: 'stock',
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
        selectedStock: null,
      });
      return;
    }

    if (!stock) return;

    void postChat({
      message: `Investment view for ${stock.company} (${stock.ticker})`,
      selectedStock: stock,
    });
  }

  function sendText(text: string) {
    void postChat({
      message: text,
      selectedStock: stockScoped ? selectedStock : selectedStock,
    });
  }

  function clearThread() {
    if (!threadKey) return;
    const label = isGlobalAskAgentThread(threadKey)
      ? 'Clear this device’s Ask Agent thread? (Your Analysis Log on the server stays.)'
      : 'Clear this stock’s conversation on this device? (Analysis Log entries stay.)';
    if (!window.confirm(label)) {
      return;
    }
    clearStockChatThread(threadKey);
    sessionIdRef.current = createSessionId();
    setMessages([]);
  }

  return (
    <div className="chat-panel">
      {threadKey && messages.length > 0 && (
        <div className="chat-thread-toolbar">
          <span className="muted small">
            {messages.length} message{messages.length === 1 ? '' : 's'} ·{' '}
            {isGlobalAskAgentThread(threadKey)
              ? 'saved to your account'
              : 'saved for this stock'}
            {isGlobalAskAgentThread(threadKey) && (
              <>
                {' '}
                · <Link href="/journal/analysis">Analysis Log</Link>
              </>
            )}
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
            <p>
              Pick a stock name or ticker for a structured <strong>investment view</strong> (factor
              lens, scorecard, valuation, what to do). Portfolio-wide or news workflows live in{' '}
              <Link href="/chat/prompts">Prompt library</Link> (Cursor) or{' '}
              <Link href="/journal/news">Journal → News</Link>.
            </p>
            <ul>
              <li>Uses your holdings, StockBook, and live CMP where available</li>
              <li>Saved to <strong>Analysis Log</strong></li>
            </ul>
            {showQuick && (
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

      <div className="chat-input-stack">
        {!stockScoped && (
          <div className="form-field autocomplete-wrap chat-stock-search" ref={stockWrapRef}>
            <label htmlFor="chat-stock-search">Stock name or ticker</label>
            <input
              id="chat-stock-search"
              type="text"
              placeholder="e.g. PFC, ITC, or Cipla"
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
    </div>
  );
}
