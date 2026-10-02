'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useStockSearchSuggestions } from '@/hooks/useStockSearchSuggestions';
import type { StockCalculatorFullResult } from '@/lib/stock-calculator-full';
import type { FullAnalysisChildIds } from '@/lib/stock-calculator-full-history';
import { StockCalculatorFullResults } from '@/components/StockCalculatorFullResults';
import { StockSearchSuggestions } from '@/components/StockSearchSuggestions';
import type { StockSearchResult } from '@/lib/stock-search';

export function StockCalculatorHub() {
  const router = useRouter();
  const [stockName, setStockName] = useState('');
  const [selected, setSelected] = useState<StockSearchResult | null>(null);
  const [peBasis, setPeBasis] = useState<'ttm' | 'forward'>('ttm');
  const [expectedCagr, setExpectedCagr] = useState('12');
  const [years, setYears] = useState('5');
  const [usePeOverride, setUsePeOverride] = useState(false);
  const [manualPe, setManualPe] = useState('');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const { suggestions, queueSearch } = useStockSearchSuggestions();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState<StockCalculatorFullResult | null>(null);
  const [recordId, setRecordId] = useState<string | null>(null);
  const [childIds, setChildIds] = useState<FullAnalysisChildIds | null>(null);
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

  function resetResults() {
    setAnalysis(null);
    setRecordId(null);
    setChildIds(null);
    setSavedAt(null);
  }

  function onStockInput(value: string) {
    setStockName(value);
    setSelected(null);
    resetResults();
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
    resetResults();
    setLoadingStep('Running CAGR, PE, Earnings Quality, Margin, Business Quality, Risk…');

    const ticker = selected?.ticker ?? stockName.trim();
    if (!ticker) {
      setError('Enter a stock name or ticker and pick from suggestions.');
      setLoading(false);
      return;
    }

    try {
      const payload: Record<string, unknown> = {
        stockQuery: ticker,
        ticker: selected?.ticker,
        peBasis,
        expectedCagrPct: Number(expectedCagr),
        years: Number(years),
      };

      if (usePeOverride && manualPe.trim()) {
        payload.manualPeOverride = Number(manualPe);
      }
      if (investmentAmount.trim()) {
        payload.investmentAmountInr = Number(investmentAmount);
      }
      if (purchasePrice.trim()) {
        payload.purchasePrice = Number(purchasePrice);
      }
      if (purchaseDate.trim()) {
        payload.purchaseDate = purchaseDate.trim();
      }

      const res = await fetch('/api/stock-calculator/full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? 'Analysis failed');
        return;
      }

      setAnalysis(data.analysis);
      setRecordId(data.record?.id ?? null);
      setChildIds(data.record?.childIds ?? null);
      setSavedAt(data.record?.createdAt ?? null);
      router.refresh();
    } catch {
      setError('Network error — try again.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  }

  return (
    <div className="calculator-layout calc-full-hub">
      <section className="card wide">
        <h2>Analyze stock — all modules</h2>
        <p className="muted small">
          Enter stock once · runs <strong>CAGR</strong>, <strong>PE</strong>,{' '}
          <strong>Earnings Quality</strong>, <strong>Margin</strong>,{' '}
          <strong>Business Quality</strong>, and <strong>Risk &amp; Decision</strong> together.
          Each module is saved to its tab history.
        </p>

        <form onSubmit={submit} className="holding-form calculator-form">
          <div className="form-row" ref={wrapRef}>
            <label htmlFor="hub-stock">Stock name</label>
            <input
              id="hub-stock"
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

          <div className="form-row">
            <label>PE basis (CAGR anchor)</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="hubPeBasis"
                  value="ttm"
                  checked={peBasis === 'ttm'}
                  onChange={() => setPeBasis('ttm')}
                />
                TTM P/E
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="hubPeBasis"
                  value="forward"
                  checked={peBasis === 'forward'}
                  onChange={() => setPeBasis('forward')}
                />
                Forward P/E
              </label>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-row">
              <label htmlFor="hub-cagr">Expected CAGR (%)</label>
              <input
                id="hub-cagr"
                type="number"
                step="0.1"
                min="-50"
                max="100"
                value={expectedCagr}
                onChange={(e) => setExpectedCagr(e.target.value)}
                required
              />
            </div>
            <div className="form-row">
              <label htmlFor="hub-years">Investment period (years)</label>
              <input
                id="hub-years"
                type="number"
                step="1"
                min="1"
                max="30"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                required
              />
            </div>
          </div>

          <details className="calc-hub-optional">
            <summary>Optional inputs</summary>
            <div className="form-grid optional-fields">
              <div className="form-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={usePeOverride}
                    onChange={(e) => setUsePeOverride(e.target.checked)}
                  />
                  Manual P/E override
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="500"
                  value={manualPe}
                  onChange={(e) => setManualPe(e.target.value)}
                  placeholder="e.g. 28"
                  disabled={!usePeOverride}
                />
              </div>
              <div className="form-row">
                <label htmlFor="hub-invest">Investment amount (₹)</label>
                <input
                  id="hub-invest"
                  type="number"
                  step="1000"
                  min="1"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  placeholder="e.g. 100000"
                />
              </div>
              <div className="form-row">
                <label htmlFor="hub-purchase">Purchase price (₹) — PE scorecard</label>
                <input
                  id="hub-purchase"
                  type="number"
                  step="0.01"
                  min="1"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  placeholder="Legacy holder avg cost"
                />
              </div>
              <div className="form-row">
                <label htmlFor="hub-pdate">Purchase date — PE scorecard</label>
                <input
                  id="hub-pdate"
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                />
              </div>
            </div>
            <p className="muted small">
              PE scorecard runs only when both purchase price and date are set. Otherwise PARAMETERS
              + Gordon fair P/E summary is shown.
            </p>
          </details>

          {error && <p className="form-error">{error}</p>}
          {loading && loadingStep && <p className="muted small calc-hub-loading">{loadingStep}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Running full analysis…' : 'Run full analysis (all 6 modules)'}
          </button>
        </form>
      </section>

      {analysis && (
        <StockCalculatorFullResults
          analysis={analysis}
          fullRecordId={recordId ?? undefined}
          childIds={childIds ?? undefined}
          savedAt={savedAt ?? undefined}
        />
      )}
    </div>
  );
}
