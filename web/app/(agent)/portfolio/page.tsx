import Link from 'next/link';
import { HoldingForm } from '@/components/HoldingForm';
import { HoldingsLotsTable } from '@/components/HoldingsLotsTable';
import { PortfolioDividendRankPanel } from '@/components/PortfolioDividendRankPanel';
import { requireSession, portfolioLotContext } from '@/lib/auth';
import { listLotsWithMetrics, aggregateRows } from '@/lib/holding-lots';
import { getPortfolioDividendRank } from '@/lib/portfolio-dividend-rank';

export default async function PortfolioPage() {
  const session = await requireSession();
  const [lots, dividendRank] = await Promise.all([
    listLotsWithMetrics(session.tenantId, portfolioLotContext(session)),
    getPortfolioDividendRank(session.tenantId, portfolioLotContext(session)),
  ]);
  const summary = aggregateRows(lots);

  return (
    <div className="page">
      <header className="page-header">
        <h1>Portfolio</h1>
        <p className="muted">
          Each purchase is a separate lot (date, qty, price). Same stock bought again adds a new
          row for per-lot CAGR. Sector is assigned from StockBook automatically. Holdings are
          private to your login ({session.email}) — not shared with other users.
        </p>
      </header>

      <HoldingForm />

      <PortfolioDividendRankPanel data={dividendRank} />

      <section className="card wide">
        <div className="section-head">
          <h3>Purchase lots</h3>
          <Link href="/home" className="card-link">
            View dashboard →
          </Link>
        </div>

        <HoldingsLotsTable lots={lots} summaryCount={summary.length} />

        {summary.length > 0 && (
          <div className="holdings-table-wrap summary-block">
            <table className="holdings-table compact">
              <thead>
                <tr>
                  <th>Ticker</th>
                  <th>Company</th>
                  <th>Sector</th>
                  <th>Total qty</th>
                  <th>Blended avg</th>
                  <th>Total cost</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((r) => (
                  <tr key={r.ticker}>
                    <td>
                      <strong>{r.ticker}</strong>
                    </td>
                    <td>{r.company}</td>
                    <td>
                      <span className="tag">{r.holdingsSector}</span>
                    </td>
                    <td>{r.qty}</td>
                    <td>₹{r.avgCost.toLocaleString('en-IN')}</td>
                    <td>₹{r.costBasis.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="footer-note muted small">
        Logged in as <strong>{session.email}</strong>
      </p>
    </div>
  );
}
