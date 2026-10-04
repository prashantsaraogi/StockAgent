'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useStockSearchSuggestions } from '@/hooks/useStockSearchSuggestions';
import {
  CalculatorSummaryPanel,
  type CalculatorSummaryProps,
} from '@/components/CalculatorSummaryPanel';
import { StockSearchSuggestions } from '@/components/StockSearchSuggestions';
import type { StockSearchResult } from '@/lib/stock-search';

type SummaryResult = Omit<CalculatorSummaryProps, 'detailId'> & { id: string };

export function StockCalculatorForm() {
  const router = useRouter();
  const [stockName, setStockName] = useState('');
  const [selected, setSelected] = useState<StockSearchResult | null>(null);
  const [peBasis, setPeBasis] = useState<'ttm' | 'forward'>('ttm');
  const [expectedCagr, setExpectedCagr] = useState('12');
  const [years, setYears] = useState('5');
  const [usePeOverride, setUsePeOverride] = useState(false);
  const [manualPe, setManualPe] = useState('');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const { suggestions, queueSearch } = useStockSearchSuggestions();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<SummaryResult | null>(null);
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
    setResult(null);
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

    try {
      const payload: Record<string, unknown> = {
        stockQuery: selected?.ticker ?? stockName,
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

      const res = await fetch('/api/stock-calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? 'Calculation failed');
        return;
      }

      const r = data.record;
      setResult({
        id: r.id,
        ticker: r.ticker,
        stockName: r.stockName,
        impliedVerdict: r.impliedVerdict,
        quality: r.quality,
        internalRisk: r.internalRisk,
        externalRisk: r.externalRisk,
        cagrGap: r.cagrGap,
        scenarios: r.scenarios,
        investmentAmountInr: r.investmentAmountInr,
        report: r.report,
        frameworkVerdict: r.frameworkVerdict,
        reportMode: r.reportMode,
        peBasis: r.peBasis,
        years: r.years,
        expectedCagrPct: r.expectedCagrPct,
        anchorPe: r.anchorPe,
        anchorEps: r.anchorEps,
        projectedEps: r.projectedEps,
        snapshot: r.snapshot,
        tabAnalysis: r.tabAnalysis,
      });
      router.refresh();
    } catch {
      setError('Network error — try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="calculator-layout">
      <section className="card wide">
        <h2>New calculation</h2>
        <p className="muted small">
          Standalone what-if — pulls ROE, leverage, EBITDA, cash flow, and risk registers from
          Standalone what-if — not linked to Portfolio.
        </p>

        <form onSubmit={submit} className="holding-form calculator-form">
          <div className="form-row" ref={wrapRef}>
            <label htmlFor="calc-stock">Stock name</label>
            <input
              id="calc-stock"
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
            <label>PE basis</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="peBasis"
                  value="ttm"
                  checked={peBasis === 'ttm'}
                  onChange={() => setPeBasis('ttm')}
                />
                TTM P/E
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="peBasis"
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
              <label htmlFor="calc-cagr">Expected CAGR (%)</label>
              <input
                id="calc-cagr"
                type="number"
                step="0.1"
                min="-50"
                max="100"
                value={expectedCagr}
                onChange={(e) => setExpectedCagr(e.target.value)}
                required
              />
              <span className="field-hint muted small">Compared vs model-supported CAGR</span>
            </div>

            <div className="form-row">
              <label htmlFor="calc-years">Investment period (years)</label>
              <input
                id="calc-years"
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
                id="calc-pe-override"
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
              <label htmlFor="calc-invest">Investment amount (₹)</label>
              <input
                id="calc-invest"
                type="number"
                step="1000"
                min="1"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                placeholder="e.g. 100000"
              />
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Calculating…' : 'Run analysis'}
          </button>
        </form>
      </section>

      {result && (
        <CalculatorSummaryPanel
          ticker={result.ticker}
          stockName={result.stockName}
          peBasis={result.peBasis}
          years={result.years}
          expectedCagrPct={result.expectedCagrPct}
          anchorPe={result.anchorPe}
          anchorEps={result.anchorEps}
          projectedEps={result.projectedEps}
          snapshot={result.snapshot}
          tabAnalysis={result.tabAnalysis}
          impliedVerdict={result.impliedVerdict}
          quality={result.quality}
          internalRisk={result.internalRisk}
          externalRisk={result.externalRisk}
          cagrGap={result.cagrGap}
          scenarios={result.scenarios}
          investmentAmountInr={result.investmentAmountInr}
          detailId={result.id}
          report={result.report}
          frameworkVerdict={result.frameworkVerdict}
          reportMode={result.reportMode}
        />
      )}
    </div>
  );
}
