'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MarkdownView } from './MarkdownView';
import { createSessionId } from '@/lib/session-id';
import { STOCK_QUICK_QUESTIONS } from '@/lib/stock-question-types';
import {
  clearStockChatThread,
  loadStockChatThread,
  persistStockChatThread,
  stockChatThreadKey,
  type StockChatMessage,
} from '@/lib/stock-chat-thread';

interface ChatPanelProps {
  placeholder?: string;
  /** When true (default if ticker set), show structured quick questions */
  showStockQuestions?: boolean;
  context?: { ticker?: string; sector?: string; stockName?: string };
}

export function ChatPanel({
  placeholder = 'Ask about a stock, PCCL, sector rank, or buy decision…',
  showStockQuestions,
  context,
}: ChatPanelProps) {
  const stockScoped = Boolean(context?.ticker || context?.stockName);
  const showQuick = showStockQuestions ?? stockScoped;
  const threadKey = stockChatThreadKey(context);

  const [messages, setMessages] = useState<StockChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
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
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function sendText(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading || hydrating) return;
    setInput('');
    const withUser: StockChatMessage[] = [...messages, { role: 'user', text: trimmed }];
    setMessages(withUser);
    saveThread(withUser);
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, sessionId: sessionIdRef.current, ...context }),
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
    }
  }

  function send() {
    sendText(input);
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

  return (
    <div className="chat-panel">
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
            <p>
              Answers run through your <strong>core investment framework first</strong> — not generic AI.
            </p>
            <ul>
              <li>Precedence: AGENT-RULES → buy-decision-workflow → your holdings & StockBook</li>
              <li>Every reply saved to your <strong>Analysis Log</strong> (sector → cap → history)</li>
              {threadKey && (
                <li>Questions on this stock <strong>stay here</strong> when you switch tabs or leave and return</li>
              )}
              <li>Buy/add → full buy-decision-workflow + PCCL + quotes lens</li>
            </ul>
            {showQuick && (
              <div className="stock-quick-questions">
                <p className="muted small">Structured stock questions (P/E sync, results, PCCL…):</p>
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
              <a href="/chat/prompts">Prompt Guidelines →</a> ·{' '}
              <a href="/readme/documentation/stock-question-framework">Stock question framework</a>
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.role}`}>
            {msg.role === 'agent' ? (
              <>
                <MarkdownView content={msg.text} />
                {msg.meta?.mode === 'gemini' && (
                  <p className="muted small chat-meta">
                    Framework-first · Gemini synthesis (rules override generic AI)
                  </p>
                )}
                {msg.meta?.mode === 'framework-local' && (
                  <p className="muted small chat-meta">
                    Framework-first · local executor · add GOOGLE_GENERATIVE_AI_API_KEY for richer synthesis
                  </p>
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
        {loading && <div className="chat-bubble agent loading">Applying core framework…</div>}
        <div ref={bottomRef} />
      </div>
      <div className="chat-input-row">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder={placeholder}
          rows={2}
          disabled={loading || hydrating}
        />
        <button
          type="button"
          className="btn-primary"
          onClick={send}
          disabled={loading || hydrating}
        >
          {loading ? '…' : 'Ask'}
        </button>
      </div>
    </div>
  );
}
