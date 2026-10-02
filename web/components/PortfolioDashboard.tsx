'use client';

import Link from 'next/link';
import type { PortfolioDashboard } from '@/lib/portfolio-dashboard';
import {
  formatInr,
  formatGainInr,
  formatGainPct,
  formatCagr,
  gainClass,
} from '@/lib/format-gain';
import { cmpSourceLabel } from '@/lib/cmp-labels';
import { stockbookPath } from '@/lib/navigation';

interface PortfolioDashboardProps {
  data: PortfolioDashboard;
}

const CHART_COLORS = [
  '#3b82f6',
  '#22c55e',
  '#f59e0b',
  '#a855f7',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#6366f1',
  '#84cc16',
  '#06b6d4',
];

function BarChart({
  title,
  subtitle,
  rows,
  valueKey,
  formatValue,
  maxValue,
}: {
  title: string;
  subtitle: string;
  rows: PortfolioDashboard['sectors'];
  valueKey: 'stockCount' | 'allocationPct' | 'currentValue';
  formatValue: (n: number) => string;
  maxValue: number;
}) {
  if (rows.length === 0) {
    return (
      <section className="chart-card card">
        <h3>{title}</h3>
        <p className="muted small">{subtitle}</p>
        <p className="muted chart-empty">No holdings yet — add stocks in Portfolio.</p>
      </section>
    );
  }

  return (
    <section className="chart-card card">
      <h3>{title}</h3>
      <p className="muted small">{subtitle}</p>
      <div className="bar-chart" role="img" aria-label={title}>
        {rows.map((row, i) => {
          const value = row[valueKey];
          const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
          const color = CHART_COLORS[i % CHART_COLORS.length];
          return (
            <div className="bar-row" key={row.sector}>
              <span className="bar-label" title={row.sector}>
                {row.sector}
              </span>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: color }}
                />
              </div>
              <span className="bar-value">{formatValue(value)}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function formatCmpAsOf(iso: string | null): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export function PortfolioDashboardCharts({ data }: PortfolioDashboardProps) {
  const maxCount = Math.max(...data.sectors.map((s) => s.stockCount), 1);
  const maxAlloc = 100;
  const maxValue = Math.max(...data.sectors.map((s) => s.currentValue), 1);

  return (
    <div className="dashboard-section">
      <div className="dashboard-stats dashboard-stats-wide">
        <div className="stat-pill">
          <span className="stat-num">{data.totalStocks}</span>
          <span className="stat-lbl">Stocks</span>
        </div>
        <div className="stat-pill">
          <span className="stat-num">{data.totalLots}</span>
          <span className="stat-lbl">Purchase lots</span>
        </div>
        <div className="stat-pill">
          <span className="stat-num">{formatInr(data.totalCostBasis)}</span>
          <span className="stat-lbl">Cost basis</span>
        </div>
        <div className="stat-pill">
          <span className="stat-num">{formatInr(data.totalCurrentValue)}</span>
          <span className="stat-lbl">Current value @ CMP</span>
        </div>
        <div className={`stat-pill highlight ${gainClass(data.absoluteGain)}`}>
          <span className="stat-num">{formatGainInr(data.absoluteGain)}</span>
          <span className="stat-lbl">Absolute gain</span>
        </div>
        <div className={`stat-pill highlight ${gainClass(data.gainPct)}`}>
          <span className={`stat-num ${gainClass(data.gainPct)}`}>
            {formatGainPct(data.gainPct)}
          </span>
          <span className="stat-lbl">Gain %</span>
        </div>
        <div className={`stat-pill highlight ${gainClass(data.overallCagrPct)}`}>
          <span className={`stat-num ${gainClass(data.overallCagrPct)}`}>
            {formatCagr(data.overallCagrPct)}
          </span>
          <span className="stat-lbl">Overall CAGR</span>
        </div>
      </div>

      {data.totalStocks > 0 && (
        <p className="muted small dashboard-note cmp-source-note">
          {data.cmpRefreshNote}
          {data.cmpLivePct < 100 && data.cmpCoveragePct > data.cmpLivePct && (
            <>
              {' '}
              Remaining tickers use StockBook PARAMETERS until NSE symbol resolves.
            </>
          )}
        </p>
      )}

      {data.cmpCoveragePct < 100 && data.totalStocks > 0 && data.cmpLivePct === 0 && (
        <p className="muted small dashboard-note warn-note">
          Could not reach NSE live quotes — showing cost basis or StockBook fallback.
        </p>
      )}

      <div className="chart-grid">
        <BarChart
          title="Stocks by sector"
          subtitle="Number of tickers in each sector"
          rows={data.sectors}
          valueKey="stockCount"
          formatValue={(n) => String(n)}
          maxValue={maxCount}
        />
        <BarChart
          title="Sector allocation"
          subtitle="Share of portfolio current value (%)"
          rows={data.sectors}
          valueKey="allocationPct"
          formatValue={(n) => `${n}%`}
          maxValue={maxAlloc}
        />
        <BarChart
          title="Sector current value"
          subtitle="Market value by sector (₹)"
          rows={data.sectors}
          valueKey="currentValue"
          formatValue={formatInr}
          maxValue={maxValue}
        />
      </div>

      {data.stocks.length > 0 && (
        <section className="card wide stock-detail-section">
          <h3>Holdings detail — gain &amp; CAGR per stock</h3>
          <p className="muted small">
            Each stock shows blended totals and every purchase lot. CAGR is annualized from
            buy date to CMP (CAGR-FRAMEWORK).
          </p>

          <div className="stock-detail-list">
            {data.stocks.map((stock) => (
              <article key={stock.ticker} className="stock-detail-card">
                <header className="stock-detail-head">
                  <div>
                    <Link href={stockbookPath(stock.sector, stock.company, 'summary')}>
                      <strong className="stock-ticker">{stock.ticker}</strong>
                    </Link>
                    <span className="stock-name">{stock.company}</span>
                    <span className="tag">{stock.sector}</span>
                    {stock.lotCount > 1 && (
                      <span className="tag">{stock.lotCount} lots</span>
                    )}
                  </div>
                  <div className="stock-detail-metrics">
                    <div>
                      <span className="metric-lbl">Allocation</span>
                      <span className="metric-val">{stock.allocationPct}%</span>
                    </div>
                    <div>
                      <span className="metric-lbl">CMP</span>
                      <span className="metric-val">
                        {stock.cmp != null ? formatInr(stock.cmp) : '—'}
                      </span>
                      {stock.cmpSource && (
                        <span className="metric-sub muted small">
                          {cmpSourceLabel(stock.cmpSource)}
                          {stock.cmpAsOf ? ` · ${formatCmpAsOf(stock.cmpAsOf)}` : ''}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="metric-lbl">Gain</span>
                      <span className={`metric-val ${gainClass(stock.absoluteGain)}`}>
                        {formatGainInr(stock.absoluteGain)}
                      </span>
                    </div>
                    <div>
                      <span className="metric-lbl">Gain %</span>
                      <span className={`metric-val ${gainClass(stock.gainPct)}`}>
                        {formatGainPct(stock.gainPct)}
                      </span>
                    </div>
                    <div>
                      <span className="metric-lbl">CAGR</span>
                      <span className={`metric-val ${gainClass(stock.cagrPct)}`}>
                        {formatCagr(stock.cagrPct)}
                      </span>
                    </div>
                  </div>
                </header>

                <div className="stock-summary-row">
                  <span>{stock.qty} sh</span>
                  <span>Avg ₹{stock.avgCost.toLocaleString('en-IN')}</span>
                  <span>Cost {formatInr(stock.costBasis)}</span>
                  <span>Value {formatInr(stock.currentValue)}</span>
                </div>

                <div className="holdings-table-wrap">
                  <table className="holdings-table compact lot-detail-table">
                    <thead>
                      <tr>
                        <th>Buy date</th>
                        <th>Qty</th>
                        <th>Buy price</th>
                        <th>Cost</th>
                        <th>CMP value</th>
                        <th>Gain ₹</th>
                        <th>Gain %</th>
                        <th>Years</th>
                        <th>CAGR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stock.lots.map((lot) => (
                        <tr key={lot.id} className={lot.legacy ? 'legacy-lot' : undefined}>
                          <td>
                            {lot.purchaseDate}
                            {lot.legacy && <span className="tag warn">legacy</span>}
                          </td>
                          <td>{lot.qty}</td>
                          <td>₹{lot.price.toLocaleString('en-IN')}</td>
                          <td>₹{lot.costBasis.toLocaleString('en-IN')}</td>
                          <td>₹{lot.currentValue.toLocaleString('en-IN')}</td>
                          <td className={gainClass(lot.absoluteGain)}>
                            {formatGainInr(lot.absoluteGain)}
                          </td>
                          <td className={gainClass(lot.gainPct)}>
                            {formatGainPct(lot.gainPct)}
                          </td>
                          <td>{lot.holdingYears != null ? lot.holdingYears.toFixed(2) : '—'}</td>
                          <td className={gainClass(lot.cagrPct)}>{formatCagr(lot.cagrPct)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
