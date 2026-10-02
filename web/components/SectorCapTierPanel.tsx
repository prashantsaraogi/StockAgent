'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { CapTierBlock, CapLensId } from '@/lib/sector-cap-universe-parser';

interface Props {
  tiers: CapTierBlock[];
  complete: boolean;
  mcapLastRefreshed?: string | null;
}

function lensCount(lens: CapTierBlock['lenses'][number] | undefined): string {
  if (!lens) return '0/5';
  return `${lens.stocks.length}/${lens.expectedCount}`;
}

function tierStockTotal(tier: CapTierBlock): number {
  return tier.lenses.reduce((n, l) => n + l.stocks.length, 0);
}

export function SectorCapTierPanel({ tiers, complete, mcapLastRefreshed }: Props) {
  const [activeId, setActiveId] = useState(tiers[0]?.id ?? 'large-cap');
  const active = tiers.find((t) => t.id === activeId) ?? tiers[0];

  if (!active) return null;

  const growth = active.lenses.find((l) => l.id === 'growth');
  const mcap = active.lenses.find((l) => l.id === 'market-cap');
  const activeTotal = tierStockTotal(active);

  return (
    <section className="card wide sector-cap-panel">
      <div className="sector-cap-head">
        <div>
          <h2>Sector stocks by cap tier</h2>
          <p className="muted small sector-cap-subtitle">
            <strong>Large cap</strong> lists <strong>10 stocks</strong> — 5 in Growth perspective
            and 5 in Market cap perspective. Mid and Small cap use the same 5+5 split per tab.
          </p>
        </div>
        <div className="sector-cap-head-meta">
          {mcapLastRefreshed && (
            <span className="muted small">Mcap refreshed {mcapLastRefreshed}</span>
          )}
          {!complete && (
            <span className="muted small">Universe incomplete — agent refresh pending</span>
          )}
        </div>
      </div>

      <div className="sector-cap-legend" aria-hidden="true">
        <span className="sector-cap-legend-item sector-cap-legend-growth">
          Growth perspective · 3Y EPS CAGR · 5 stocks
        </span>
        <span className="sector-cap-legend-item sector-cap-legend-mcap">
          Market cap perspective · Mcap rank · 5 stocks
        </span>
      </div>

      <div className="sector-cap-tabs" role="tablist" aria-label="Market cap tier">
        {tiers.map((t) => {
          const total = tierStockTotal(t);
          const growthLens = t.lenses.find((l) => l.id === 'growth');
          const mcapLens = t.lenses.find((l) => l.id === 'market-cap');
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={t.id === activeId}
              className={`sector-cap-tab ${t.id === activeId ? 'sector-cap-tab-active' : ''}`}
              onClick={() => setActiveId(t.id)}
            >
              <span className="sector-cap-tab-label">{t.label}</span>
              <span className="sector-cap-tab-total">
                {total}/{t.expectedTotal}
              </span>
              <span className="sector-cap-tab-detail">
                G {lensCount(growthLens)} · M {lensCount(mcapLens)}
              </span>
            </button>
          );
        })}
      </div>

      <p className="sector-cap-active-summary muted small">
        {active.label}: <strong>{activeTotal}/{active.expectedTotal}</strong> stocks · Growth{' '}
        {lensCount(growth)} · Market cap {lensCount(mcap)}
      </p>

      <div className="sector-cap-lens-grid" role="tabpanel">
        <CapLensColumn lens={growth} lensId="growth" />
        <CapLensColumn lens={mcap} lensId="market-cap" />
      </div>
    </section>
  );
}

function CapLensColumn({
  lens,
  lensId,
}: {
  lens: CapTierBlock['lenses'][number] | undefined;
  lensId: CapLensId;
}) {
  if (!lens) return null;

  const cssLens = lensId === 'growth' ? 'sector-cap-lens-growth' : 'sector-cap-lens-mcap';
  const hint = lensId === 'growth' ? '3Y EPS CAGR' : 'Mcap rank';

  return (
    <div className={`sector-cap-lens-col ${cssLens}`}>
      <div className="sector-cap-lens-header">
        <h3>
          {lens.label}
          <span className="sector-cap-lens-hint"> · {hint}</span>
        </h3>
        <span className="sector-cap-lens-badge">
          {lens.stocks.length}/{lens.expectedCount}
        </span>
      </div>
      {lens.stocks.length === 0 ? (
        <p className="muted small sector-cap-empty">No stocks listed yet.</p>
      ) : (
        <ul className="sector-cap-stock-list">
          {lens.stocks.map((s) => (
            <li key={`${lens.id}-${s.ticker}`} className="sector-cap-stock-card">
              <div className="sector-cap-stock-head">
                <div className="sector-cap-stock-title">
                  <span className="sector-cap-rank">#{s.rank}</span>
                  <strong>{s.company}</strong>
                </div>
                <span className="sector-cap-ticker">{s.ticker}</span>
              </div>
              {(s.mcapCr != null || s.metric) && (
                <p className="sector-cap-metrics muted small">
                  {s.mcapCr != null && <span>Mcap ₹{s.mcapCr.toLocaleString('en-IN')} cr</span>}
                  {s.mcapCr != null && s.metric && ' · '}
                  {s.metric && <span>{s.metric}</span>}
                </p>
              )}
              {s.reading && <p className="sector-cap-reading">{s.reading}</p>}
              {s.type && <span className="sector-cap-type muted small">{s.type}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function SectorCapTierCardLink({
  slug,
  label,
  score100,
  viewLabel,
  viewEmoji,
  cssBand,
}: {
  slug: string;
  label: string;
  score100: number | null;
  viewLabel: string;
  viewEmoji: string;
  cssBand: string;
}) {
  return (
    <Link
      href={`/industry-analysis/${slug}`}
      className={`sector-score-link-card sector-score-total-${cssBand}`}
    >
      <div className="sector-score-link-head">
        <strong>{label}</strong>
        <span className="sector-score-link-total">
          {score100 != null ? score100 : '—'}
          {score100 != null && <span className="sector-score-link-denom">/100</span>}
        </span>
      </div>
      <p className="sector-score-link-view">
        {viewEmoji} {viewLabel}
      </p>
      <span className="muted small">Large · Mid · Small — 10 stocks per tab (5+5) →</span>
    </Link>
  );
}
