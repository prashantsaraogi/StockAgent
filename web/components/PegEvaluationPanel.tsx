'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useStockSearchSuggestions } from '@/hooks/useStockSearchSuggestions';
import type { PegEvaluationResult } from '@/lib/peg-evaluation';
import { PegEvaluationResults } from '@/components/PegEvaluationResults';
import { StockSearchSuggestions } from '@/components/StockSearchSuggestions';
import type { StockSearchResult } from '@/lib/stock-search';

export function PegEvaluationPanel() {
  const router = useRouter();
  const [stockName, setStockName] = useState('');
  const [selected, setSelected] = useState<StockSearchResult | null>(null);
  const { suggestions, queueSearch } = useStockSearchSuggestions();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<PegEvaluationResult | null>(null);
  const [recordId, setRecordId] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  function onStockInput(value: string) {
    setStockName(value);
    setSelected(null);
    setData(null);
    setRecordId(null);
    setSavedAt(null);
    setError('');
    queueSearch(value);
    setShowSuggestions(true);
  }

  function pickStock(opt: StockSearchResult) {
    setStockName(`${opt.company} (${opt.ticker})`);
    setSelected(opt);
    setShowSuggestions(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    setData(null);
    setRecordId(null);
    setSavedAt(null);

    const stockQuery = selected?.ticker ?? stockName.trim();
    if (!stockQuery) {
      setError('Enter a ticker or company name and pick from suggestions when offered.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/stock-calculator/peg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stockQuery,
          ticker: selected?.ticker,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error ?? 'Analysis failed');
        return;
      }
      setData(json.analysis);
      setRecordId(json.record?.id ?? null);
      setSavedAt(json.record?.createdAt ?? null);
      router.refresh();
    } catch {
      setError('Network error — try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="peg-panel">
      <section className="card wide">
        <h2>PEG evaluation</h2>
        <p className="muted small">
          Combines <strong>P/E · PEG · ROCE · Debt · FCF</strong> — reads{' '}
          <code>PEG_[TICKER].md</code> when present, else <code>PARAMETERS_[TICKER].md</code>. Try{' '}
          <strong>Hero (HEROMOTOCO)</strong> or <strong>ITC</strong>.
        </p>

        <form onSubmit={submit} className="holding-form calculator-form">
          <div className="form-row" ref={wrapRef}>
            <label htmlFor="peg-stock">Stock name</label>
            <input
              id="peg-stock"
              type="text"
              value={stockName}
              onChange={(e) => onStockInput(e.target.value)}
              placeholder="Search e.g. Hero, Tata Consumer, L&T"
              autoComplete="off"
              required
            />
            {showSuggestions && suggestions.length > 0 && (
              <StockSearchSuggestions suggestions={suggestions} onPick={pickStock} />
            )}
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Running PEG scorecard…' : 'Run PEG evaluation'}
          </button>
        </form>
      </section>

      {data && (
        <PegEvaluationResults
          data={data}
          recordId={recordId ?? undefined}
          savedAt={savedAt ?? undefined}
        />
      )}
    </div>
  );
}
