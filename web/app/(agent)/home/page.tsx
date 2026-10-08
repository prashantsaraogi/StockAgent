import Link from 'next/link';
import { PortfolioDashboardCharts } from '@/components/PortfolioDashboard';
import { getPortfolioDashboard } from '@/lib/portfolio-dashboard';
import { requireSession, portfolioLotContext } from '@/lib/auth';

export default async function HomePage() {
  const session = await requireSession();
  const dashboard = await getPortfolioDashboard(
    session.tenantId,
    portfolioLotContext(session)
  );

  return (
    <div className="page">
      <header className="page-header">
        <h1>Dashboard</h1>
        <p className="muted">
          Portfolio gain vs CMP — absolute &amp; percentage, overall CAGR, and per-stock lot
          detail.
        </p>
      </header>

      <div className="card-grid dashboard-actions">
        <section className="card">
          <h3>Add holding</h3>
          <p className="muted small">Each buy = separate lot for CAGR.</p>
          <Link href="/portfolio" className="btn-primary card-btn">
            Open Portfolio →
          </Link>
        </section>
        <section className="card">
          <h3>Stock Analysis</h3>
          <p className="muted small">Basic or advanced — investment report and six modules.</p>
          <Link href="/stock-calculator" className="card-link">
            Analyze a stock →
          </Link>
        </section>
        <section className="card">
          <h3>Resources &amp; Playbook</h3>
          <p className="muted small">Journal, services, wisdom, help, and prompts.</p>
          <Link href="/resources" className="card-link">
            Open hub →
          </Link>
        </section>
      </div>

      <PortfolioDashboardCharts data={dashboard} />
    </div>
  );
}
