'use client';

import Link from 'next/link';
import { GordonFairPePanel } from '@/components/GordonFairPePanel';
import { parseEarningsGrowthDefault } from '@/lib/gordon-fair-pe';
import type { PeEvaluationResult } from '@/lib/pe-evaluation';

function fmtPe(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return `${n.toFixed(1)}×`;
}

function fmtInr(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function fmtPct(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return '—';
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toFixed(1)}%`;
}

interface PeParametersBriefProps {
  data: PeEvaluationResult;
  hint?: string;
}

/** PARAMETERS-based PE summary when purchase price/date not supplied. */
export function PeParametersBrief({ data, hint }: PeParametersBriefProps) {
  const growthDefault = parseEarningsGrowthDefault(data.forward.epsCagrBase);

  return (
    <section className="card wide pe-eval-summary">
      <div className="pe-eval-head">
        <div>
          <h2>
            {data.stockName} <span className="muted">({data.ticker})</span>
          </h2>
          <p className="muted small">
            {data.sector} · PARAMETERS read @ CMP
            {data.parametersFile && (
              <>
                {' '}
                · <code>{data.parametersFile}</code>
              </>
            )}
          </p>
        </div>
        <Link href={data.stockbookParametersUrl} className="btn-ghost">
          Open PARAMETERS →
        </Link>
      </div>

      {hint && <p className="muted small calc-full-pe-hint">{hint}</p>}

      <div className="pe-eval-metrics">
        <div className="pe-eval-metric">
          <span className="pe-eval-label">CMP</span>
          <strong>{fmtInr(data.cmp)}</strong>
          <span className="muted small">{data.cmpSource}</span>
        </div>
        <div className="pe-eval-metric">
          <span className="pe-eval-label">TTM P/E</span>
          <strong>{fmtPe(data.ttmPe)}</strong>
        </div>
        <div className="pe-eval-metric">
          <span className="pe-eval-label">Forward P/E</span>
          <strong>{fmtPe(data.forwardPe)}</strong>
        </div>
        <div className="pe-eval-metric">
          <span className="pe-eval-label">10Y avg P/E</span>
          <strong>{fmtPe(data.avg10yPe)}</strong>
          <span className="muted small">Premium {fmtPct(data.premiumTo10yPct)}</span>
        </div>
        <div className="pe-eval-metric">
          <span className="pe-eval-label">5Y fair (framework)</span>
          <strong>{fmtInr(data.framework5yFairPrice)}</strong>
        </div>
      </div>

      <GordonFairPePanel
        currentPe={data.ttmPe ?? data.forwardPe}
        defaultEarningsGrowthPct={growthDefault}
        stockLabel={data.ticker}
      />
    </section>
  );
}
