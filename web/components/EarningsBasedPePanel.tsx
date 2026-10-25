'use client';

import { useEffect, useRef, useState } from 'react';
import { useStockSearchSuggestions } from '@/hooks/useStockSearchSuggestions';
import { StockSearchSuggestions } from '@/components/StockSearchSuggestions';
import { EarningsBasedPeResults } from '@/components/EarningsBasedPeResults';
import type { EarningsBasedPeAnalysisResult } from '@/lib/earnings-based-pe-analysis';
import type { RunRateQuarterCount } from '@/lib/pe-quarterly-run-rate';
import type { StockSearchResult } from '@/lib/stock-search';

const N_OPTIONS: { n: RunRateQuarterCount; label: string }[] = [
  { n: 2, label: '2 quarters' },
  { n: 3, label: '3 quarters' },
  { n: 4, label: '4 quarters (default)' },
  { n: 6, label: '6 quarters' },
];

interface EarningsBasedPePanelProps {
  /** When opened from a full analysis PE tab — pre-fill ticker and hide duplicate intro. */
  defaultTicker?: string;
  defaultStockLabel?: string;
  embedded?: boolean;
}

export function EarningsBasedPePanel({
  defaultTicker,
  defaultStockLabel,
  embedded = false,
}: EarningsBasedPePanelProps = {}) {
  const [stockName, setStockName] = useState(
    defaultStockLabel ?? (defaultTicker ? defaultTicker : '')
  );
  const [selected, setSelected] = useState<StockSearchResult | null>(null);
  const [quarterCount, setQuarterCount] = useState<RunRateQuarterCount>(4);
  const { suggestions, queueSearch } = useStockSearchSuggestions();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<EarningsBasedPeAnalysisResult | null>(null);
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

    const ticker = defaultTicker ?? selected?.ticker ?? stockName.trim();
    if (!ticker) {
      setError('Select a stock from StockBook.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/stock-calculator/earnings-based-pe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker, quarterCount }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error ?? 'Calculation failed');
        return;
      }
      setData(json.analysis);
    } catch {
      setError('Network error — try again.');
    } finally {
      setLoading(false);
    }
  }

  const stockFieldId = embedded ? 'eb-pe-stock-embedded' : 'eb-pe-stock';

  return (
    <div className="earnings-based-pe-panel">
      <section className={embedded ? 'calc-full-module-section' : 'card wide'}>
        {!embedded && <h2>Earnings-based P/E vs market TTM</h2>}
        {embedded && <h3>Earnings-based P/E vs market TTM</h3>}
        <p className="muted small">
          Consolidated PAT for the latest <strong>N</strong> quarters → annualised earnings →{' '}
          <strong>market cap ÷ annualised PAT</strong>. Compare to verified{' '}
          <strong>trailing P/E (TTM)</strong> and show discount or premium. Not fair value — see{' '}
          <code>StockBook/QUARTERLY-RUN-RATE-PE.md</code>.
        </p>

        <form onSubmit={submit} className="holding-form calculator-form">
          {!defaultTicker && (
            <div className="form-row" ref={wrapRef}>
              <label htmlFor={stockFieldId}>Stock name and ticker (NSE)</label>
              <input
                id={stockFieldId}
                type="text"
                value={stockName}
                onChange={(e) => onStockInput(e.target.value)}
                placeholder="e.g. Havells India (HAVELLS)"
                autoComplete="off"
                required
              />
              {showSuggestions && suggestions.length > 0 && (
                <StockSearchSuggestions suggestions={suggestions} onPick={pickStock} />
              )}
            </div>
          )}
          {defaultTicker && (
            <p className="muted small">
              Stock: <strong>{defaultStockLabel ?? defaultTicker}</strong> (NSE:{' '}
              <strong>{defaultTicker}</strong>)
            </p>
          )}

          <fieldset className="calc-run-rate-pe-n">
            <legend className="pe-eval-label">Number of latest reported quarters</legend>
            <div className="calc-run-rate-pe-n-grid">
              {N_OPTIONS.map(({ n, label }) => (
                <label key={n} className="calc-run-rate-pe-n-option">
                  <input
                    type="radio"
                    name="eb-pe-n"
                    checked={quarterCount === n}
                    onChange={() => setQuarterCount(n)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Calculating…' : 'Calculate now'}
          </button>
        </form>
      </section>

      {data && <EarningsBasedPeResults initial={data} />}
    </div>
  );
}
