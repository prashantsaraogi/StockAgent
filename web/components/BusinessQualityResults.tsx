'use client';

import Link from 'next/link';
import type { BusinessQualityResult, MoatPillar, MoatSignal } from '@/lib/business-quality-moat';
import { formatAnalysisDataSource, sanitizeMoatLine } from '@/lib/investor-report-format';

function fmtInr(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function toneClass(tone: string): string {
  return `pe-tone pe-tone-${tone}`;
}

function signalClass(s: MoatSignal): string {
  if (s === '🟢') return 'bq-signal-green';
  if (s === '🟡') return 'bq-signal-yellow';
  if (s === '🔴') return 'bq-signal-red';
  return 'bq-signal-none';
}

function displayPillar(pillar: MoatPillar): MoatPillar {
  return {
    ...pillar,
    headline: sanitizeMoatLine(pillar.headline),
    factors: pillar.factors.map((f) => ({
      ...f,
      label: sanitizeMoatLine(f.label),
      assessment: sanitizeMoatLine(f.assessment),
    })),
  };
}

function PillarCard({ pillar }: { pillar: MoatPillar }) {
  const p = displayPillar(pillar);
  return (
    <section className="card bq-pillar-card">
      <div className="bq-pillar-head">
        <h3>
          {p.number}. {p.title}
        </h3>
        <div className="bq-pillar-score">
          <span className={`bq-score-badge ${signalClass(p.signal)}`}>
            {p.score10 ?? '—'}/10
          </span>
          <span className={`bq-signal ${signalClass(p.signal)}`}>{p.signal}</span>
        </div>
      </div>
      <p className="muted small bq-pillar-headline">{p.headline}</p>

      {p.factors.length > 0 ? (
        <table className="bq-factor-table">
          <thead>
            <tr>
              <th>Factor</th>
              <th>Assessment</th>
              <th>Signal</th>
            </tr>
          </thead>
          <tbody>
            {p.factors.map((f) => (
              <tr key={f.id}>
                <td>{f.label}</td>
                <td>{f.assessment}</td>
                <td className={signalClass(f.signal)}>{f.signal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="muted small">No detailed factor breakdown yet — refresh after the next company update.</p>
      )}
    </section>
  );
}

interface BusinessQualityResultsProps {
  data: BusinessQualityResult;
  recordId?: string;
  savedAt?: string;
}

export function BusinessQualityResults({ data, recordId, savedAt }: BusinessQualityResultsProps) {
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
            <Link href={`/stock-calculator/business-quality/${recordId}`}>
              Open saved scorecard →
            </Link>
          </p>
        </section>
      )}

      <section className="card wide bq-summary">
        <div className="pe-eval-head">
          <div>
            <h2>
              {data.stockName} <span className="muted">({data.ticker})</span>
            </h2>
            <p className="muted small">
              {data.sector} · {formatAnalysisDataSource(data.dataSource)}
            </p>
          </div>
          <Link href={data.stockbookUrl} className="btn-ghost">
            Open StockBook →
          </Link>
        </div>

        <blockquote className="eq-core-question">{data.coreQuestion}</blockquote>

        <div className="bq-score-hero">
          <div className="bq-score-main">
            <span className="pe-eval-label">Business Quality</span>
            <strong className="bq-score-number">{data.businessQualityScore10}/10</strong>
            <span className={toneClass(data.overallTone)}>{data.verdict}</span>
          </div>
          <div className="pe-eval-metrics">
            <div className="pe-eval-metric">
              <span className="pe-eval-label">CMP</span>
              <strong>{fmtInr(data.cmp)}</strong>
              <span className="muted small">{sanitizeMoatLine(data.cmpSource)}</span>
            </div>
            <div className="pe-eval-metric">
              <span className="pe-eval-label">Pillars scored</span>
              <strong>{data.pillars.filter((p) => p.score10 != null).length}/7</strong>
              <span className="muted small">Seven-factor scorecard</span>
            </div>
            <div className="pe-eval-metric">
              <span className="pe-eval-label">Green factors</span>
              <strong>
                {data.pillars.reduce(
                  (n, p) => n + p.factors.filter((f) => f.signal === '🟢').length,
                  0
                )}
              </strong>
              <span className="muted small">🟢 strong moat signals</span>
            </div>
          </div>
        </div>

        {data.summaryLines.length > 0 && (
          <p className="muted small eq-summary-lines">
            {data.summaryLines.map((line) => sanitizeMoatLine(line)).join(' · ')}
          </p>
        )}
      </section>

      {data.highlights.length > 0 && (
        <section className="card wide">
          <h3>Factor highlights</h3>
          <div className="bq-highlights-grid">
            {data.highlights.map((h) => (
              <div key={h.factor} className="bq-highlight-cell">
                <span className={`bq-signal ${signalClass(h.signal)}`}>{h.signal}</span>
                <strong>{h.factor}</strong>
                <span className="muted small">{sanitizeMoatLine(h.assessment)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="card wide">
        <h3>Seven-pillar scorecard</h3>
        <table className="bq-scorecard-table">
          <thead>
            <tr>
              <th>Pillar</th>
              <th>Score</th>
              <th>Signal</th>
              <th>Headline</th>
            </tr>
          </thead>
          <tbody>
            {data.pillars.map((pillar) => {
              const p = displayPillar(pillar);
              return (
              <tr key={p.id}>
                <td>
                  {p.number}. {p.title}
                </td>
                <td>
                  <strong>{p.score10 ?? '—'}/10</strong>
                </td>
                <td className={signalClass(p.signal)}>{p.signal}</td>
                <td className="muted small">{p.headline}</td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </section>

      <div className="bq-pillars-grid">
        {data.pillars.map((p) => (
          <PillarCard key={p.id} pillar={p} />
        ))}
      </div>

      {data.businessQualityScore10 < 10 && data.notTenReasons.length > 0 && (
        <section className="card wide bq-ceiling">
          <h3>Why not 10/10?</h3>
          <ul>
            {data.notTenReasons.map((r) => (
              <li key={r}>{sanitizeMoatLine(r)}</li>
            ))}
          </ul>
          {data.ceilingNote && (
            <p className="muted small">{sanitizeMoatLine(data.ceilingNote)}</p>
          )}
        </section>
      )}
    </>
  );
}
