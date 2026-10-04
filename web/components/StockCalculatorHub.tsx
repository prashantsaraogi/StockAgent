'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useStockSearchSuggestions } from '@/hooks/useStockSearchSuggestions';
import type { StockCalculatorFullResult } from '@/lib/stock-calculator-full';
import type { FullAnalysisChildIds } from '@/lib/stock-calculator-full-history';
import { StockCalculatorFullResults } from '@/components/StockCalculatorFullResults';
import { StockSearchSuggestions } from '@/components/StockSearchSuggestions';
import type { StockSearchResult } from '@/lib/stock-search';

const DEFAULT_CAGR = '12';
const DEFAULT_YEARS = '5';

type AnalysisMode = 'basic' | 'advanced';

export function StockCalculatorHub() {
  const router = useRouter();
  const [mode, setMode] = useState<AnalysisMode>('basic');
  const [stockName, setStockName] = useState('');
  const [selected, setSelected] = useState<StockSearchResult | null>(null);
  const [peBasis, setPeBasis] = useState<'ttm' | 'forward'>('ttm');
  const [expectedCagr, setExpectedCagr] = useState(DEFAULT_CAGR);
  const [years, setYears] = useState(DEFAULT_YEARS);
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
    setLoadingStep('Running CAGR, P/E, earnings quality, margin, business quality, and risk…');

    const ticker = selected?.ticker ?? stockName.trim();
    if (!ticker) {
      setError('Enter a stock name or ticker and pick from suggestions when offered.');
      setLoading(false);
      return;
    }

    const cagrPct = mode === 'basic' ? Number(DEFAULT_CAGR) : Number(expectedCagr);
    const periodYears = mode === 'basic' ? Number(DEFAULT_YEARS) : Number(years);
    const basis = mode === 'basic' ? 'ttm' : peBasis;

    try {
      const payload: Record<string, unknown> = {
        stockQuery: ticker,
        ticker: selected?.ticker,
        analysisMode: mode,
        peBasis: basis,
        expectedCagrPct: cagrPct,
        years: periodYears,
      };

      if (mode === 'advanced') {
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

      const id = data.record?.id as string | undefined;
      if (id && data.detailPath) {
        router.push(data.detailPath as string);
        return;
      }
      setAnalysis(data.analysis);
      setRecordId(id ?? null);
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
        <div className="calc-analysis-mode" role="tablist" aria-label="Analysis type">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'basic'}
            className={`calc-analysis-mode-btn ${mode === 'basic' ? 'active' : ''}`}
            onClick={() => setMode('basic')}
          >
            Basic analysis
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'advanced'}
            className={`calc-analysis-mode-btn ${mode === 'advanced' ? 'active' : ''}`}
            onClick={() => setMode('advanced')}
          >
            Advanced analysis
          </button>
        </div>

        {mode === 'basic' ? (
          <p className="muted small calc-analysis-mode-hint">
            Enter the stock only. We use <strong>TTM P/E</strong>,{' '}
            <strong>{DEFAULT_CAGR}% expected CAGR</strong>, and a{' '}
            <strong>{DEFAULT_YEARS}-year</strong> horizon. P/E comes from the{' '}
            <strong>live NSE/Yahoo quote</strong> when available; if not, we use a{' '}
            <strong>25× placeholder</strong> so all six modules still run (CAGR, P/E, earnings,
            margin, business quality, risk). Use <strong>PEG</strong> tab for the growth scorecard.
          </p>
        ) : (
          <p className="muted small calc-analysis-mode-hint">
            Set your <strong>P/E lens</strong> (TTM or forward) and <strong>growth assumptions</strong>{' '}
            before the same six-module run. Use optional fields for legacy purchase P/E scorecard.
          </p>
        )}

        <form onSubmit={submit} className="holding-form calculator-form">
          <div className="form-row" ref={wrapRef}>
            <label htmlFor="hub-stock">Stock name or ticker</label>
            <input
              id="hub-stock"
              type="text"
              value={stockName}
              onChange={(e) => onStockInput(e.target.value)}
              placeholder="e.g. Maruti, HDFC Bank, MARUTI"
              autoComplete="off"
              required
            />
            {showSuggestions && suggestions.length > 0 && (
              <StockSearchSuggestions suggestions={suggestions} onPick={pickStock} />
            )}
          </div>

          {mode === 'advanced' && (
            <>
              <div className="form-row">
                <label>P/E basis (for CAGR &amp; valuation modules)</label>
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
                    <label htmlFor="hub-purchase">Your purchase price (₹)</label>
                    <input
                      id="hub-purchase"
                      type="number"
                      step="0.01"
                      min="1"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                      placeholder="If you already hold the stock"
                    />
                  </div>
                  <div className="form-row">
                    <label htmlFor="hub-pdate">Purchase date</label>
                    <input
                      id="hub-pdate"
                      type="date"
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                    />
                  </div>
                </div>
                <p className="muted small">
                  Purchase price + date unlock the full legacy-holder P/E scorecard. Otherwise we
                  show PARAMETERS and Gordon fair P/E summary.
                </p>
              </details>
            </>
          )}

          {error && <p className="form-error">{error}</p>}
          {loading && loadingStep && <p className="muted small calc-hub-loading">{loadingStep}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading
              ? 'Running analysis…'
              : mode === 'basic'
                ? 'Run analysis (all 6 modules)'
                : 'Run advanced analysis (all 6 modules)'}
          </button>
        </form>
      </section>

      {analysis && (
        <StockCalculatorFullResults
          analysis={analysis}
          fullRecordId={recordId ?? undefined}
          childIds={childIds ?? undefined}
          savedAt={savedAt ?? undefined}
          preferFrameworkTab={mode === 'basic'}
        />
      )}
    </div>
  );
}
