'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AnalysisSummaryVideoPlayer } from '@/components/AnalysisSummaryVideoPlayer';
import { buildAnalysisSummarySlides } from '@/lib/analysis-summary-slides';
import { loadFullAnalysisEntry } from '@/lib/load-full-analysis-client';
import { STOCK_ANALYSIS_TITLE } from '@/lib/navigation';

interface Props {
  recordId: string;
  recordMode?: boolean;
}

export function SummaryVideoDetailLoader({ recordId, recordMode = false }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stockName, setStockName] = useState('');
  const [ticker, setTicker] = useState('');
  const [slides, setSlides] = useState<ReturnType<typeof buildAnalysisSummarySlides>>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      const entry = await loadFullAnalysisEntry(recordId);
      if (cancelled) return;
      if (!entry?.analysis) {
        setError(
          'This summary needs the same browser session as your analysis run, or server history. Run Stock Analysis again, then open 60s summary from that page.'
        );
        setLoading(false);
        return;
      }
      setStockName(entry.stockName);
      setTicker(entry.ticker);
      setSlides(buildAnalysisSummarySlides(entry.analysis));
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [recordId]);

  const captureHref = useMemo(
    () => `/stock-calculator/full/${recordId}/summary-video?record=1`,
    [recordId]
  );

  if (loading) {
    return (
      <div className="page">
        <p className="muted">Loading 60s summary…</p>
      </div>
    );
  }

  if (error || slides.length === 0) {
    return (
      <div className="page">
        <Link href={`/stock-calculator/full/${recordId}`} className="back-link">
          ← Back to analysis
        </Link>
        <section className="card wide">
          <p className="form-error">{error || 'Could not build summary.'}</p>
          <Link href="/stock-calculator" className="btn-primary">
            {STOCK_ANALYSIS_TITLE} →
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className={`page ${recordMode ? 'asv-page-record' : ''}`}>
      {!recordMode && (
        <>
          <Link href={`/stock-calculator/full/${recordId}`} className="back-link">
            ← Back to full analysis
          </Link>
          <header className="page-header">
            <h1>
              60s summary — {stockName} ({ticker})
            </h1>
            <p className="muted small">
              Built from your Stock Analysis run · screen-record for YouTube
            </p>
          </header>
        </>
      )}

      <AnalysisSummaryVideoPlayer slides={slides} recordMode={recordMode} />

      {!recordMode && (
        <p className="muted small" style={{ marginTop: '1rem' }}>
          Clean capture: <Link href={captureHref}>open record mode</Link>
        </p>
      )}
    </div>
  );
}
