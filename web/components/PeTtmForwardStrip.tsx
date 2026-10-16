'use client';

import type { StockCalculatorFullResult } from '@/lib/stock-calculator-full';
import {
  fmtPeTimes,
  fmtSpreadTimes,
  resolveTtmForwardPeMetrics,
} from '@/lib/pe-ttm-forward-metrics';

interface PeTtmForwardStripProps {
  analysis: StockCalculatorFullResult;
  /** overview = full cards; inline = compact header row */
  variant?: 'overview' | 'inline';
}

export function PeTtmForwardStrip({ analysis, variant = 'overview' }: PeTtmForwardStripProps) {
  const m = resolveTtmForwardPeMetrics(analysis);
  const spread = fmtSpreadTimes(m.spreadTimes);
  const basisNote =
    analysis.inputs.peBasis === 'forward'
      ? 'CAGR projection uses forward P/E anchor'
      : 'CAGR projection uses TTM P/E anchor';

  if (variant === 'inline') {
    return (
      <span className="calc-pe-ttm-fwd-inline">
        TTM P/E <strong>{fmtPeTimes(m.ttmPe)}</strong>
        {' · '}
        Forward P/E <strong>{fmtPeTimes(m.forwardPe)}</strong>
        {m.avg10yPe != null && (
          <>
            {' · '}
            10Y avg <strong>{fmtPeTimes(m.avg10yPe)}</strong>
          </>
        )}
        {spread && <span className="muted"> ({spread})</span>}
      </span>
    );
  }

  return (
    <section className="calc-pe-ttm-fwd-strip" aria-label="TTM vs Forward P/E">
      <div className="calc-pe-ttm-fwd-grid">
        <article className="calc-pe-ttm-fwd-card calc-pe-ttm">
          <span className="pe-eval-label">{m.ttmLabel}</span>
          <strong className="calc-pe-ttm-fwd-value">{fmtPeTimes(m.ttmPe)}</strong>
          <span className="muted small">Trailing · past / rear-view lens</span>
          {m.premiumTtmVs10yPct != null && m.avg10yPe != null && (
            <span className="muted small">
              {m.premiumTtmVs10yPct >= 0 ? '+' : ''}
              {m.premiumTtmVs10yPct.toFixed(1)}% vs 10Y avg
            </span>
          )}
        </article>
        <article className="calc-pe-ttm-fwd-vs" aria-hidden>
          {spread ?? 'vs'}
        </article>
        <article className="calc-pe-ttm-fwd-card calc-pe-fwd">
          <span className="pe-eval-label">{m.forwardLabel}</span>
          <strong className="calc-pe-ttm-fwd-value">{fmtPeTimes(m.forwardPe)}</strong>
          <span className="muted small">Normalized EPS ÷ CMP · future lens</span>
          {m.forwardFairPe != null && (
            <span className="muted small">Fair {fmtPeTimes(m.forwardFairPe)}</span>
          )}
          {m.premiumForwardVsFairPct != null && (
            <span className="muted small">
              {m.premiumForwardVsFairPct >= 0 ? '+' : ''}
              {m.premiumForwardVsFairPct.toFixed(1)}% vs forward fair
            </span>
          )}
        </article>
      </div>
      <p className="muted small calc-pe-ttm-fwd-note">{basisNote}</p>
    </section>
  );
}
