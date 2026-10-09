'use client';

import Link from 'next/link';
import type { MarginAnalysisResult, TrendSignal } from '@/lib/margin-analysis';

function fmtNum(n: number | null, digits = 1): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return n.toLocaleString('en-IN', { maximumFractionDigits: digits });
}

function fmtPct(n: number | null, signed = false): string {
  if (n == null || !Number.isFinite(n)) return '—';
  const sign = signed && n > 0 ? '+' : '';
  return `${sign}${n.toFixed(1)}%`;
}

function fmtPp(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return '—';
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toFixed(1)} pp`;
}

function toneClass(tone: string): string {
  return `pe-tone pe-tone-${tone}`;
}

function trendClass(t: TrendSignal): string {
  if (t === 'improving') return 'eq-trend-up';
  if (t === 'deteriorating') return 'eq-trend-down';
  if (t === 'stable') return 'eq-trend-flat';
  return 'eq-trend-unknown';
}

interface MarginAnalysisResultsProps {
  data: MarginAnalysisResult;
  recordId?: string;
  savedAt?: string;
}

export function MarginAnalysisResults({ data, recordId, savedAt }: MarginAnalysisResultsProps) {
  return (
    <>
      {recordId && (
        <section className="card wide pe-saved-banner">
          <p className="muted small">
            Saved to your history
            {savedAt
              ? ` · ${new Date(savedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} IST`
              : ''}
            {' · '}
            <Link href={`/stock-calculator/margin/${recordId}`}>Open saved analysis →</Link>
          </p>
        </section>
      )}

      <section className="card wide mg-summary">
        <div className="pe-eval-head">
          <div>
            <h2>
              {data.stockName} <span className="muted">({data.ticker})</span>
            </h2>
            <p className="muted small">
              {data.sector} · {data.dataSource}
              {data.marginFile && (
                <>
                  {' '}
                  · <code>{data.marginFile}</code>
                </>
              )}
            </p>
          </div>
          <Link href={data.stockbookUrl} className="btn-ghost">
            Open PARAMETERS →
          </Link>
        </div>

        <blockquote className="eq-core-question">{data.coreQuestion}</blockquote>

        <div className="eq-verdict-row">
          <div className={`eq-overall-verdict ${toneClass(data.overallTone)}`}>
            {data.overallVerdict}
          </div>
          <div className="pe-eval-metrics">
            <div className="pe-eval-metric">
              <span className="pe-eval-label">CMP</span>
              <strong>{data.cmp != null ? `₹${fmtNum(data.cmp, 0)}` : '—'}</strong>
              <span className="muted small">{data.cmpSource}</span>
            </div>
            <div className="pe-eval-metric">
              <span className="pe-eval-label">{data.partB.primaryMetricLabel} vs 10Y</span>
              <strong>{fmtPp(data.partB.primaryDeltaPp)}</strong>
              <span className="muted small">{data.partB.verdict.slice(0, 40)}</span>
            </div>
            <div className="pe-eval-metric">
              <span className="pe-eval-label">5Y avg {data.partA.primaryMetricLabel}</span>
              <strong>{fmtPct(data.partA.avgEbitdaPct)}</strong>
              <span className={`eq-trend-badge ${trendClass(data.partA.trendDirection)}`}>
                {data.partA.trendLabel}
              </span>
            </div>
          </div>
        </div>

        {data.liveMetricsSource && (
          <p className="muted small mg-external-note">
            Live margins: {data.liveMetricsSource} — label UNVERIFIED vs annual report until StockBook
            PARAMETERS Block B / MARGIN file updated.
          </p>
        )}

        {data.externalRiskNote && (
          <p className="muted small mg-external-note">{data.externalRiskNote}</p>
        )}

        {data.warnings.length > 0 && (
          <div className="eq-warnings">
            {data.warnings.map((w) => (
              <div key={w.id} className={`eq-warning eq-warning-${w.severity}`}>
                <strong>{w.title}</strong>
                <p>{w.detail}</p>
              </div>
            ))}
          </div>
        )}

        {data.summaryLines.length > 0 && (
          <p className="muted small eq-summary-lines">{data.summaryLines.join(' · ')}</p>
        )}
      </section>

      <section className="card wide">
        <div className="eq-part-head">
          <h3>{data.partA.title}</h3>
          <span className={`eq-part-verdict ${toneClass(data.partA.tone)}`}>{data.partA.verdict}</span>
        </div>

        {data.partA.years.length === 0 ? (
          <p className="muted">No 5Y margin history could be derived — refresh PARAMETERS and MARGIN file.</p>
        ) : (
          <>
            {!data.partA.dataComplete && (
              <p className="muted small eq-tag-warn">Partial data — add FY-level FACT rows in StockBook.</p>
            )}
            <div className="eq-table-wrap">
              <table className="eq-part-table">
                <thead>
                  <tr>
                    <th>FY</th>
                    <th>Gross %</th>
                    <th>EBITDA %</th>
                    <th>EBIT %</th>
                    <th>Net %</th>
                    <th>EBITDA Δ</th>
                    <th>Signal</th>
                    <th>Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {data.partA.years.map((y) => (
                    <tr key={y.fiscalYear}>
                      <td>
                        <strong>{y.fiscalYear}</strong>
                      </td>
                      <td>{fmtPct(y.grossPct)}</td>
                      <td>
                        <strong>{fmtPct(y.ebitdaPct)}</strong>
                      </td>
                      <td>{fmtPct(y.ebitPct)}</td>
                      <td>{fmtPct(y.netPct)}</td>
                      <td className={y.ebitdaDeltaPp != null && y.ebitdaDeltaPp < 0 ? 'eq-cell-warn' : ''}>
                        {fmtPp(y.ebitdaDeltaPp)}
                      </td>
                      <td>{y.signal}</td>
                      <td className="muted small">{y.evidence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <section className="card wide">
        <div className="eq-part-head">
          <h3>{data.partB.title}</h3>
          <span className={`eq-part-verdict ${toneClass(data.partB.tone)}`}>{data.partB.verdict}</span>
        </div>
        <div className="eq-table-wrap">
          <table className="eq-part-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Today @ CMP</th>
                <th>10Y avg (normal)</th>
                <th>Δ pp</th>
                <th>Read</th>
                <th>Signal</th>
              </tr>
            </thead>
            <tbody>
              {data.partB.rows.map((r) => (
                <tr key={r.metric}>
                  <td>
                    <strong>{r.metric}</strong>
                  </td>
                  <td>{fmtPct(r.todayPct)}</td>
                  <td>{fmtPct(r.avg10yPct)}</td>
                  <td className={r.deltaPp != null && r.deltaPp < -1 ? 'eq-cell-warn' : ''}>
                    {fmtPp(r.deltaPp)}
                  </td>
                  <td className="muted small">{r.read}</td>
                  <td>{r.signal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card wide">
        <div className="eq-part-head">
          <h3>{data.partC.title}</h3>
        </div>
        <div className="mg-pass-through">{data.partC.passThroughVerdict}</div>

        {data.partC.drivers.length === 0 ? (
          <p className="muted">
            No drivers table. Add <code>## Part C — Margin drivers</code> to{' '}
            <code>MARGIN_{data.ticker}.md</code>.
          </p>
        ) : (
          <div className="eq-table-wrap">
            <table className="eq-part-table">
              <thead>
                <tr>
                  <th>Driver</th>
                  <th>Assessment</th>
                  <th>Impact</th>
                  <th>Evidence</th>
                </tr>
              </thead>
              <tbody>
                {data.partC.drivers.map((d) => (
                  <tr key={d.driver}>
                    <td>
                      <strong>{d.driver}</strong>
                    </td>
                    <td className="eq-factor-cell">{d.assessment}</td>
                    <td>{d.impact}</td>
                    <td className="muted small">{d.evidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card wide">
        <div className="eq-part-head">
          <h3>{data.partD.title}</h3>
          <span className={`eq-trend-badge ${trendClass(data.partD.trend)}`}>
            {data.partD.trendLabel}
            {data.partD.changePp != null && ` (${fmtPp(data.partD.changePp)})`}
          </span>
        </div>

        {data.partD.quarters.length === 0 ? (
          <p className="muted">
            No quarterly margins. Add section D to <code>EARNINGS_QUALITY_{data.ticker}.md</code>.
          </p>
        ) : (
          <div className="eq-table-wrap">
            <table className="eq-quarterly-table">
              <thead>
                <tr>
                  <th>Quarter</th>
                  <th>Revenue (₹ cr)</th>
                  <th>Margin %</th>
                </tr>
              </thead>
              <tbody>
                {data.partD.quarters.map((q) => (
                  <tr key={q.quarter}>
                    <td>
                      <strong>{q.quarter}</strong>
                    </td>
                    <td>{fmtNum(q.revenue, 0)}</td>
                    <td>
                      <strong>{fmtPct(q.marginPct)}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
