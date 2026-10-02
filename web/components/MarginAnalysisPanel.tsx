'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useStockSearchSuggestions } from '@/hooks/useStockSearchSuggestions';
import type { MarginAnalysisResult } from '@/lib/margin-analysis';
import { MarginAnalysisResults } from '@/components/MarginAnalysisResults';
import { StockSearchSuggestions } from '@/components/StockSearchSuggestions';
import type { StockSearchResult } from '@/lib/stock-search';

export function MarginAnalysisPanel() {
  const router = useRouter();
  const [stockName, setStockName] = useState('');
  const [selected, setSelected] = useState<StockSearchResult | null>(null);
  const { suggestions, queueSearch } = useStockSearchSuggestions();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<MarginAnalysisResult | null>(null);
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
      const res = await fetch('/api/stock-calculator/margin', {
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
    <div className="mg-panel">
      <section className="card wide">
        <h2>📊 Margin Analysis</h2>
        <p className="muted small">
          Revenue growth without margin quality is a red flag. Reads{' '}
          <code>MARGIN_[TICKER].md</code> · <code>PARAMETERS_[TICKER].md</code> · quarterly margins
          from <code>EARNINGS_QUALITY_[TICKER].md</code>.
        </p>

        <form onSubmit={submit} className="holding-form calculator-form">
          <div className="form-row" ref={wrapRef}>
            <label htmlFor="mg-stock">Stock name</label>
            <input
              id="mg-stock"
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
            {loading ? 'Analyzing margins…' : 'Run margin analysis'}
          </button>
        </form>
      </section>

      {data && (
        <MarginAnalysisResults
          data={data}
          recordId={recordId ?? undefined}
          savedAt={savedAt ?? undefined}
        />
      )}
    </div>
  );
}
