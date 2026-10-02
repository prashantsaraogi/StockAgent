'use client';

import Link from 'next/link';
import type { EarningsQualityResult, TrendSignal } from '@/lib/earnings-quality';

function fmtInr(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function fmtNum(n: number | null, digits = 1): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return n.toLocaleString('en-IN', { maximumFractionDigits: digits });
}

function fmtPct(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return '—';
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toFixed(1)}%`;
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

interface EarningsQualityResultsProps {
  data: EarningsQualityResult;
  recordId?: string;
  savedAt?: string;
}

function MetricGrid({
  title,
  metrics,
}: {
  title: string;
  metrics: EarningsQualityResult['growth'];
}) {
  return (
    <section className="card">
      <h3>{title}</h3>
      <div className="eq-metric-grid">
        {metrics.map((m) => (
          <div key={m.id} className="eq-metric-cell">
            <span className="pe-eval-label">{m.label}</span>
            <strong>{m.value}</strong>
            <span className="muted small">{m.evidence}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function EarningsQualityResults({ data, recordId, savedAt }: EarningsQualityResultsProps) {
  const qLabels =
    data.quarterly.length > 0
      ? data.quarterly.map((q) => q.quarter)
      : data.quarterlyTrends[0]?.quarterLabels ?? [];

  const partA = data.partA;
  const partB = data.partB;

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
            <Link href={`/stock-calculator/earnings-quality/${recordId}`}>
              Open saved analysis →
            </Link>
          </p>
        </section>
      )}

      <section className="card wide eq-summary">
        <div className="pe-eval-head">
          <div>
            <h2>
              {data.stockName} <span className="muted">({data.ticker})</span>
            </h2>
            <p className="muted small">
              {data.sector} · {data.dataSource}
              {data.earningsQualityFile && (
                <>
                  {' '}
                  · <code>{data.earningsQualityFile}</code>
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
              <strong>{fmtInr(data.cmp)}</strong>
              <span className="muted small">{data.cmpSource}</span>
            </div>
            <div className="pe-eval-metric">
              <span className="pe-eval-label">5Y EPS CAGR</span>
              <strong>{fmtPct(partA?.epsCagr5y ?? null)}</strong>
              <span className="muted small">{partA?.cashQualityNote ?? '—'}</span>
            </div>
            <div className="pe-eval-metric">
              <span className="pe-eval-label">Forward FY27 EPS</span>
              <strong>
                {partB?.years[0] ? `₹${fmtNum(partB.years[0].projectedEps)}` : '—'}
              </strong>
              <span className="muted small">
                {partB?.years[0]
                  ? `Adj growth ${fmtPct(partB.years[0].adjustedEpsGrowthPct)}`
                  : '—'}
              </span>
            </div>
          </div>
        </div>

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

      {partA && (
        <section className="card wide eq-part-a">
          <div className="eq-part-head">
            <h3>{partA.title}</h3>
            <span className={`eq-part-verdict ${toneClass(partA.tone)}`}>{partA.verdict}</span>
          </div>
          <p className="muted small calc-tab-lead">
            Last five fiscal years — EPS and YoY growth are the primary quality lens. Revenue/PAT
            CAGR and CFO/PAT cross-check accrual risk.
          </p>

          {partA.years.length === 0 ? (
            <p className="muted">
              No 5Y history yet. Add <code>## Part A — Five-year rear-view</code> table to{' '}
              <code>EARNINGS_QUALITY_{data.ticker}.md</code>, or populate EPS CAGR in PARAMETERS.
            </p>
          ) : (
            <>
              <div className="eq-part-summary">
                <div className="eq-part-stat">
                  <span className="pe-eval-label">EPS CAGR (5Y)</span>
                  <strong>{fmtPct(partA.epsCagr5y)}</strong>
                </div>
                <div className="eq-part-stat">
                  <span className="pe-eval-label">PAT CAGR (5Y)</span>
                  <strong>{fmtPct(partA.patCagr5y)}</strong>
                </div>
                <div className="eq-part-stat">
                  <span className="pe-eval-label">Revenue CAGR (5Y)</span>
                  <strong>{fmtPct(partA.revenueCagr5y)}</strong>
                </div>
                <div className="eq-part-stat">
                  <span className="pe-eval-label">Cash quality</span>
                  <strong className="small">{partA.cashQualityNote}</strong>
                </div>
              </div>

              {!partA.dataComplete && (
                <p className="muted small eq-tag-warn">
                  Partial data — some years estimated from CAGR. Add FY-level FACT rows in StockBook.
                </p>
              )}

              <div className="eq-table-wrap">
                <table className="eq-part-table">
                  <thead>
                    <tr>
                      <th>FY</th>
                      <th>Revenue (₹ cr)</th>
                      <th>PAT (₹ cr)</th>
                      <th>EPS (₹)</th>
                      <th>EPS YoY</th>
                      <th>Rev YoY</th>
                      <th>CFO/PAT</th>
                      <th>Quality</th>
                      <th>Evidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partA.years.map((y) => (
                      <tr key={y.fiscalYear}>
                        <td>
                          <strong>{y.fiscalYear}</strong>
                        </td>
                        <td>{fmtNum(y.revenueCr, 0)}</td>
                        <td>{fmtNum(y.patCr, 0)}</td>
                        <td>
                          <strong>{fmtNum(y.eps)}</strong>
                        </td>
                        <td className={y.epsYoYPct != null && y.epsYoYPct < 0 ? 'eq-cell-warn' : ''}>
                          {fmtPct(y.epsYoYPct)}
                        </td>
                        <td>{fmtPct(y.revenueYoYPct)}</td>
                        <td>{y.cfoPatRatio != null ? y.cfoPatRatio.toFixed(2) : '—'}</td>
                        <td>{y.qualitySignal}</td>
                        <td className="muted small">{y.evidence}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      )}

      {partB && (
        <section className="card wide eq-part-b">
          <div className="eq-part-head">
            <h3>{partB.title}</h3>
            <span className={`eq-part-verdict ${toneClass(partB.tone)}`}>{partB.verdict}</span>
          </div>
          <p className="muted small calc-tab-lead">
            Base EPS growth from PARAMETERS, reduced by internal and external risk haircuts per year.
            Temporary external risks (e.g. oil) taper in outer years; L3 risks persist.
            {partB.aiEnriched ? ' AI context from risk registers + News index.' : ' Rule-based context (set GOOGLE_GENERATIVE_AI_API_KEY for AI notes).'}
          </p>

          <div className="eq-forward-highlight">{partB.currentYearHighlight}</div>

          <div className="eq-risk-chips">
            <span className="eq-risk-chip">
              Internal {partB.internalRisk.level} · haircut ~{partB.internalRisk.haircutMidPp} pp
            </span>
            <span className="eq-risk-chip">
              External {partB.externalRisk.level} · haircut ~{partB.externalRisk.haircutMidPp} pp
            </span>
            <span className="eq-risk-chip muted">
              Base EPS CAGR {fmtPct(partB.baseEpsCagrPct)} · start EPS ₹{fmtNum(partB.startingEps)}
            </span>
          </div>

          <div className="eq-table-wrap">
            <table className="eq-part-table eq-forward-table">
              <thead>
                <tr>
                  <th>FY</th>
                  <th>Base growth</th>
                  <th>Int. haircut</th>
                  <th>Ext. haircut</th>
                  <th>Adj growth</th>
                  <th>Projected EPS</th>
                  <th>Internal factor</th>
                  <th>External factor</th>
                </tr>
              </thead>
              <tbody>
                {partB.years.map((y, i) => (
                  <tr key={y.fiscalYear} className={i === 0 ? 'eq-current-fy-row' : ''}>
                    <td>
                      <strong>{y.fiscalYear}</strong>
                      {i === 0 && <span className="eq-current-badge">Current</span>}
                    </td>
                    <td>{fmtPct(y.baseEpsGrowthPct)}</td>
                    <td>−{y.internalHaircutPp.toFixed(1)} pp</td>
                    <td>−{y.externalHaircutPp.toFixed(1)} pp</td>
                    <td>
                      <strong>{fmtPct(y.adjustedEpsGrowthPct)}</strong>
                    </td>
                    <td>
                      <strong>₹{fmtNum(y.projectedEps)}</strong>
                    </td>
                    <td className="eq-factor-cell muted small">{y.internalFactor}</td>
                    <td className="eq-factor-cell muted small">{y.externalFactor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <details className="card wide eq-supplementary">
        <summary>Supplementary — annual metrics &amp; quarterly cross-check</summary>

        <div className="eq-sections-grid">
          <MetricGrid title="Growth metrics (annual)" metrics={data.growth} />
          <MetricGrid title="Profitability" metrics={data.profitability} />
          <MetricGrid title="Cash quality" metrics={data.cashQuality} />
        </div>

        <section className="eq-quarterly">
          <h3>Quarterly trend — last {data.quarterly.length || 8} quarters</h3>
          <p className="muted small calc-tab-lead">
            Catches what annual P/E misses — e.g. revenue ↑↑ but profit ↓.
          </p>

          {data.quarterly.length === 0 ? (
            <p className="muted">
              No quarterly table yet. Add section D to{' '}
              <code>EARNINGS_QUALITY_{data.ticker}.md</code> in StockBook.
            </p>
          ) : (
            <>
              <div className="eq-table-wrap">
                <table className="eq-quarterly-table">
                  <thead>
                    <tr>
                      <th>Metric</th>
                      {qLabels.map((l) => (
                        <th key={l}>{l}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(['Revenue', 'EBITDA', 'Margin', 'PAT', 'EPS', 'CFO'] as const).map((metric) => {
                      const trendRow = data.quarterlyTrends.find((t) => t.metric === metric);
                      const keyMap: Record<string, keyof (typeof data.quarterly)[0]> = {
                        Revenue: 'revenue',
                        EBITDA: 'ebitda',
                        Margin: 'marginPct',
                        PAT: 'pat',
                        EPS: 'eps',
                        CFO: 'cfo',
                      };
                      const k = keyMap[metric];
                      return (
                        <tr key={metric}>
                          <td>
                            <strong>{metric}</strong>
                            {trendRow && (
                              <span className={`eq-trend-badge ${trendClass(trendRow.trend)}`}>
                                {trendRow.trendLabel}
                              </span>
                            )}
                          </td>
                          {data.quarterly.map((q) => (
                            <td key={`${metric}-${q.quarter}`}>
                              {fmtNum(q[k] as number | null, metric === 'EPS' ? 1 : 0)}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <h4>Trend summary</h4>
              <ul className="eq-trend-list">
                {data.quarterlyTrends.map((t) => (
                  <li key={t.metric}>
                    <span className={`eq-trend-badge ${trendClass(t.trend)}`}>{t.trendLabel}</span>
                    <strong>{t.metric}</strong>
                    {t.changePct != null && (
                      <span className="muted small"> ({fmtPct(t.changePct)} YoY/latest)</span>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </details>
    </>
  );
}
