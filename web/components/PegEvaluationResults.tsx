'use client';

import Link from 'next/link';
import type { PegEvaluationResult } from '@/lib/peg-evaluation';

function toneClass(tone: string): string {
  return `pe-tone pe-tone-${tone}`;
}

interface Props {
  data: PegEvaluationResult;
  recordId?: string;
  savedAt?: string;
}

export function PegEvaluationResults({ data, recordId, savedAt }: Props) {
  const passedCombo = data.comboChecks.filter((c) => c.passed).length;

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
            <Link href={`/stock-calculator/peg/${recordId}`}>Open saved analysis →</Link>
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
              {data.pegFile && (
                <>
                  {' '}
                  · <code>{data.pegFile}</code>
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
              <strong>{data.cmp != null ? `₹${data.cmp.toLocaleString('en-IN')}` : '—'}</strong>
              <span className="muted small">{data.cmpSource}</span>
            </div>
            <div className="pe-eval-metric">
              <span className="pe-eval-label">P/E · PEG</span>
              <strong>
                {data.ttmPe != null ? `${data.ttmPe.toFixed(1)}×` : '—'}
                {' · '}
                {data.pegRatio != null ? `${data.pegRatio.toFixed(2)}×` : '—'}
              </strong>
              <span className="muted small">
                Growth {data.epsGrowthPct != null ? `${data.epsGrowthPct.toFixed(1)}%` : '—'}
              </span>
            </div>
            <div className="pe-eval-metric">
              <span className="pe-eval-label">100-pt score</span>
              <strong>{data.totalScore100}/100</strong>
              <span className="muted small">{data.opportunityType}</span>
            </div>
            <div className="pe-eval-metric">
              <span className="pe-eval-label">Combo checks</span>
              <strong>
                {passedCombo}/{data.comboChecks.length}
              </strong>
              <span className="muted small">ROCE · PEG · P/E · debt · FCF</span>
            </div>
          </div>
        </div>

        <ul className="peg-summary-lines muted small">
          {data.summaryLines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="card wide">
        <h3>Five-metric scorecard</h3>
        <p className="muted small">P/E · PEG · ROCE · Debt · FCF — plus growth and optional dividend</p>
        <div className="holdings-table-wrap">
          <table className="holdings-table compact peg-scorecard-table">
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Value</th>
                <th>Zone</th>
                <th>What it indicates</th>
              </tr>
            </thead>
            <tbody>
              {data.scorecard.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.parameter}</strong>
                  </td>
                  <td>{r.value}</td>
                  <td className="peg-zone-cell">{r.zone}</td>
                  <td className="small">{r.indicates}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card wide">
        <h3>Area scores (/10)</h3>
        <div className="peg-area-grid">
          {(
            [
              ['Business quality', data.areaScores.businessQuality],
              ['Growth', data.areaScores.growth],
              ['ROCE', data.areaScores.roce],
              ['Balance sheet', data.areaScores.balanceSheet],
              ['Cash generation', data.areaScores.cashGeneration],
              ['Valuation (P/E)', data.areaScores.valuation],
              ['PEG', data.areaScores.peg],
              ['Overall', data.areaScores.overall10],
            ] as const
          ).map(([label, val]) => (
            <div key={label} className="peg-area-pill">
              <span className="muted small">{label}</span>
              <strong>{val != null ? val.toFixed(1) : '—'}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="card wide">
        <h3>100-point model</h3>
        <div className="holdings-table-wrap">
          <table className="holdings-table compact">
            <thead>
              <tr>
                <th>Block</th>
                <th>Earned</th>
                <th>Max</th>
                <th>Zone</th>
              </tr>
            </thead>
            <tbody>
              {data.pointsBreakdown.map((p) => (
                <tr key={p.id}>
                  <td>{p.label}</td>
                  <td>
                    <strong>{p.earnedPoints}</strong>
                  </td>
                  <td>{p.maxPoints}</td>
                  <td>{p.zone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card wide">
        <h3>Preferred combo (Hero screen)</h3>
        <ul className="peg-combo-list">
          {data.comboChecks.map((c) => (
            <li key={c.label} className={c.passed ? 'peg-combo-pass' : 'peg-combo-fail'}>
              <span>{c.passed ? '✓' : '○'}</span>
              <strong>{c.label}</strong>
              <span className="muted small">{c.detail}</span>
            </li>
          ))}
        </ul>
        {data.fcfIndustryMode === 'infra' && (
          <p className="muted small peg-infra-note">
            FCF evaluated in <strong>infra mode</strong> — do not apply consumer FCF thresholds (L&T
            pattern).
          </p>
        )}
      </section>

      {data.maxPeAtTargetPeg.length > 0 && (
        <section className="card wide">
          <h3>Max P/E at target PEG (your growth assumption)</h3>
          <p className="muted small">
            Using EPS growth {data.epsGrowthPct?.toFixed(1)}% — entry price discipline
          </p>
          <div className="holdings-table-wrap">
            <table className="holdings-table compact">
              <thead>
                <tr>
                  <th>Target PEG</th>
                  <th>Max P/E</th>
                </tr>
              </thead>
              <tbody>
                {data.maxPeAtTargetPeg.map((r) => (
                  <tr key={r.peg}>
                    <td>{r.peg.toFixed(1)}×</td>
                    <td>
                      <strong>{r.maxPe != null ? `${r.maxPe.toFixed(1)}×` : '—'}</strong>
                      {data.ttmPe != null && r.maxPe != null && (
                        <span className="muted small">
                          {' '}
                          {data.ttmPe <= r.maxPe ? '(CMP OK)' : `(CMP ${data.ttmPe.toFixed(1)}× above)`}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="card wide">
        <h3>PEG sensitivity table</h3>
        <p className="muted small">P/E ÷ growth — illustrative growth rates (%)</p>
        <div className="holdings-table-wrap">
          <table className="holdings-table compact">
            <thead>
              <tr>
                <th>EPS growth %</th>
                <th>P/E @ PEG 1</th>
                <th>@ 1.5</th>
                <th>@ 2</th>
                <th>@ 2.5</th>
              </tr>
            </thead>
            <tbody>
              {data.sensitivity.map((r) => (
                <tr
                  key={r.epsGrowthPct}
                  className={
                    data.epsGrowthPct != null && r.epsGrowthPct === Math.round(data.epsGrowthPct)
                      ? 'peg-sensitivity-highlight'
                      : undefined
                  }
                >
                  <td>{r.epsGrowthPct}%</td>
                  <td>{r.peAtPeg1}×</td>
                  <td>{r.peAtPeg15}×</td>
                  <td>{r.peAtPeg2}×</td>
                  <td>{r.peAtPeg25}×</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {data.warnings.length > 0 && (
        <section className="card wide eq-warnings">
          <h3>Warnings</h3>
          <ul>
            {data.warnings.map((w) => (
              <li key={w.id}>
                <strong>{w.title}</strong> — {w.detail}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
