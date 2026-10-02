'use client';

import Link from 'next/link';
import type { RiskDecisionResult, RiskSignal } from '@/lib/risk-decision';

function fmtInr(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function signalClass(s: RiskSignal): string {
  if (s === '🟢') return 'bq-signal-green';
  if (s === '🟡') return 'bq-signal-yellow';
  if (s === '🔴') return 'bq-signal-red';
  return 'bq-signal-none';
}

interface Props {
  data: RiskDecisionResult;
  recordId?: string;
  savedAt?: string;
}

export function RiskDecisionResults({ data, recordId, savedAt }: Props) {
  const t = data.thesis;

  return (
    <>
      {recordId && (
        <section className="card wide pe-saved-banner">
          <p className="muted small">
            Saved to history
            {savedAt
              ? ` · ${new Date(savedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} IST`
              : ''}
            {' · '}
            <Link href={`/stock-calculator/risk-decision/${recordId}`}>Open saved decision →</Link>
          </p>
        </section>
      )}

      {/* Investment Thesis card */}
      <section className="card wide rd-thesis-card">
        <div className="rd-thesis-header">
          <h2>
            {data.ticker} — Current Thesis
          </h2>
          <span className="rd-thesis-status">{t.status}</span>
        </div>
        <div className="rd-thesis-grid">
          <div>
            <span className="pe-eval-label">Score</span>
            <strong className="rd-score-hero">{data.quantitativeScore100}/100</strong>
          </div>
          <div>
            <span className="pe-eval-label">Valuation</span>
            <strong>{t.valuationLabel}</strong>
          </div>
          <div>
            <span className="pe-eval-label">Business</span>
            <strong>{t.businessLabel}</strong>
          </div>
          <div>
            <span className="pe-eval-label">Earnings</span>
            <strong>{t.earningsLabel}</strong>
          </div>
          <div>
            <span className="pe-eval-label">Risk</span>
            <strong>{t.riskLabel}</strong>
          </div>
        </div>
        <dl className="rd-thesis-dl">
          <dt>Why own</dt>
          <dd>{t.whyOwn}</dd>
          <dt>Why not buy aggressively</dt>
          <dd>{t.whyNotAggressive}</dd>
          <dt>What would change my mind</dt>
          <dd>{t.changeMind}</dd>
          <dt>Next review</dt>
          <dd>{t.nextReview}</dd>
        </dl>
      </section>

      {/* Dual output */}
      <section className="card wide rd-decision-output">
        <div className="rd-dual-output">
          <div className="rd-quant-score">
            <span className="pe-eval-label">① Quantitative Score</span>
            <strong className="rd-score-big">{data.quantitativeScore100}</strong>
            <span className="muted">/100</span>
          </div>
          <div className="rd-verdict-block">
            <span className="pe-eval-label">② Investment Verdict</span>
            <strong className={`rd-verdict-label rd-tone-${data.verdictTone}`}>
              {data.investmentVerdict}
            </strong>
            {data.notScreamingBuy && (
              <p className="muted small rd-not-screaming">Not a screaming BUY — {data.narrativeSummary}</p>
            )}
          </div>
        </div>

        <div className="pe-eval-metrics">
          <div className="pe-eval-metric">
            <span className="pe-eval-label">CMP</span>
            <strong>{fmtInr(data.cmp)}</strong>
            <span className="muted small">{data.cmpSource}</span>
          </div>
          <div className="pe-eval-metric">
            <span className="pe-eval-label">{data.stockName}</span>
            <strong>{data.sector}</strong>
            <span className="muted small">{data.dataSource}</span>
          </div>
        </div>
      </section>

      {/* Component breakdown */}
      <section className="card wide">
        <h3>Five-tab composite</h3>
        <table className="rd-component-table">
          <thead>
            <tr>
              <th>Component</th>
              <th>Weight</th>
              <th>Score</th>
              <th>Contribution</th>
            </tr>
          </thead>
          <tbody>
            {data.components.map((c) => (
              <tr key={c.id}>
                <td>{c.label}</td>
                <td>{c.weightPct}%</td>
                <td>
                  <strong>{c.score10}/10</strong>
                </td>
                <td>{c.weightedContribution.toFixed(1)} pts</td>
              </tr>
            ))}
            <tr className="rd-total-row">
              <td colSpan={3}>
                <strong>Overall</strong>
              </td>
              <td>
                <strong>{data.quantitativeScore100}/100</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Why? */}
      <div className="rd-why-grid">
        <section className="card">
          <h3>Why? — 3 positives</h3>
          <ul className="rd-bullet-list rd-positive-list">
            {data.positives.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>
        <section className="card">
          <h3>Why? — 3 concerns</h3>
          <ul className="rd-bullet-list rd-concern-list">
            {data.concerns.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card wide">
        <h3>Next quarter to watch</h3>
        <p className="calc-tab-lead muted small">
          {data.nextQuarterWatch.join(' · ')}
        </p>
      </section>

      {/* Section A Risk */}
      <section className="card wide">
        <h3>Section A — Risk</h3>
        {data.riskBuckets.length > 0 && (
          <div className="rd-bucket-pills">
            {data.riskBuckets.map((b) => (
              <span key={b.bucket} className={`tag rd-bucket-pill ${signalClass(b.signal)}`}>
                {b.bucket} {b.signal}
              </span>
            ))}
          </div>
        )}
        {data.riskFactors.length === 0 ? (
          <p className="muted">Add Section A to RISK_DECISION file.</p>
        ) : (
          <div className="eq-table-wrap">
            <table className="eq-quarterly-table">
              <thead>
                <tr>
                  <th>Bucket</th>
                  <th>Factor</th>
                  <th>Assessment</th>
                  <th>Level</th>
                  <th>Signal</th>
                </tr>
              </thead>
              <tbody>
                {data.riskFactors.map((r) => (
                  <tr key={r.id}>
                    <td>{r.bucket}</td>
                    <td>{r.factor}</td>
                    <td>{r.assessment}</td>
                    <td>{r.level}</td>
                    <td className={signalClass(r.signal)}>{r.signal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Section B Catalysts */}
      <section className="card wide">
        <h3>Section B — Catalysts (what can go UP?)</h3>
        {data.catalysts.length === 0 ? (
          <p className="muted">No catalysts listed.</p>
        ) : (
          <table className="rd-component-table">
            <thead>
              <tr>
                <th>Catalyst</th>
                <th>Direction</th>
                <th>Probability</th>
                <th>Evidence</th>
              </tr>
            </thead>
            <tbody>
              {data.catalysts.map((c) => (
                <tr key={c.catalyst}>
                  <td>{c.catalyst}</td>
                  <td>{c.direction}</td>
                  <td>{c.probability}</td>
                  <td className="muted small">{c.evidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Section C Thesis breakers */}
      <section className="card wide rd-breakers">
        <h3>Section C — Thesis breakers</h3>
        <p className="muted small calc-tab-lead">
          What would make the investment thesis <strong>wrong</strong>?
        </p>
        <ul className="rd-breaker-list">
          {data.thesisBreakers.map((b) => (
            <li key={b.text} className={b.severity === 'critical' ? 'rd-breaker-critical' : ''}>
              {b.severity === 'critical' ? '🔴' : '⚠️'} {b.text}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
