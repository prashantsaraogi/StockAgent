'use client';

import Link from 'next/link';
import { GordonFairPePanel } from '@/components/GordonFairPePanel';
import { parseEarningsGrowthDefault } from '@/lib/gordon-fair-pe';
import type { PeScorecardResult } from '@/lib/pe-evaluation-scorecard';

export type PeScorecardDisplayData = PeScorecardResult;

function fmtPe(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return `${n.toFixed(1)}×`;
}

function fmtInr(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function fmtPct(n: number | null, digits = 1): string {
  if (n == null || !Number.isFinite(n)) return '—';
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toFixed(digits)}%`;
}

function toneClass(tone: string): string {
  return `pe-tone pe-tone-${tone}`;
}

function signalLabel(signal: -1 | 0 | 1): string {
  if (signal > 0) return '+1 Good';
  if (signal < 0) return '−1 Bad';
  return '0 Neutral';
}

interface PeScorecardResultsProps {
  data: PeScorecardDisplayData;
  recordId?: string;
  savedAt?: string;
}

export function PeScorecardResults({ data, recordId, savedAt }: PeScorecardResultsProps) {
  const params = data.parameters;

  return (
    <>
      {recordId && (
        <section className="card wide pe-saved-banner">
          <p className="muted small">
            Saved to your history
            {savedAt ? ` · ${new Date(savedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} IST` : ''}
            {' · '}
            <Link href={`/stock-calculator/pe/${recordId}`}>Open saved scorecard →</Link>
          </p>
        </section>
      )}

      <section className="card wide pe-eval-summary">
        <div className="pe-eval-head">
          <div>
            <h2>
              {data.stockName} <span className="muted">({data.ticker})</span>
            </h2>
            <p className="muted small">
              {data.sector} · Held {data.yearsHeld}y since {data.purchaseDate}
              {params.parametersFile && (
                <>
                  {' '}
                  · <code>{params.parametersFile}</code>
                </>
              )}
            </p>
          </div>
          <Link href={data.stockbookParametersUrl} className="btn-ghost">
            Open PARAMETERS →
          </Link>
        </div>

        <div className="pe-eval-metrics">
          <div className="pe-eval-metric">
            <span className="pe-eval-label">Your purchase</span>
            <strong>{fmtInr(data.purchasePrice)}</strong>
            <span className="muted small">Part A anchor</span>
          </div>
          <div className="pe-eval-metric">
            <span className="pe-eval-label">CMP today</span>
            <strong>{fmtInr(data.cmp)}</strong>
            <span className="muted small">{data.cmpSource}</span>
          </div>
          <div className="pe-eval-metric">
            <span className="pe-eval-label">Price return</span>
            <strong>{fmtPct(data.priceReturnPct)}</strong>
            <span className="muted small">Ignore for Part C</span>
          </div>
          <div className="pe-eval-metric">
            <span className="pe-eval-label">Purchase P/E</span>
            <strong>{fmtPe(data.purchasePe)}</strong>
            <span className={toneClass(data.purchasePeTone)}>{data.purchasePeBand}</span>
          </div>
          <div className="pe-eval-metric">
            <span className="pe-eval-label">Current P/E</span>
            <strong>{fmtPe(params.ttmPe)}</strong>
            <span className="muted small">
              {data.peCompressionPp != null
                ? `${data.peCompressionPp > 0 ? '+' : ''}${data.peCompressionPp.toFixed(1)}pp vs purchase`
                : '—'}
            </span>
          </div>
          <div className="pe-eval-metric">
            <span className="pe-eval-label">EPS growth</span>
            <strong>{fmtPct(data.epsGrowthSincePurchasePct)}</strong>
            <span className={toneClass(data.epsGrowthTone)}>{data.epsGrowthBand}</span>
          </div>
        </div>
      </section>

      <div className="pe-scorecard-parts">
        <section className="card">
          <h3>Part A — Was my purchase good?</h3>
          <p className="muted small calc-tab-lead">
            Purchase P/E = price ÷ EPS at purchase. High P/E is not fatal if Part B heals the entry.
          </p>
          <dl className="pe-score-dl">
            <dt>Purchase EPS</dt>
            <dd>
              {data.purchaseEps != null ? `₹${data.purchaseEps.toFixed(1)}` : '—'}{' '}
              <span className="muted small">({data.purchaseEpsSource})</span>
            </dd>
            <dt>EPS today</dt>
            <dd>{data.epsToday != null ? `₹${data.epsToday.toFixed(1)}` : '—'}</dd>
            <dt>Purchase P/E band</dt>
            <dd>
              <span className={toneClass(data.purchasePeTone)}>{data.purchasePeBand}</span>
            </dd>
          </dl>
        </section>

        <section className="card">
          <h3>Part B — After purchase</h3>
          <p className="muted small calc-tab-lead">P/E compression rule — never read P/E alone.</p>
          <p className={toneClass(data.peCompressionTone)}>
            <strong>{data.peCompressionRule}</strong>
          </p>
          <dl className="pe-score-dl">
            <dt>EPS growth since purchase</dt>
            <dd>
              {fmtPct(data.epsGrowthSincePurchasePct)}{' '}
              <span className={toneClass(data.epsGrowthTone)}>({data.epsGrowthBand})</span>
            </dd>
          </dl>
        </section>
      </div>

      <section className="card wide">
        <h3>Part C — Attractive today? (8-point scorecard)</h3>
        <p className="muted small calc-tab-lead">
          Would you buy at CMP with fresh cash? Purchase price is irrelevant here.
        </p>

        <div className="table-wrap">
          <table className="data-table calc-tab-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
                <th>Bucket</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {data.metrics.map((m) => (
                <tr key={m.id}>
                  <th scope="row">
                    {m.label}
                    {m.note && <span className="muted small block">{m.note}</span>}
                  </th>
                  <td>{m.value}</td>
                  <td className="muted small">{m.bucket}</td>
                  <td>
                    <span
                      className={
                        m.signal > 0
                          ? 'pe-signal-good'
                          : m.signal < 0
                            ? 'pe-signal-bad'
                            : 'pe-signal-neutral'
                      }
                    >
                      {signalLabel(m.signal)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pe-bucket-scores">
          <div className="pe-eval-metric">
            <span className="pe-eval-label">Raw score</span>
            <strong>
              {data.rawScore > 0 ? '+' : ''}
              {data.rawScore} / 8
            </strong>
          </div>
          <div className="pe-eval-metric">
            <span className="pe-eval-label">Valuation (40%)</span>
            <strong>{data.valuationScore10}/10</strong>
          </div>
          <div className="pe-eval-metric">
            <span className="pe-eval-label">Business (40%)</span>
            <strong>{data.businessScore10}/10</strong>
          </div>
          <div className="pe-eval-metric">
            <span className="pe-eval-label">Risk (20%)</span>
            <strong>{data.riskScore10}/10</strong>
          </div>
          <div className="pe-eval-metric pe-overall-score">
            <span className="pe-eval-label">Weighted overall</span>
            <strong>{data.weightedOverall10}/10</strong>
          </div>
        </div>

        <div className="pe-verdict-row">
          <div className={`pe-verdict-card ${toneClass(data.freshVerdictTone)}`}>
            <span className="pe-eval-label">Fresh surplus capital</span>
            <p>{data.freshVerdict}</p>
          </div>
          <div className="pe-verdict-card pe-tone-neutral">
            <span className="pe-eval-label">Existing holder (long-term mandate)</span>
            <p>{data.legacyVerdict}</p>
          </div>
        </div>
      </section>

      <GordonFairPePanel
        currentPe={params.ttmPe}
        defaultEarningsGrowthPct={parseEarningsGrowthDefault(
          params.forward.epsCagrBase ?? undefined
        )}
        stockLabel={data.ticker}
      />

      <section className="card wide">
        <h3>Five holder discipline questions</h3>
        <ol className="pe-questions-list">
          {data.holderQuestions.map((q) => (
            <li key={q.question}>
              <strong>{q.question}</strong>
              <p className="muted small">{q.answer}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="pe-eval-columns">
        <section className="card">
          <h3>PARAMETERS Part 1 — 10Y rear-view</h3>
          {params.historical.rows.length > 0 ? (
            <div className="table-wrap">
              <table className="data-table calc-tab-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>10Y avg</th>
                    <th>Today</th>
                    <th>Read</th>
                  </tr>
                </thead>
                <tbody>
                  {params.historical.rows.map((row) => (
                    <tr key={row.parameter}>
                      <th scope="row">{row.parameter}</th>
                      <td>{row.avg10y}</td>
                      <td>
                        <strong>{row.today}</strong>
                      </td>
                      <td>{row.read}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="muted small">No Part 1 table in PARAMETERS file.</p>
          )}
        </section>

        <section className="card">
          <h3>PARAMETERS Part 2 — 5Y forward</h3>
          <p className="muted small calc-tab-lead">Forward P/E is confirmatory only.</p>
          <div className="table-wrap">
            <table className="data-table calc-tab-table">
              <tbody>
                {params.forward.forwardFairPe && (
                  <tr>
                    <th scope="row">Forward fair P/E</th>
                    <td>
                      <strong>{params.forward.forwardFairPe}</strong>
                    </td>
                  </tr>
                )}
                {params.forward.framework5yFairPrice && (
                  <tr>
                    <th scope="row">5Y fair price (base)</th>
                    <td>
                      <strong>{params.forward.framework5yFairPrice}</strong>
                    </td>
                  </tr>
                )}
                {params.forward.forwardVerdict && (
                  <tr>
                    <th scope="row">Acceptable 5Y return?</th>
                    <td>
                      <strong>{params.forward.forwardVerdict}</strong>
                    </td>
                  </tr>
                )}
                {params.forward.addCase && (
                  <tr>
                    <th scope="row">ADD case?</th>
                    <td>{params.forward.addCase}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="card wide muted small">
        <p>
          <strong>Never decide from P/E alone.</strong> Best pattern: EPS ↑ + Revenue ↑ + ROCE
          healthy + P/E ↓/stable. For CAGR what-if, use{' '}
          <Link href="/stock-calculator/cagr">CAGR Evaluation</Link>.
        </p>
      </section>
    </>
  );
}
