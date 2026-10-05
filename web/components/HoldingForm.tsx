'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useStockSearchSuggestions } from '@/hooks/useStockSearchSuggestions';
import { StockSearchSuggestions } from '@/components/StockSearchSuggestions';
import type { StockSearchResult } from '@/lib/stock-search';
import { notifyPortfolioHoldingsChanged } from '@/lib/portfolio-events';

export function HoldingForm() {
  const router = useRouter();
  const [stockName, setStockName] = useState('');
  const [selected, setSelected] = useState<StockSearchResult | null>(null);
  const [qty, setQty] = useState('');
  const [price, setPrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  );
  const { suggestions, queueSearch } = useStockSearchSuggestions();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    setSuccess('');
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
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/holdings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stockName: selected?.ticker ?? stockName,
          qty: Number(qty),
          price: Number(price),
          purchaseDate,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        const code = typeof data.code === 'string' ? `[${data.code}] ` : '';
        setError(`${code}${data.error ?? 'Could not save holding'}`);
        return;
      }

      const lot = data.lot as StockSearchResult & {
        sector: string;
        qty: number;
        price: number;
        purchaseDate: string;
      };
      setSuccess(
        `New lot: ${lot.qty} × ${lot.ticker} @ ₹${lot.price} on ${lot.purchaseDate} · ${lot.sector}`
      );
      setStockName('');
      setSelected(null);
      setQty('');
      setPrice('');
      notifyPortfolioHoldingsChanged();
      router.refresh();
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="holding-form card" onSubmit={submit}>
      <h2>Add holding</h2>
      <p className="muted small">
        Enter stock name or ticker — sector is assigned automatically. Buying the same stock again
        creates a <strong>new lot row</strong> (separate date, qty, price for CAGR).
      </p>

      <div className="form-grid">
        <div className="form-field autocomplete-wrap" ref={wrapRef}>
          <label htmlFor="stockName">Stock name / ticker</label>
          <input
            id="stockName"
            type="text"
            placeholder="e.g. Cipla or CIPLA"
            value={stockName}
            onChange={(e) => onStockInput(e.target.value)}
            onFocus={() => stockName && setShowSuggestions(true)}
            required
            autoComplete="off"
          />
          {selected && (
            <p className="field-hint ok">
              Sector: <strong>{selected.sector}</strong> · {selected.ticker}
            </p>
          )}
          {showSuggestions && suggestions.length > 0 && (
            <StockSearchSuggestions suggestions={suggestions} onPick={pickStock} />
          )}
        </div>

        <div className="form-field">
          <label htmlFor="qty">Quantity</label>
          <input
            id="qty"
            type="number"
            min={1}
            step={1}
            placeholder="100"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="price">Purchase price (₹)</label>
          <input
            id="price"
            type="number"
            min={0.01}
            step={0.01}
            placeholder="1220.50"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="purchaseDate">Date of purchase</label>
          <input
            id="purchaseDate"
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            required
          />
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}
      {success && <p className="form-success">{success}</p>}

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Saving…' : 'Add to portfolio'}
      </button>
    </form>
  );
}
