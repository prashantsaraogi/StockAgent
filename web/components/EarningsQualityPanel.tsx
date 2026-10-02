'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useStockSearchSuggestions } from '@/hooks/useStockSearchSuggestions';
import type { EarningsQualityResult } from '@/lib/earnings-quality';
import { EarningsQualityResults } from '@/components/EarningsQualityResults';
import { StockSearchSuggestions } from '@/components/StockSearchSuggestions';
import type { StockSearchResult } from '@/lib/stock-search';

export function EarningsQualityPanel() {
  const router = useRouter();
  const [stockName, setStockName] = useState('');
  const [selected, setSelected] = useState<StockSearchResult | null>(null);
  const { suggestions, queueSearch } = useStockSearchSuggestions();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<EarningsQualityResult | null>(null);
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

    const ticker = selected?.ticker ?? stockName.trim();
    if (!ticker) {
      setError('Select a stock from StockBook.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/stock-calculator/earnings-quality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker }),
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
    <div className="eq-panel">
      <section className="card wide">
        <h2>⭐ Earnings Quality</h2>
        <p className="muted small">
          P/E tells you price relative to earnings — not whether earnings are <strong>good</strong>{' '}
          earnings. Reads <code>EARNINGS_QUALITY_[TICKER].md</code> +{' '}
          <code>PARAMETERS_[TICKER].md</code>. Each run saved to your history.
        </p>

        <form onSubmit={submit} className="holding-form calculator-form">
          <div className="form-row" ref={wrapRef}>
            <label htmlFor="eq-stock">Stock name</label>
            <input
              id="eq-stock"
              type="text"
              value={stockName}
              onChange={(e) => onStockInput(e.target.value)}
              placeholder="Search e.g. Maruti, HDFCBANK"
              autoComplete="off"
              required
            />
            {showSuggestions && suggestions.length > 0 && (
              <StockSearchSuggestions suggestions={suggestions} onPick={pickStock} />
            )}
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Analyzing earnings quality…' : 'Run earnings quality analysis'}
          </button>
        </form>
      </section>

      {data && (
        <EarningsQualityResults
          data={data}
          recordId={recordId ?? undefined}
          savedAt={savedAt ?? undefined}
        />
      )}
    </div>
  );
}
