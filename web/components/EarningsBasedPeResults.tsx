'use client';

import { useMemo, useState } from 'react';
import type { EarningsBasedPeAnalysisResult } from '@/lib/earnings-based-pe-analysis';
import {
  computeQuarterlyRunRatePe,
  type RunRateQuarterCount,
} from '@/lib/pe-quarterly-run-rate';

function fmtPe(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return `${n.toFixed(2)}×`;
}

function fmtCr(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })} crore`;
}

function fmtPct(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return '—';
  if (n < 0) return `${Math.abs(n).toFixed(2)}% discount`;
  if (n > 0) return `${n.toFixed(2)}% premium`;
  return '0% (aligned)';
}

interface EarningsBasedPeResultsProps {
  initial: EarningsBasedPeAnalysisResult;
}

export function EarningsBasedPeResults({ initial }: EarningsBasedPeResultsProps) {
  const [patOverrides, setPatOverrides] = useState<Record<string, string>>({});

  const analysis = useMemo(() => {
    const quarters = initial.quarters.map((q) => {
      const raw = patOverrides[q.quarter];
      const patCr =
        raw !== undefined && raw.trim() !== ''
          ? parseFloat(raw)
          : q.patCr;
      return {
        quarter: q.quarter,
        patCr: patCr != null && Number.isFinite(patCr) ? patCr : null,
        eps: null,
      };
    });

    const computed = computeQuarterlyRunRatePe({
      cmp: initial.cmp,
      marketCapCr: initial.marketCapCr,
      quarterCount: initial.quarterCount as RunRateQuarterCount,
      quarters,
      sharesCr: initial.sharesCr,
      ttmPeReference: initial.ttmPe,
      trailingEpsReference: null,
    });

    const currentPeDiscountPremiumPct = computed.currentPeDiscountPremiumPct;
    let conclusion = initial.conclusion;
    if (computed.earningsBasedPe != null && initial.ttmPe != null && currentPeDiscountPremiumPct != null) {
      const eb = computed.earningsBasedPe.toFixed(2);
      const ttm = initial.ttmPe.toFixed(2);
      const abs = Math.abs(currentPeDiscountPremiumPct).toFixed(2);
      if (currentPeDiscountPremiumPct < -0.05) {
        conclusion = `${initial.stockName}'s earnings-based P/E is approximately ${eb}× vs market TTM ${ttm}× (~${abs}% discount on TTM vs run-rate). Not proof of undervaluation.`;
      } else if (currentPeDiscountPremiumPct > 0.05) {
        conclusion = `${initial.stockName}'s earnings-based P/E is approximately ${eb}× vs market TTM ${ttm}× (~${abs}% premium on TTM vs run-rate). Different earnings windows — not fair value.`;
      }
    }

    return { ...initial, computed, quarters, conclusion };
  }, [initial, patOverrides]);

  const used = analysis.computed.usedQuarters;

  return (
    <article className="card wide earnings-based-pe-report">
      <header className="earnings-based-pe-head">
        <h2>
          {analysis.stockName} (NSE: {analysis.ticker}) — Earnings-based P/E
        </h2>
        <p className="muted small">
          <strong>Calculation date:</strong> {analysis.calculationDate} ·{' '}
          <strong>Quarters:</strong> latest {analysis.quarterCount} reported ·{' '}
          <strong>Currency:</strong> INR (₹)
        </p>
      </header>

      <section>
        <h3>1. Quarterly consolidated PAT</h3>
        <p className="muted small">
          Replace UNVERIFIED PAT with filing figures (BSE/NSE consolidated PAT attributable to
          owners). Do not substitute standalone headline profit when consolidated differs.
        </p>
        <div className="calc-run-rate-pe-table-wrap">
          <table className="calc-table">
            <thead>
              <tr>
                <th>Reporting period</th>
                <th>Consolidated PAT (₹ cr)</th>
                <th>Source / evidence</th>
              </tr>
            </thead>
            <tbody>
              {used.map((row, i) => {
                const meta = initial.quarters.find((q) => q.quarter === row.quarter);
                return (
                  <tr key={`${row.quarter}-${i}`}>
                    <td>{row.quarter}</td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        className="calc-run-rate-input"
                        value={
                          patOverrides[row.quarter] ??
                          (row.patCr == null ? '' : String(row.patCr))
                        }
                        onChange={(e) =>
                          setPatOverrides((prev) => ({ ...prev, [row.quarter]: e.target.value }))
                        }
                      />
                    </td>
                    <td className="muted small">
                      {meta?.source ?? '—'} · {meta?.evidence ?? 'UNVERIFIED'}
                    </td>
                  </tr>
                );
              })}
              <tr className="calc-table-total">
                <td>
                  <strong>Total ({analysis.quarterCount} quarters)</strong>
                </td>
                <td>
                  <strong>{fmtCr(analysis.computed.sumPatCr)}</strong>
                </td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3>2. Annualised PAT</h3>
        <p className="muted small">
          Annualised PAT = (Total PAT ÷ {analysis.quarterCount}) × 4
          {analysis.quarterCount === 4 && ' — for four quarters, total PAT is the annual window (no extra factor).'}
        </p>
        <p className="earnings-based-pe-highlight">{fmtCr(analysis.computed.annualisedPatCr)}</p>
      </section>

      <section>
        <h3>3. Share price and market capitalisation</h3>
        <table className="calc-table compact">
          <tbody>
            <tr>
              <th>Share price</th>
              <td>
                {analysis.cmp != null ? `₹${analysis.cmp.toLocaleString('en-IN')}` : '—'}
              </td>
            </tr>
            <tr>
              <th>Price source / date</th>
              <td>
                {analysis.cmpSource}
                {analysis.cmpDate ? ` · ${analysis.cmpDate}` : ''}
              </td>
            </tr>
            <tr>
              <th>Shares outstanding (cr)</th>
              <td>
                {analysis.sharesCr != null ? analysis.sharesCr.toLocaleString('en-IN') : '—'}{' '}
                <span className="muted small">({analysis.sharesSource})</span>
              </td>
            </tr>
            <tr>
              <th>Market capitalisation</th>
              <td>
                {fmtCr(analysis.marketCapCr)}{' '}
                <span className="muted small">({analysis.marketCapSource})</span>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h3>4. Final earnings-based P/E</h3>
        <p className="muted small">Market capitalisation ÷ annualised PAT — not fair value.</p>
        <p className="earnings-based-pe-highlight earnings-based-pe-final">
          {fmtPe(analysis.computed.earningsBasedPe)}
        </p>
      </section>

      <section>
        <h3>5. Compare with current market P/E (TTM)</h3>
        <table className="calc-table">
          <thead>
            <tr>
              <th>Measure</th>
              <th>P/E</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>A. Current market P/E (TTM)</td>
              <td>
                {fmtPe(analysis.ttmPe)}{' '}
                <span className="muted small">({analysis.ttmPeSource})</span>
              </td>
            </tr>
            <tr>
              <td>B. Earnings-based P/E</td>
              <td>
                <strong>{fmtPe(analysis.computed.earningsBasedPe)}</strong>
              </td>
            </tr>
            <tr>
              <td>C. Difference (TTM − earnings-based)</td>
              <td>
                {analysis.computed.peDifference != null
                  ? `${analysis.computed.peDifference >= 0 ? '+' : ''}${analysis.computed.peDifference.toFixed(2)}×`
                  : '—'}
              </td>
            </tr>
            <tr>
              <td>D. Current P/E discount or premium vs earnings-based</td>
              <td>
                <strong>{fmtPct(analysis.computed.currentPeDiscountPremiumPct)}</strong>
                {analysis.computed.currentPeDiscountPremiumPct != null && (
                  <span className="muted small">
                    {' '}
                    · formula [(TTM ÷ earnings-based) − 1] × 100
                  </span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h3>6. Summary</h3>
        <table className="calc-table compact">
          <tbody>
            <tr>
              <th>Annualised PAT</th>
              <td>{fmtCr(analysis.computed.annualisedPatCr)}</td>
            </tr>
            <tr>
              <th>Market cap</th>
              <td>{fmtCr(analysis.marketCapCr)}</td>
            </tr>
            <tr>
              <th>Earnings-based P/E</th>
              <td>{fmtPe(analysis.computed.earningsBasedPe)}</td>
            </tr>
            <tr>
              <th>Market TTM P/E</th>
              <td>{fmtPe(analysis.ttmPe)}</td>
            </tr>
            <tr>
              <th>TTM vs earnings-based</th>
              <td>{fmtPct(analysis.computed.currentPeDiscountPremiumPct)}</td>
            </tr>
          </tbody>
        </table>
        <p className="earnings-based-pe-conclusion">{analysis.conclusion} </p>
      </section>

      {analysis.warnings.length > 0 && (
        <ul className="earnings-based-pe-warnings">
          {analysis.warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      )}
      <ul className="muted small earnings-based-pe-limits">
        {analysis.limitations.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
      {analysis.notes.map((n) => (
        <p key={n} className="muted small">
          {n}
        </p>
      ))}
    </article>
  );
}
