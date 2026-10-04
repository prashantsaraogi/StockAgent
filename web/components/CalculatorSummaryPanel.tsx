'use client';

import { useState } from 'react';
import { MarkdownView } from '@/components/MarkdownView';
import type { PeBasis, PeSnapshot } from '@/lib/stock-calculator-engine';
import type {
  CagrGapAnalysis,
  FrameworkQualityMetrics,
  RiskFactorResult,
} from '@/lib/stock-calculator-framework';
import {
  CALCULATOR_TABS,
  type CalculatorTabAnalysis,
  type CalculatorTabId,
} from '@/lib/stock-calculator-tabs';
import { riskLevelClass } from '@/lib/stock-calculator-framework';
import {
  sanitizeStockbookMarkdownForWeb,
  sanitizeUserFacingAnswer,
  sanitizeVerdictLabel,
} from '@/lib/investor-report-format';

export interface CalculatorScenarioRow {
  label: string;
  exitPe: number;
  exitPrice: number;
  totalReturnPct: number;
  priceCagrPct: number;
  exitValueInr?: number;
  gainInr?: number;
}

export interface CalculatorSummaryProps {
  ticker: string;
  stockName: string;
  peBasis: PeBasis;
  years: number;
  expectedCagrPct: number;
  anchorPe: number;
  anchorEps: number;
  projectedEps: number;
  impliedVerdict: string;
  quality: FrameworkQualityMetrics;
  internalRisk: RiskFactorResult;
  externalRisk: RiskFactorResult;
  cagrGap: CagrGapAnalysis;
  scenarios: CalculatorScenarioRow[];
  snapshot: PeSnapshot;
  tabAnalysis: CalculatorTabAnalysis;
  investmentAmountInr?: number | null;
  detailId?: string | null;
  report?: string;
  frameworkVerdict?: string;
  reportMode?: 'framework-local' | 'gemini';
}

function fmtPct(n: number | null | undefined, digits = 1): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return `${n.toFixed(digits)}%`;
}

