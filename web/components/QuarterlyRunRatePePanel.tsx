'use client';

import { useEffect, useMemo, useState } from 'react';
import type { StockCalculatorFullResult } from '@/lib/stock-calculator-full';
import {
  computeQuarterlyRunRatePe,
  fmtRunRatePe,
  quarterlyRowsToRunRateInput,
  type RunRateQuarterCount,
} from '@/lib/pe-quarterly-run-rate';
import { fmtPeTimes, resolveTtmForwardPeMetrics } from '@/lib/pe-ttm-forward-metrics';

const N_OPTIONS: { n: RunRateQuarterCount; label: string }[] = [
  { n: 2, label: '2 quarters (H1 annualised)' },
  { n: 3, label: '3 quarters (9M annualised)' },
  { n: 4, label: '4 quarters (TTM window)' },
  { n: 6, label: '6 quarters (smoothed)' },
];

interface QuarterlyRunRatePePanelProps {
  analysis: StockCalculatorFullResult;
}

export function QuarterlyRunRatePePanel({ analysis }: QuarterlyRunRatePePanelProps) {
  const eq = analysis.earningsQuality;
  const pe = analysis.peParameters;
  const ttmMetrics = resolveTtmForwardPeMetrics(analysis);

  const initialRows = useMemo(
    () => quarterlyRowsToRunRateInput(eq.quarterly),
    [eq.quarterly]
  );

  const [quarterCount, setQuarterCount] = useState<RunRateQuarterCount>(4);
  const [rows, setRows] = useState(initialRows);
  const [sharesCr, setSharesCr] = useState<string>('');

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  const cmp = pe.cmp ?? eq.cmp;
  const sharesNum = sharesCr.trim() === '' ? null : parseFloat(sharesCr);

  const result = useMemo(() => {
    if (cmp == null || cmp <= 0) return null;
    return computeQuarterlyRunRatePe({
      cmp,
      quarterCount,
      quarters: rows,
      sharesCr: sharesNum != null && Number.isFinite(sharesNum) ? sharesNum : null,
      ttmPeReference: ttmMetrics.ttmPe,
      trailingEpsReference: pe.trailingEps,
    });
  }, [cmp, quarterCount, rows, sharesNum, ttmMetrics.ttmPe, pe.trailingEps]);

  const displayRows = rows.length > 0 ? rows : [{ quarter: 'Q—', patCr: null, eps: null }];

  function updatePat(index: number, raw: string) {
    const next = [...rows];
    const v = raw.trim() === '' ? null : parseFloat(raw);
    next[index] = { ...next[index], patCr: v != null && Number.isFinite(v) ? v : null };
    setRows(next);
  }

  return (
    <section className="calc-run-rate-pe" aria-label="Quarterly run-rate P/E">
      <h3>Quarterly run-rate P/E</h3>
      <p className="muted small">
        <strong>{analysis.stockName}</strong> · NSE <strong>{analysis.ticker}</strong>
        {cmp != null && (
          <>
            {' '}
            · CMP <strong>₹{cmp.toLocaleString('en-IN')}</strong> ({pe.cmpSource || eq.cmpSource})
          </>
        )}
        . Use <strong>consolidated PAT</strong> (₹ cr) from filings; Yahoo/EQ pre-fill is{' '}
        <strong>UNVERIFIED</strong> until replaced.
      </p>

      <fieldset className="calc-run-rate-pe-n">
        <legend className="pe-eval-label">Latest reported quarters (N)</legend>
        <div className="calc-run-rate-pe-n-grid">
          {N_OPTIONS.map(({ n, label }) => (
            <label key={n} className="calc-run-rate-pe-n-option">
              <input
                type="radio"
                name="run-rate-n"
                checked={quarterCount === n}
                onChange={() => setQuarterCount(n)}
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="calc-run-rate-pe-table-wrap">
        <table className="calc-table compact">
          <thead>
            <tr>
              <th>Quarter</th>
              <th>Consolidated PAT (₹ cr)</th>
              <th>EPS (₹) optional</th>
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row, i) => (
              <tr key={`${row.quarter}-${i}`}>
                <td>{row.quarter}</td>
                <td>
                  <input
                    type="number"
                    step="0.1"
                    className="calc-run-rate-input"
                    value={row.patCr == null ? '' : row.patCr}
                    placeholder="—"
                    onChange={(e) => updatePat(i, e.target.value)}
                  />
                </td>
                <td className="muted">{row.eps != null ? row.eps.toFixed(2) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <label className="calc-run-rate-shares">
        <span className="pe-eval-label">Diluted shares (cr) — optional</span>
        <input
          type="number"
          step="0.01"
          className="calc-run-rate-input"
          value={sharesCr}
          placeholder={
            result?.sharesCrUsed != null && sharesCr.trim() === ''
              ? `Auto ≈ ${result.sharesCrUsed}`
              : 'From AR or infer from TTM EPS'
          }
          onChange={(e) => setSharesCr(e.target.value)}
        />
      </label>

      {result && (
        <div className="calc-pe-ttm-fwd-grid calc-run-rate-pe-results">
          <article className="calc-pe-ttm-fwd-card">
            <span className="pe-eval-label">Earnings run-rate P/E</span>
            <strong className="calc-pe-ttm-fwd-value">{fmtRunRatePe(result.runRatePe)}</strong>
            <span className="muted small">
              N={result.quarterCount} · annualised PAT ÷ run-rate EPS
            </span>
            {result.runRateEps != null && (
              <span className="muted small">Run-rate EPS ₹{result.runRateEps.toFixed(2)}</span>
            )}
            {result.annualisedPatCr != null && (
              <span className="muted small">
                Annualised PAT ₹{result.annualisedPatCr.toLocaleString('en-IN')} cr
              </span>
            )}
          </article>
          <article className="calc-pe-ttm-fwd-vs" aria-hidden>
            vs
          </article>
          <article className="calc-pe-ttm-fwd-card calc-pe-ttm">
            <span className="pe-eval-label">Conventional TTM P/E</span>
            <strong className="calc-pe-ttm-fwd-value">{fmtPeTimes(result.ttmPeReference)}</strong>
            <span className="muted small">Trailing · PARAMETERS / quote lens</span>
            {result.spreadVsTtmPct != null && (
              <span className="muted small">
                Run-rate {result.spreadVsTtmPct >= 0 ? '+' : ''}
                {result.spreadVsTtmPct.toFixed(1)}% vs TTM
              </span>
            )}
          </article>
        </div>
      )}

      {result?.warnings.map((w) => (
        <p key={w} className="calc-run-rate-warn">
          {w}
        </p>
      ))}
      {result?.notes.map((n) => (
        <p key={n} className="muted small">
          {n}
        </p>
      ))}

      <p className="muted small">
        Methodology:{' '}
        <code>StockBook/QUARTERLY-RUN-RATE-PE.md</code> · AnnualisedPat = SumPat(N) × (4÷N). When
        N=4 and PAT matches the provider, run-rate P/E aligns with TTM; forward P/E and PCCL use
        separate normalized-EPS rules.
      </p>
    </section>
  );
}
