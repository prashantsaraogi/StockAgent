'use client';

import { useMemo, useState } from 'react';
import {
  GORDON_DEFAULT_EARNINGS_GROWTH_PCT,
  GORDON_DEFAULT_REQUIRED_RETURN_PCT,
  buildGordonSensitivityTable,
  buildPeImpliedGrowthTable,
  compareImpliedToExpectedGrowth,
  comparePeToGordonFair,
  computeGordonFairPe,
  computeImpliedGrowthFromPe,
} from '@/lib/gordon-fair-pe';

interface GordonFairPePanelProps {
  /** Trailing P/E @ CMP */
  currentPe: number | null;
  /** Default long-term growth — from PARAMETERS forward EPS CAGR or 8% */
  defaultEarningsGrowthPct?: number;
  stockLabel?: string;
}

function fmtPe(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return '—';
  if (n >= 100) return `${n.toFixed(0)}×`;
  return `${n.toFixed(1)}×`;
}

function fmtPct(n: number | null, digits = 2): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return `${n.toFixed(digits)}%`;
}

export function GordonFairPePanel({
  currentPe,
  defaultEarningsGrowthPct = GORDON_DEFAULT_EARNINGS_GROWTH_PCT,
  stockLabel,
}: GordonFairPePanelProps) {
  const [requiredReturnPct, setRequiredReturnPct] = useState(GORDON_DEFAULT_REQUIRED_RETURN_PCT);
  const [earningsGrowthPct, setEarningsGrowthPct] = useState(defaultEarningsGrowthPct);
  const [comparePe, setComparePe] = useState('');

  const gordon = useMemo(
    () =>
      computeGordonFairPe({
        requiredReturnPct,
        earningsGrowthPct,
      }),
    [requiredReturnPct, earningsGrowthPct]
  );

  const implied = useMemo(() => {
    if (currentPe == null) return null;
    return computeImpliedGrowthFromPe(requiredReturnPct, currentPe);
  }, [requiredReturnPct, currentPe]);

  const comparePeNum = comparePe.trim() ? Number(comparePe) : NaN;
  const compareImplied = useMemo(() => {
    if (!Number.isFinite(comparePeNum) || comparePeNum <= 0) return null;
    return computeImpliedGrowthFromPe(requiredReturnPct, comparePeNum);
  }, [requiredReturnPct, comparePeNum]);

  const growthGap = useMemo(() => {
    if (implied?.impliedGrowthPct == null || implied.invalid) return null;
    return compareImpliedToExpectedGrowth(implied.impliedGrowthPct, earningsGrowthPct);
  }, [implied, earningsGrowthPct]);

  const sensitivity = useMemo(
    () => buildGordonSensitivityTable(requiredReturnPct),
    [requiredReturnPct]
  );

  const peImpliedTable = useMemo(
    () => buildPeImpliedGrowthTable(requiredReturnPct),
    [requiredReturnPct]
  );

  const comparison = useMemo(() => {
    if (currentPe == null || gordon.fairPe == null || gordon.invalid) return null;
    return comparePeToGordonFair(currentPe, gordon.fairPe);
  }, [currentPe, gordon.fairPe, gordon.invalid]);

  const activeGrowthRow = sensitivity.find(
    (r) => r.earningsGrowthPct === Math.round(earningsGrowthPct)
  );

  return (
    <section className="card wide gordon-fair-pe">
      <h3>Gordon P/E lens (Part D)</h3>
      <p className="muted small calc-tab-lead">
        Two directions of the same simplified model — <strong>confirmatory only</strong>. Use
        sustainable long-term EPS growth (PARAMETERS base case), not peak FY forecast.
      </p>

      <div className="gordon-dual-formula">
        <div className="gordon-formula">
          <p>
            <strong>Forward:</strong> Fair P/E = 1 ÷ (R − G)
          </p>
          <p className="muted small">
            @ 12% required, 8% growth → <strong>25×</strong>
          </p>
        </div>
        <div className="gordon-formula">
          <p>
            <strong>Inverse:</strong> Implied G = R − 1/PE
          </p>
          <p className="muted small">
            @ 12% required, PE 35 → 12% − 2.86% = <strong>9.14%</strong>
          </p>
        </div>
      </div>

      <div className="gordon-inputs">
        <div className="form-row">
          <label htmlFor="gordon-required">Required return (% nominal)</label>
          <input
            id="gordon-required"
            type="number"
            min="1"
            max="30"
            step="0.5"
            value={requiredReturnPct}
            onChange={(e) => setRequiredReturnPct(Number(e.target.value))}
          />
          <span className="muted small">Your equity hurdle — e.g. 12%</span>
        </div>
        <div className="form-row">
          <label htmlFor="gordon-growth">Expected EPS growth (%)</label>
          <input
            id="gordon-growth"
            type="number"
            min="0"
            max="25"
            step="0.5"
            value={earningsGrowthPct}
            onChange={(e) => setEarningsGrowthPct(Number(e.target.value))}
          />
          <span className="muted small">
            Thesis / PARAMETERS base{stockLabel ? ` · ${stockLabel}` : ''}
          </span>
        </div>
      </div>

      {/* Inverse: implied growth at current P/E */}
      {currentPe != null && (
        <div className="gordon-inverse-block">
          <h4>Implied growth @ current P/E ({fmtPe(currentPe)})</h4>
          {implied?.invalid ? (
            <p className="gordon-invalid">{implied.invalidReason}</p>
          ) : implied ? (
            <>
              <div className="pe-eval-metrics">
                <div className="pe-eval-metric">
                  <span className="pe-eval-label">Earnings yield (1/PE)</span>
                  <strong>{fmtPct(implied.earningsYieldPct)}</strong>
                </div>
                <div className="pe-eval-metric">
                  <span className="pe-eval-label">Implied sustainable G</span>
                  <strong>{fmtPct(implied.impliedGrowthPct)}</strong>
                  <span className="muted small">
                    {requiredReturnPct}% − {fmtPct(implied.earningsYieldPct)}
                  </span>
                </div>
                <div className="pe-eval-metric">
                  <span className="pe-eval-label">Your expected G</span>
                  <strong>{fmtPct(earningsGrowthPct)}</strong>
                  {growthGap && (
                    <span className={`pe-tone pe-tone-${growthGap.tone}`}>
                      {growthGap.gapPp >= 0 ? '+' : ''}
                      {growthGap.gapPp.toFixed(2)} pp vs implied
                    </span>
                  )}
                </div>
              </div>
              {growthGap && (
                <p className={`gordon-verdict pe-tone-${growthGap.tone}`}>
                  <strong>{growthGap.verdict}</strong>
                </p>
              )}
            </>
          ) : null}
        </div>
      )}

      {/* Forward: fair P/E from expected growth */}
      <div className="gordon-forward-block">
        <h4>Fair P/E from expected growth ({fmtPct(earningsGrowthPct, 1)})</h4>
        {gordon.invalid ? (
          <p className="gordon-invalid">{gordon.invalidReason}</p>
        ) : (
          <>
            <div className="pe-eval-metrics">
              <div className="pe-eval-metric">
                <span className="pe-eval-label">Gordon fair P/E</span>
                <strong>{fmtPe(gordon.fairPe)}</strong>
                <span className="muted small">spread {gordon.spreadPct.toFixed(1)} pp</span>
              </div>
              {currentPe != null && (
                <div className="pe-eval-metric">
                  <span className="pe-eval-label">Current trailing P/E</span>
                  <strong>{fmtPe(currentPe)}</strong>
                  {comparison && (
                    <span className={`pe-tone pe-tone-${comparison.tone}`}>
                      {comparison.premiumToFairPct > 0 ? '+' : ''}
                      {comparison.premiumToFairPct}% vs Gordon fair
                    </span>
                  )}
                </div>
              )}
            </div>
            {comparison && (
              <p className={`gordon-verdict pe-tone-${comparison.tone}`}>
                <strong>{comparison.verdict}</strong>
              </p>
            )}
          </>
        )}
      </div>

      <h4>PE → implied growth @ {requiredReturnPct}% required return</h4>
      <p className="muted small">
        Relationship is <strong>not linear</strong> — PE 60 needs ~10.3% growth vs PE 35 ~9.1%
        (only ~1.2 pp more) at 12% hurdle.
      </p>
      <div className="table-wrap">
        <table className="data-table calc-tab-table gordon-sensitivity-table">
          <thead>
            <tr>
              <th>P/E</th>
              <th>Earnings yield</th>
              <th>Implied G needed</th>
            </tr>
          </thead>
          <tbody>
            {peImpliedTable.map((row) => {
              const isCurrent =
                currentPe != null && Math.abs(row.pe - currentPe) < 1.5;
              const isCompare =
                Number.isFinite(comparePeNum) && Math.abs(row.pe - comparePeNum) < 1.5;
              return (
                <tr
                  key={row.pe}
                  className={isCurrent || isCompare ? 'gordon-row-active' : ''}
                >
                  <th scope="row">{row.pe}×</th>
                  <td>{fmtPct(row.earningsYieldPct)}</td>
                  <td>
                    <strong>{row.invalid ? '—' : fmtPct(row.impliedGrowthPct)}</strong>
                    {isCurrent && (
                      <span className="muted small block">This stock</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {compareImplied && !compareImplied.invalid && Number.isFinite(comparePeNum) && (
              <tr className="gordon-row-compare">
                <th scope="row">{comparePeNum}× (compare)</th>
                <td>{fmtPct(compareImplied.earningsYieldPct)}</td>
                <td>
                  <strong>{fmtPct(compareImplied.impliedGrowthPct)}</strong>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="form-row gordon-compare-pe">
        <label htmlFor="gordon-compare-pe">Compare another P/E (optional)</label>
        <input
          id="gordon-compare-pe"
          type="number"
          min="1"
          step="1"
          placeholder="e.g. 60 for Tata Consumer vs 35 HDFC AMC"
          value={comparePe}
          onChange={(e) => setComparePe(e.target.value)}
        />
      </div>

      <h4>Growth → fair P/E @ {requiredReturnPct}% required return</h4>
      <div className="table-wrap">
        <table className="data-table calc-tab-table gordon-sensitivity-table">
          <thead>
            <tr>
              <th>Long-term EPS growth</th>
              <th>Fair P/E</th>
            </tr>
          </thead>
          <tbody>
            {sensitivity.map((row) => {
              const isSelected =
                Math.abs(row.earningsGrowthPct - earningsGrowthPct) < 0.01 ||
                row === activeGrowthRow;
              return (
                <tr key={row.earningsGrowthPct} className={isSelected ? 'gordon-row-active' : ''}>
                  <th scope="row">{row.earningsGrowthPct}%</th>
                  <td>
                    <strong>{row.invalid ? '—' : fmtPe(row.fairPe)}</strong>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="muted small gordon-disclaimer">
        Simplified Gordon model — not a return forecast. For AMC/asset managers, compare implied G
        to <strong>actual 5Y EPS CAGR + forward AUM/fee thesis</strong> (market levels, performance
        fees). Stock decisions still require PARAMETERS, PCCL, and buy workflow.
      </p>
    </section>
  );
}