function fmtInr(n: number): string {
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

function peBasisLabel(basis: PeBasis): string {
  return basis === 'forward' ? 'Forward P/E' : 'TTM P/E';
}

function MetricTable({
  rows,
}: {
  rows: { label: string; value: string | null | undefined; hint?: string }[];
}) {
  const visible = rows.filter((r) => r.value && r.value !== '—');
  if (visible.length === 0) {
    return <p className="muted small">No valuation data — refresh stock parameters.</p>;
  }
  return (
    <div className="table-wrap">
      <table className="data-table calc-tab-table">
        <tbody>
          {visible.map((r) => (
            <tr key={r.label}>
              <th scope="row">{r.label}</th>
              <td>
                <strong>{r.value}</strong>
                {r.hint && <div className="muted small">{r.hint}</div>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ValuationTab({
  snapshot,
  peBasis,
  anchorPe,
  anchorEps,
  projectedEps,
  years,
  expectedCagrPct,
  scenarios,
  investmentAmountInr,
  impliedVerdict,
}: Pick<
  CalculatorSummaryProps,
  | 'snapshot'
  | 'peBasis'
  | 'anchorPe'
  | 'anchorEps'
  | 'projectedEps'
  | 'years'
  | 'expectedCagrPct'
  | 'scenarios'
  | 'investmentAmountInr'
  | 'impliedVerdict'
>) {
  const hasInvestment = investmentAmountInr != null && investmentAmountInr > 0;

  return (
    <>
      <p className="calc-tab-lead muted">{impliedVerdict}</p>
      <MetricTable
        rows={[
          { label: 'CMP', value: fmtInr(snapshot.cmp), hint: snapshot.cmpSource },
          { label: 'TTM P/E', value: snapshot.ttmPe != null ? `${snapshot.ttmPe.toFixed(1)}×` : null },
          {
            label: 'Forward P/E',
            value: snapshot.forwardPe != null ? `${snapshot.forwardPe.toFixed(1)}×` : null,
          },
          {
            label: '10Y average P/E',
            value: snapshot.avg10yPe != null ? `${snapshot.avg10yPe.toFixed(1)}×` : null,
          },
          {
            label: 'Forward fair P/E',
            value: snapshot.forwardFairPe != null ? `${snapshot.forwardFairPe.toFixed(1)}×` : null,
          },
          { label: `Anchor P/E (${peBasisLabel(peBasis)})`, value: `${anchorPe.toFixed(1)}×` },
          { label: 'Anchor EPS', value: fmtInr(anchorEps) },
          {
            label: `EPS after ${years}Y @ ${expectedCagrPct}%`,
            value: fmtInr(projectedEps),
            hint: 'Your earnings CAGR assumption',
          },
          {
            label: '5Y fair value (base case)',
            value:
              snapshot.framework5yFairPrice != null
                ? fmtInr(snapshot.framework5yFairPrice)
                : null,
          },
        ]}
      />

      {scenarios.length > 0 && (
        <div className="calc-scenario-wrap">
          <h3 className="calc-scenario-title">Exit scenarios</h3>
          <div className="table-wrap">
            <table className="data-table calc-scenario-table">
              <thead>
                <tr>
                  <th>Scenario</th>
                  <th>Exit P/E</th>
                  <th>Exit price</th>
                  <th>Total return</th>
                  <th>Price CAGR</th>
                  {hasInvestment && (
                    <>
                      <th>Exit value</th>
                      <th>Gain</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {scenarios.map((s, i) => (
                  <tr key={s.label} className={i === 0 ? 'calc-scenario-primary' : undefined}>
                    <td>
                      <span className="calc-scenario-name">{s.label}</span>
                      {i === 0 && <span className="calc-scenario-tag">Primary</span>}
                    </td>
                    <td>{s.exitPe.toFixed(1)}×</td>
                    <td>{fmtInr(s.exitPrice)}</td>
                    <td className={s.totalReturnPct >= 0 ? 'gain-pos' : 'gain-neg'}>
                      {s.totalReturnPct >= 0 ? '+' : ''}
                      {s.totalReturnPct.toFixed(1)}%
                    </td>
                    <td>{s.priceCagrPct.toFixed(1)}%</td>
                    {hasInvestment && (
                      <>
                        <td>{fmtInr(s.exitValueInr ?? 0)}</td>
                        <td
                          className={
                            s.gainInr != null && s.gainInr >= 0 ? 'gain-pos' : 'gain-neg'
                          }
                        >
                          {s.gainInr != null && s.gainInr >= 0 ? '+' : ''}
                          {fmtInr(s.gainInr ?? 0)}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

function RiskTab({
  internalRisk,
  externalRisk,
}: Pick<CalculatorSummaryProps, 'internalRisk' | 'externalRisk'>) {
  return (
    <>
      <p className="calc-tab-lead muted">
        L1 = 0–2 pp haircut · L2 = 3–7 pp · L3 = ≥8 pp off sustainable EPS CAGR (AGENT-RULES).
      </p>
      <div className="calc-risk-row">
        <article className={`calc-risk-card ${riskLevelClass(internalRisk.level)}`}>
          <div className="calc-risk-head">
            <span className="calc-risk-title">Internal risk</span>
            <span className="calc-risk-badge">{internalRisk.level}</span>
          </div>
          <p className="calc-risk-haircut">Haircut ~{internalRisk.haircutMidPp.toFixed(1)} pp</p>
          <p className="muted small">{internalRisk.summary.replace(/\*\*/g, '')}</p>
          {internalRisk.topRisks.length > 0 && (
            <ul className="calc-risk-list">
              {internalRisk.topRisks.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          )}
        </article>
        <article className={`calc-risk-card ${riskLevelClass(externalRisk.level)}`}>
          <div className="calc-risk-head">
            <span className="calc-risk-title">External risk</span>
            <span className="calc-risk-badge">{externalRisk.level}</span>
          </div>
          <p className="calc-risk-haircut">Haircut ~{externalRisk.haircutMidPp.toFixed(1)} pp</p>
          <p className="muted small">{externalRisk.summary.replace(/\*\*/g, '')}</p>
          {externalRisk.topRisks.length > 0 && (
            <ul className="calc-risk-list">
              {externalRisk.topRisks.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          )}
        </article>
      </div>
      <MetricTable
        rows={[
          {
            label: 'Combined worst haircut',
            value: `−${Math.max(internalRisk.haircutMidPp, externalRisk.haircutMidPp).toFixed(1)} pp`,
          },
          {
            label: 'Stress haircut (sum)',
            value: `−${(internalRisk.haircutMidPp + externalRisk.haircutMidPp).toFixed(1)} pp`,
            hint: 'Used in stretched-expectation messaging',
          },
          {
            label: 'Internal active risks',
            value: String(internalRisk.activeRiskCount),
          },
          {
            label: 'External active risks',
            value: String(externalRisk.activeRiskCount),
          },
        ]}
      />
    </>
  );
}

function ForwardGrowthTab({
  tabAnalysis,
  cagrGap,
  expectedCagrPct,
  years,
}: Pick<
  CalculatorSummaryProps,
  'tabAnalysis' | 'cagrGap' | 'expectedCagrPct' | 'years'
>) {
  const fwd = tabAnalysis.forward;

  return (
    <>
      <div className={`calc-cagr-gap calc-cagr-gap-${cagrGap.gapTone}`}>
        <div className="calc-cagr-gap-values">
          <div className="calc-cagr-box">
            <span className="calc-cagr-label">Possible CAGR</span>
            <strong>{fmtPct(cagrGap.possibleCagrPct)}</strong>
            <span className="muted small">Conservative case</span>
          </div>
          <div className="calc-cagr-gap-arrow" aria-hidden>
            <span className="calc-gap-pp">
              {cagrGap.cagrGapPp != null
                ? `${cagrGap.cagrGapPp >= 0 ? '+' : ''}${cagrGap.cagrGapPp.toFixed(1)} pp`
                : '—'}
            </span>
          </div>
          <div className="calc-cagr-box">
            <span className="calc-cagr-label">Your expected CAGR</span>
            <strong>{fmtPct(expectedCagrPct)}</strong>
            <span className="muted small">{years}Y horizon input</span>
          </div>
        </div>
        <p className="calc-cagr-verdict">{cagrGap.gapVerdict}</p>
      </div>

      <MetricTable
        rows={[
          { label: 'ADD case (PARAMETERS)', value: fwd.addCase },
          { label: 'EPS CAGR — base', value: fwd.epsCagrBase },
          { label: 'EPS CAGR — pessimistic', value: fwd.epsCagrPessimistic },
          { label: 'EPS CAGR — optimistic', value: fwd.epsCagrOptimistic },
          { label: 'Forward fair P/E', value: fwd.forwardFairPe },
          { label: '5Y fair price (base)', value: fwd.framework5yFairPrice },
          { label: 'Implied 5Y price CAGR', value: fwd.implied5yPriceCagr },
          { label: 'Premium to forward IV', value: fwd.forwardPremiumIv },
          { label: 'Volume CAGR (forward)', value: fwd.volumeCagr },
          { label: 'Acceptable 5Y return?', value: fwd.forwardVerdict },
          {
            label: 'Base EPS CAGR (model)',
            value:
              cagrGap.frameworkBaseEpsCagrPct != null
                ? fmtPct(cagrGap.frameworkBaseEpsCagrPct)
                : null,
          },
          {
            label: 'Possible EPS CAGR (post-haircut)',
            value:
              cagrGap.possibleEpsCagrPct != null ? fmtPct(cagrGap.possibleEpsCagrPct) : null,
          },
        ]}
      />
    </>
  );
}

function HistoricalGrowthTab({ tabAnalysis }: Pick<CalculatorSummaryProps, 'tabAnalysis'>) {
  const hist = tabAnalysis.historical;

  return (
    <>
      <p className="calc-tab-lead muted">
        Part 1 rear-view — today vs 10Y average (PARAMETERS-FRAMEWORK Part 1).
      </p>
      <MetricTable
        rows={[
          { label: 'Cheap or expensive? (Part 1)', value: hist.cheapOrExpensive ?? hist.part1Verdict },
          { label: 'P/E today', value: hist.peToday },
          { label: '10Y average P/E', value: hist.pe10yAvg },
          { label: 'Premium to IV', value: hist.premiumToIv },
          { label: 'Owner earnings yield', value: hist.ownerEarningsYield },
          { label: 'Historical EPS CAGR', value: hist.epsCagrHist },
        ]}
      />

      {hist.rows.length > 0 && (
        <div className="calc-scenario-wrap">
          <h3 className="calc-scenario-title">10Y comparison table</h3>
          <div className="table-wrap">
            <table className="data-table calc-tab-table">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>10Y avg</th>
                  <th>Today @ CMP</th>
                  <th>Read</th>
                </tr>
              </thead>
              <tbody>
                {hist.rows.map((r) => (
                  <tr key={r.parameter}>
                    <td>{r.parameter}</td>
                    <td>{r.avg10y}</td>
                    <td>{r.today}</td>
                    <td className="muted small">{r.read}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

function ProfitabilityTab({ quality }: Pick<CalculatorSummaryProps, 'quality'>) {
  const roePass =
    quality.roePct != null
      ? quality.roePct >= 15
        ? 'Pass — Buffett compounder gate'
        : 'Fail — below 15% gate'
      : null;

  return (
    <>
      <p className="calc-tab-lead muted">
        Business quality at CMP — separate from valuation (PARAMETERS Part 1 + detail-analysis).
      </p>
      <div className="calc-metrics-grid">
        <article className="calc-metric-card">
          <span className="calc-metric-label">ROE</span>
          <strong className="calc-metric-value">{quality.roeDisplay}</strong>
          {quality.roeRead && (
            <span className="calc-metric-read muted small">{quality.roeRead}</span>
          )}
        </article>
        <article className="calc-metric-card">
          <span className="calc-metric-label">EBITDA margin</span>
          <strong className="calc-metric-value">{quality.ebitdaDisplay}</strong>
          {quality.ebitdaRead && (
            <span className="calc-metric-read muted small">{quality.ebitdaRead}</span>
          )}
        </article>
        <article className="calc-metric-card">
          <span className="calc-metric-label">Debt / leverage</span>
          <strong className="calc-metric-value">{quality.debtDisplay}</strong>
          {quality.debtRead && (
            <span className="calc-metric-read muted small">{quality.debtRead}</span>
          )}
        </article>
        <article className="calc-metric-card">
          <span className="calc-metric-label">Cash flow</span>
          <strong className="calc-metric-value">{quality.cashFlowDisplay}</strong>
          {quality.cashFlowRead && (
            <span className="calc-metric-read muted small">{quality.cashFlowRead}</span>
          )}
        </article>
      </div>
      <MetricTable
        rows={[
          { label: 'Buffett ROE gate (≥15%)', value: roePass },
          {
            label: 'Base EPS CAGR (model)',
            value: quality.baseEpsCagrRange ?? (quality.baseEpsCagrPct != null ? fmtPct(quality.baseEpsCagrPct) : null),
          },
          {
            label: 'Implied 5Y price CAGR',
            value:
              quality.impliedPriceCagrPct != null
                ? fmtPct(quality.impliedPriceCagrPct)
                : null,
          },
        ]}
      />
    </>
  );
}

function EntryApproachTab({
  tabAnalysis,
  frameworkVerdict,
  impliedVerdict,
  scenarios,
}: Pick<
  CalculatorSummaryProps,
  'tabAnalysis' | 'frameworkVerdict' | 'impliedVerdict' | 'scenarios'
>) {
  const entry = tabAnalysis.entry;
  const primary = scenarios[0];

  return (
    <>
      {frameworkVerdict && (
        <p className="calc-framework-verdict">
          <strong>Calculator verdict:</strong> {sanitizeVerdictLabel(frameworkVerdict)}
        </p>
      )}
      <MetricTable
        rows={[
          { label: 'StockBook current value (Axis B)', value: entry.stockbookVerdict ?? entry.axisBValue },
          { label: 'Valuation tier (Axis A)', value: entry.axisATier },
          { label: 'SIP stance', value: entry.sipPace },
          { label: 'Monthly pace', value: entry.monthlyPace },
          { label: 'Blended ceiling', value: entry.blendedCeiling },
          { label: 'Holder action (PARAMETERS)', value: entry.holderAction },
          {
            label: 'Primary scenario price CAGR',
            value: primary ? fmtPct(primary.priceCagrPct) : null,
            hint: impliedVerdict,
          },
        ]}
      />
      {entry.approachExcerpt && (
        <div className="calc-approach-excerpt">
          <h3 className="calc-scenario-title">StockBook suggested approach</h3>
          <div className="calc-report-prose">
            <MarkdownView content={sanitizeStockbookMarkdownForWeb(entry.approachExcerpt)} />
          </div>
        </div>
      )}
    </>
  );
}

export function CalculatorSummaryPanel(props: CalculatorSummaryProps) {
  const [activeTab, setActiveTab] = useState<CalculatorTabId>('valuation');

  return (
    <section className="card wide calculator-result calculator-result-enhanced">
      <div className="calc-summary-header">
        <div className="calc-summary-header-row">
          <h2>Analysis — {props.stockName}</h2>
          {props.reportMode && (
            <span className={`tag ${props.reportMode === 'gemini' ? 'verdict' : ''}`}>
              {props.reportMode === 'gemini' ? 'Enhanced narrative' : 'Core model'}
            </span>
          )}
        </div>
        {props.frameworkVerdict && (
          <p className="calc-framework-verdict">
            <strong>Verdict:</strong> {sanitizeVerdictLabel(props.frameworkVerdict)}
          </p>
        )}
      </div>

      <nav className="sub-nav calc-tabs" aria-label="Calculator analysis sections">
        {CALCULATOR_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`sub-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="calc-tab-panel" role="tabpanel">
        {activeTab === 'valuation' && <ValuationTab {...props} />}
        {activeTab === 'risk' && <RiskTab {...props} />}
        {activeTab === 'forward-growth' && <ForwardGrowthTab {...props} />}
        {activeTab === 'historical-growth' && <HistoricalGrowthTab {...props} />}
        {activeTab === 'profitability' && <ProfitabilityTab {...props} />}
        {activeTab === 'entry-approach' && <EntryApproachTab {...props} />}
      </div>

      {props.detailId && (
        <p className="muted small calc-tab-footer">
          Saved to history ·{' '}
          <a href={`/stock-calculator/cagr/${props.detailId}`}>Open full report →</a>
        </p>
      )}

      {props.report && (
        <details className="calc-full-report">
          <summary>Full written report</summary>
          <div className="calc-report-prose">
            <MarkdownView content={sanitizeUserFacingAnswer(props.report ?? '')} />
          </div>
        </details>
      )}
    </section>
  );
}
