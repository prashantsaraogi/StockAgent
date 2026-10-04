'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { StockCalculatorFullResults, type FullResultTabId } from '@/components/StockCalculatorFullResults';
import { StockAnalysisRefreshBar } from '@/components/StockAnalysisRefreshBar';
import { STOCK_ANALYSIS_TITLE } from '@/lib/navigation';
import {
  readFullAnalysisSessionCache,
  writeFullAnalysisSessionCache,
  type CachedFullAnalysis,
} from '@/lib/stock-full-analysis-session-cache';

interface Props {
  recordId: string;
  initialTab?: FullResultTabId;
}

export function FullAnalysisDetailLoader({ recordId, initialTab }: Props) {
  const [entry, setEntry] = useState<CachedFullAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [fromSession, setFromSession] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(
          `/api/stock-calculator/full?recordId=${encodeURIComponent(recordId)}`
        );
        const data = await res.json();
        if (!cancelled && data.ok && data.entry) {
          const e = data.entry as CachedFullAnalysis;
          writeFullAnalysisSessionCache(e);
          setEntry(e);
          setFromSession(false);
          setLoading(false);
          return;
        }
      } catch {
        /* try session cache */
      }

      const cached = readFullAnalysisSessionCache(recordId);
      if (!cancelled && cached) {
        setEntry(cached);
        setFromSession(true);
        setLoading(false);
        return;
      }

      if (!cancelled) {
        setError('This analysis is not in your saved history on the server (common on Vercel without Supabase). Run Basic Analysis again from Stock Analysis.');
        setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [recordId]);

  if (loading) {
    return (
      <div className="page">
        <p className="muted">Loading analysis…</p>
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="page">
        <Link href="/stock-calculator" className="back-link">
          ← {STOCK_ANALYSIS_TITLE}
        </Link>
        <section className="card wide">
          <p className="form-error">{error || 'Analysis not found.'}</p>
          <Link href="/stock-calculator" className="btn-primary">
            Run Stock Analysis →
          </Link>
        </section>
      </div>
    );
  }

  const when = new Date(entry.createdAt).toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  return (
    <div className="page">
      <Link href="/stock-calculator" className="back-link">
        ← {STOCK_ANALYSIS_TITLE}
      </Link>

      <header className="page-header">
        <h1>
          {entry.stockName} ({entry.ticker})
        </h1>
        <p className="muted">
          Full analysis · {when} · {entry.sector}
          {fromSession && (
            <>
              {' '}
              · <span className="tag">This browser session only</span>
            </>
          )}
        </p>
        <p className="muted small">
          <Link href="/stock-calculator/history">All saved analyses</Link>
          {' · '}
          Use the tabs below for Investment view, Overview, and each module (CAGR, P/E, earnings,
          margin, business quality, risk).
        </p>
      </header>

      {!fromSession && (
        <StockAnalysisRefreshBar
          recordId={entry.id}
          ticker={entry.ticker}
          stockName={entry.stockName}
          inputs={entry.analysis.inputs}
          basicAnalysis={entry.analysis.basicAnalysis ?? false}
          savedAt={entry.createdAt}
        />
      )}

      {fromSession && (
        <section className="card wide">
          <p className="muted small">
            Saved to this browser for this session. Sign in with <strong>Supabase</strong> and apply
            migrations 009–010 for permanent history and refresh on the server.
          </p>
        </section>
      )}

      <StockCalculatorFullResults
        analysis={entry.analysis}
        fullRecordId={entry.id}
        childIds={entry.childIds}
        savedAt={entry.createdAt}
        initialTab={initialTab}
        preferFrameworkTab={entry.analysis.basicAnalysis ?? Boolean(entry.analysis.frameworkReport)}
      />
    </div>
  );
}
