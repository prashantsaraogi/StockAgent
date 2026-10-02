'use client';

import { useState } from 'react';
import type { DividendRankRow } from '@/lib/portfolio-dividend-rank';

export type DividendTableVariant = 'yoc' | 'absolute' | 'cmp';

const INITIAL_ROWS = 1;

function formatInr(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`;
}

function formatPct(n: number): string {
  return `~${n.toFixed(1)}%`;
}

interface Props {
  tableId: string;
  title: string;
  subtitle: string;
  rows: DividendRankRow[];
  variant: DividendTableVariant;
}

export function DividendRankTable({ tableId, title, subtitle, rows, variant }: Props) {
  const [expanded, setExpanded] = useState(false);
  const visibleRows = expanded ? rows : rows.slice(0, INITIAL_ROWS);
  const hiddenCount = Math.max(0, rows.length - INITIAL_ROWS);

  if (rows.length === 0) {
    return (
      <section className="card dividend-rank-card">
        <h3>{title}</h3>
        <p className="muted small">{subtitle}</p>
        <p className="muted">No dividend data for current holdings.</p>
      </section>
    );
  }

  return (
    <section className="card dividend-rank-card">
      <h3>{title}</h3>
      <p className="muted small">{subtitle}</p>
      <div className="holdings-table-wrap">
        <table className="holdings-table compact">
          <thead>
            <tr>
              <th>#</th>
              <th>Ticker</th>
              {variant === 'cmp' && <th>CMP</th>}
              {variant !== 'cmp' && <th>Qty</th>}
              {variant === 'yoc' && <th>Avg cost</th>}
              {variant === 'absolute' && <th>Avg cost</th>}
              <th>FY26 div/sh</th>
              {variant === 'yoc' && <th>YoC</th>}
              {variant === 'cmp' && <th>Div yield @ CMP</th>}
              {variant === 'cmp' && <th>YoC</th>}
              {variant === 'absolute' && <th>YoC</th>}
              <th>Annual div ₹</th>
              {variant === 'absolute' && <th>Why YoC low</th>}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((r) => (
              <tr key={`${tableId}-${r.ticker}`}>
                <td>{r.rank}</td>
                <td>
                  <strong>{r.ticker}</strong>
                  <div className="muted small">{r.company}</div>
                </td>
                {variant === 'cmp' && (
                  <td>{r.cmp != null ? formatInr(r.cmp) : '—'}</td>
                )}
                {variant !== 'cmp' && <td>{r.qty.toLocaleString('en-IN')}</td>}
                {variant !== 'cmp' && <td>{formatInr(r.avgCost)}</td>}
                <td>{formatInr(r.fy26DivPerShare)}</td>
                {variant === 'yoc' && (
                  <td>
                    <strong>{formatPct(r.yocPct)}</strong>
                  </td>
                )}
                {variant === 'cmp' && (
                  <td>
                    <strong>
                      {r.divYieldCmpPct != null ? formatPct(r.divYieldCmpPct) : '—'}
                    </strong>
                  </td>
                )}
                {variant === 'cmp' && (
                  <td className="muted">{formatPct(r.yocPct)}</td>
                )}
                {variant === 'absolute' && (
                  <td>{formatPct(r.yocPct)}</td>
                )}
                <td>{formatInr(r.annualDivInr)}</td>
                {variant === 'absolute' && <td className="small">{r.note ?? '—'}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hiddenCount > 0 && (
        <button
          type="button"
          className="dividend-rank-toggle"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          {expanded ? 'Show less' : `Show ${hiddenCount} more row${hiddenCount === 1 ? '' : 's'}`}
        </button>
      )}
    </section>
  );
}
