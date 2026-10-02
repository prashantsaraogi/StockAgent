'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useStockSearchSuggestions } from '@/hooks/useStockSearchSuggestions';
import type { PeScorecardResult } from '@/lib/pe-evaluation-scorecard';
import { PeScorecardResults } from '@/components/PeScorecardResults';
import { StockSearchSuggestions } from '@/components/StockSearchSuggestions';
import type { StockSearchResult } from '@/lib/stock-search';

export function PeEvaluationPanel() {
  const router = useRouter();
  const [stockName, setStockName] = useState('');
  const [selected, setSelected] = useState<StockSearchResult | null>(null);
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const { suggestions, queueSearch } = useStockSearchSuggestions();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<PeScorecardResult | null>(null);
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
      const res = await fetch('/api/stock-calculator/pe-evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker,
          purchasePrice: Number(purchasePrice),
          purchaseDate,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error ?? 'Scorecard failed');
        return;
      }
      setData(json.scorecard);
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
    <div className="pe-evaluation-panel">
      <section className="card wide">
        <h2>Stock Valuation Scorecard</h2>
        <p className="muted small">
          Separates <strong>“Was my purchase good?”</strong> (Part A/B) from{' '}
          <strong>“Is the stock attractive today?”</strong> (Part C) plus an interactive{' '}
          <strong>Gordon fair P/E</strong> anchor (Part D). Each run is saved to your private
          history. Reads <code>PARAMETERS_[TICKER].md</code> + live CMP.
        </p>

        <form onSubmit={submit} className="holding-form calculator-form">
          <div className="form-row" ref={wrapRef}>
            <label htmlFor="pe-stock">Stock name</label>
            <input
              id="pe-stock"
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

          <div className="form-row-grid">
            <div className="form-row">
              <label htmlFor="pe-purchase-price">Purchase price (₹)</label>
              <input
                id="pe-purchase-price"
                type="number"
                min="1"
                step="0.01"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="e.g. 12000"
                required
              />
            </div>
            <div className="form-row">
              <label htmlFor="pe-purchase-date">Purchase date</label>
              <input
                id="pe-purchase-date"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Running scorecard…' : 'Run PE scorecard'}
          </button>
        </form>
      </section>

      {data && (
        <PeScorecardResults
          data={data}
          recordId={recordId ?? undefined}
          savedAt={savedAt ?? undefined}
        />
      )}
    </div>
  );
}
