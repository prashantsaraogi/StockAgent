'use client';

import Link from 'next/link';
import {
  SECTOR_VIEW_BANDS,
  scoreBand,
  scoreTo100,
  sectorViewFromScore,
} from '@/lib/sector-score-framework';
import type { ParsedSectorScore } from '@/lib/sector-score-parser';

interface SectorScorePanelProps {
  sectorLabel: string;
  filePath: string;
  score: ParsedSectorScore;
  compact?: boolean;
}

function scoreClass(score: number | null): string {
  const band = scoreBand(score);
  return `sector-score-val sector-score-${band}`;
}

/** Output-only classification legend — no evaluation process */
export function SectorScoreLegend() {
  return (
    <section className="sector-score-legend" aria-label="Sector score classification">
      <table className="data-table sector-legend-table">
        <thead>
          <tr>
            <th>Score</th>
            <th>Sector view</th>
          </tr>
        </thead>
        <tbody>
          {SECTOR_VIEW_BANDS.map((b, i) => (
            <tr key={b.min}>
              <td>
                {b.min === 0
                  ? '<50'
                  : i === 0
                    ? `${b.min}–100`
                    : `${b.min}–${SECTOR_VIEW_BANDS[i - 1]!.min - 1}`}
              </td>
              <td>
                {b.emoji} {b.label}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export function SectorScorePanel({
  sectorLabel,
  filePath,
  score,
  compact = false,
}: SectorScorePanelProps) {
  const view = sectorViewFromScore(score.weightedTotal);
  const score100 = scoreTo100(score.weightedTotal);

  return (
    <section className={`card wide sector-score-panel ${compact ? 'sector-score-compact' : ''}`}>
      <div className="sector-score-head">
        <div>
          <h2>{sectorLabel}</h2>
          {score.analysisDate && (
            <p className="muted small">
              Analysis {score.analysisDate}
              {score.nextRefreshDue && ` · Refresh due ${score.nextRefreshDue}`}
            </p>
          )}
        </div>
        <div className={`sector-score-total sector-score-total-${view.cssBand}`}>
          <span className="sector-score-total-label">Sector score</span>
          <strong>{score100 != null ? score100 : '—'}</strong>
          <span className="muted small">/ 100</span>
          <span className="sector-score-view-label">
            {view.emoji} {view.label}
          </span>
        </div>
      </div>

      {!score.complete && (
        <p className="sector-score-pending muted small">Score incomplete — pending analyst fill.</p>
      )}

      <div className="sector-score-grid">
        {score.rows.map((row) => (
          <article key={row.parameterId} className="sector-score-card">
            <div className="sector-score-card-head">
              <span className="sector-score-icon">{row.parameter.icon}</span>
              <div>
                <h3>{row.parameter.label}</h3>
                <span className="muted small">{row.parameter.weightPct}%</span>
              </div>
              <strong className={scoreClass(row.score)}>
                {row.score != null ? row.score.toFixed(1) : '—'}
              </strong>
            </div>
            {!compact && row.reading && (
              <p className="sector-score-reading">{row.reading}</p>
            )}
          </article>
        ))}
      </div>

      {!compact && (
        <p className="muted small">
          <Link href={`/industry-analysis/view?file=${encodeURIComponent(filePath)}`}>
            Full sector outlook →
          </Link>
        </p>
      )}
    </section>
  );
}

interface SectorScoreCardLinkProps {
  label: string;
  filePath: string;
  score: ParsedSectorScore;
  /** Sector detail (score + cap tiers). Falls back to markdown view. */
  detailHref?: string;
}

export function SectorScoreCardLink({
  label,
  filePath,
  score,
  detailHref,
}: SectorScoreCardLinkProps) {
  const view = sectorViewFromScore(score.weightedTotal);
  const score100 = scoreTo100(score.weightedTotal);
  const href =
    detailHref ?? `/industry-analysis/view?file=${encodeURIComponent(filePath)}`;

  return (
    <Link href={href} className={`sector-score-link-card sector-score-total-${view.cssBand}`}>
      <div className="sector-score-link-head">
        <strong>{label}</strong>
        <span className="sector-score-link-total">
          {score100 != null ? score100 : '—'}
          {score100 != null && <span className="sector-score-link-denom">/100</span>}
        </span>
      </div>
      <p className="sector-score-link-view">
        {view.emoji} {view.label}
      </p>
      <div className="sector-score-mini-bars">
        {score.rows.map((r) => (
          <span
            key={r.parameterId}
            className={`sector-mini-bar sector-score-${scoreBand(r.score)}`}
            title={`${r.parameter.label}: ${r.score ?? '—'}`}
            style={{
              width: r.score != null ? `${(r.score / 10) * 100}%` : '4px',
            }}
          />
        ))}
      </div>
    </Link>
  );
}
