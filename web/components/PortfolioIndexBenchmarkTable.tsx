'use client';

import { useCallback, useEffect, useState } from 'react';
import type { HoldingsIndexTableRow, VsIndexRankRow } from '@/lib/holdings-index-table';
import { PORTFOLIO_HOLDINGS_CHANGED } from '@/lib/portfolio-events';

function formatInr(n: number): string {
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

interface PortfolioIndexBenchmarkTableProps {
  /** Changes when server re-renders after lot add/edit/delete. */
  refreshKey?: string;
}

export function PortfolioIndexBenchmarkTable({ refreshKey = '' }: PortfolioIndexBenchmarkTableProps) {
  const [rows, setRows] = useState<HoldingsIndexTableRow[]>([]);
  const [monthlyWorst, setMonthlyWorst] = useState<VsIndexRankRow[]>([]);
  const [monthlyBest, setMonthlyBest] = useState<VsIndexRankRow[]>([]);
  const [yearlyWorst, setYearlyWorst] = useState<VsIndexRankRow[]>([]);
  const [yearlyBest, setYearlyBest] = useState<VsIndexRankRow[]>([]);
  const [note, setNote] = useState('');
  const [asOf, setAsOf] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [empty, setEmpty] = useState(false);
  const [emptyMessage, setEmptyMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadReport = useCallback(async (silent?: boolean) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError('');
    try {
      const res = await fetch('/api/holdings/index-table', { cache: 'no-store' });
      if (res.status === 401) {
        setError('Please log in to view your portfolio report.');
        return;
      }
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? 'Failed to load');
        return;
      }
      setEmpty(Boolean(data.empty));
      setEmptyMessage(data.message ?? '');
      setRows(data.rows ?? []);
      setMonthlyWorst(data.monthlyWorstVsIndex ?? []);
      setMonthlyBest(data.monthlyBestVsIndex ?? []);
      setYearlyWorst(data.yearlyWorstVsIndex ?? []);
      setYearlyBest(data.yearlyBestVsIndex ?? []);
      setNote(data.indexNote ?? '');
      setAsOf(data.asOf ?? '');
      setUserEmail(data.email ?? '');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadReport();
  }, [loadReport, refreshKey]);

  useEffect(() => {
    const onChange = () => void loadReport(true);
    window.addEventListener(PORTFOLIO_HOLDINGS_CHANGED, onChange);
    return () => window.removeEventListener(PORTFOLIO_HOLDINGS_CHANGED, onChange);
  }, [loadReport]);

  if (loading) {
    return (
      <section className="card wide">
        <p className="muted">Loading your stock vs index report…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="card wide">
        <p className="form-error">{error}</p>
        <button type="button" className="btn-secondary" onClick={() => void loadReport()}>
          Retry
        </button>
      </section>
    );
  }

  if (empty) {
    return (
      <section className="card wide portfolio-index-table-section">
        <h3>Your stock vs index report</h3>
        <p className="muted small">
          {emptyMessage ||
            'Add purchase lots above. This report is private to your login — vs your cost, monthly/yearly move vs sector index, and top-5 lag/lead lists.'}
        </p>
      </section>
    );
  }

  const totalCost = rows.reduce((s, r) => s + r.purchaseCost, 0);
  const totalMv = rows.reduce((s, r) => s + (r.currentValue ?? 0), 0);
  const totalPnl = totalMv - totalCost;
  const totalVsCostPct =
    totalCost > 0 ? Math.round(((totalMv - totalCost) / totalCost) * 1000) / 10 : null;
  const totalVsCostStr =
    totalVsCostPct != null
      ? `${totalVsCostPct >= 0 ? '+' : ''}${totalVsCostPct.toFixed(1)}%`
      : '—';
  const totalPnlStr =
    totalCost > 0 && totalMv > 0
      ? `${totalPnl >= 0 ? '+' : '-'}₹${Math.abs(Math.round(totalPnl)).toLocaleString('en-IN')}`
      : '—';

  const hasRanks =
    monthlyWorst.length > 0 ||
    monthlyBest.length > 0 ||
    yearlyWorst.length > 0 ||
    yearlyBest.length > 0;

  return (
    <section className="card wide portfolio-index-table-section">
      <div className="section-head portfolio-index-report-head">
        <div>
          <h3>Your stock vs index report</h3>
          <p className="muted small">
            Private to {userEmail || 'your account'} · blended lots · live CMP (Yahoo/NSE)
          </p>
          {asOf && (
            <span className="muted small">
              Updated{' '}
              {new Date(asOf).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              {refreshing ? ' · refreshing…' : ''}
            </span>
          )}
        </div>
        <div className="portfolio-index-report-actions">
          <button
            type="button"
            className="btn-secondary"
            disabled={refreshing}
            onClick={() => void loadReport(true)}
          >
            Refresh
          </button>
          <a className="btn-secondary" href="/api/holdings/index-table/export?format=csv">
            Download Excel (CSV)
          </a>
          <a className="btn-secondary" href="/api/holdings/index-table/export?format=html">
            Download HTML
          </a>
        </div>
      </div>

      <div className="portfolio-index-summary-cards">
        <div className="portfolio-index-summary-card">
          <span className="label">Total cost</span>
          <span className="value">{formatInr(totalCost)}</span>
        </div>
        <div className="portfolio-index-summary-card">
          <span className="label">Current value</span>
          <span className="value">{formatInr(totalMv)}</span>
        </div>
        <div className="portfolio-index-summary-card">
          <span className="label">Positions</span>
          <span className="value">{rows.length}</span>
        </div>
        <div className="portfolio-index-summary-card">
          <span className="label">P&amp;L vs cost</span>
          <span className={`value ${totalPnl >= 0 ? 'positive' : 'negative'}`}>
            {totalPnlStr} ({totalVsCostStr})
          </span>
        </div>
      </div>

      {note && <p className="muted small">{note}</p>}
      {hasRanks && (
        <>
          <h4 className="portfolio-rank-section-title">Monthly top 5 vs index (~21 sessions)</h4>
          <div className="portfolio-yearly-rank-grid">
            <RankPanel
              title="Lagging vs index"
              hint="Lowest Stock − Index (pp)."
              rows={monthlyWorst}
              indexCol="Mo index"
              stockCol="Mo stock"
            />
            <RankPanel
              title="Leading vs index"
              hint="Highest Stock − Index (pp)."
              rows={monthlyBest}
              indexCol="Mo index"
              stockCol="Mo stock"
            />
          </div>
          <h4 className="portfolio-rank-section-title">Yearly top 5 vs index (~12M)</h4>
          <div className="portfolio-yearly-rank-grid">
            <RankPanel
              title="Lagging vs index"
              hint="Lowest Stock − Index (pp)."
              rows={yearlyWorst}
              indexCol="Yr index"
              stockCol="Yr stock"
            />
            <RankPanel
              title="Leading vs index"
              hint="Highest Stock − Index (pp)."
              rows={yearlyBest}
              indexCol="Yr index"
              stockCol="Yr stock"
            />
          </div>
        </>
      )}
      <div className="holdings-table-wrap portfolio-index-table-scroll">
        <table className="holdings-table compact portfolio-index-table">
          <thead>
            <tr>
              <th rowSpan={2}>Stock</th>
              <th rowSpan={2}>Index</th>
              <th rowSpan={2}>Qty</th>
              <th rowSpan={2}>Cost</th>
              <th rowSpan={2}>Value</th>
              <th colSpan={4}>Vs cost</th>
              <th colSpan={3}>Monthly</th>
              <th colSpan={3}>Yearly</th>
            </tr>
            <tr>
              <th>Avg</th>
              <th>CMP</th>
              <th>P&L</th>
              <th>Vs cost</th>
              <th>Idx</th>
              <th>Stk</th>
              <th>Stk−Idx</th>
              <th>Idx</th>
              <th>Stk</th>
              <th>Stk−Idx</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.ticker}>
                <td>
                  <strong>{r.stockName}</strong>
                  <span className="muted small"> {r.ticker}</span>
                </td>
                <td>{r.indexCategory}</td>
                <td>{r.qty.toLocaleString('en-IN')}</td>
                <td>{formatInr(r.purchaseCost)}</td>
                <td>{r.currentValue != null ? formatInr(r.currentValue) : '—'}</td>
                <td>{r.avgCostDisplay}</td>
                <td>{r.cmpDisplay}</td>
                <td>{r.unrealizedPnlDisplay}</td>
                <td>{r.vsCostVariation}</td>
                <td>{r.monthlyIndexVariation}</td>
                <td>{r.monthlyStockVariation}</td>
                <td>{r.monthlyStockVsIndex}</td>
                <td>{r.yearlyIndexVariation}</td>
                <td>{r.yearlyStockVariation}</td>
                <td>{r.yearlyStockVsIndex}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function RankPanel({
  title,
  hint,
  rows,
  indexCol,
  stockCol,
}: {
  title: string;
  hint: string;
  rows: VsIndexRankRow[];
  indexCol: string;
  stockCol: string;
}) {
  return (
    <div className="portfolio-yearly-rank-panel card">
      <h4>{title}</h4>
      <p className="muted small">{hint}</p>
      <table className="holdings-table compact">
        <thead>
          <tr>
            <th>#</th>
            <th>Stock</th>
            <th>{indexCol}</th>
            <th>{stockCol}</th>
            <th>Stk−Idx</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={`${title}-${r.ticker}`}>
              <td>{r.rank}</td>
              <td>
                <strong>{r.stockName}</strong>
                <span className="muted small"> {r.ticker}</span>
              </td>
              <td>{r.indexVariation}</td>
              <td>{r.stockVariation}</td>
              <td>{r.stockVsIndex}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
