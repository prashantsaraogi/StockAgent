import Link from 'next/link';
import { requireSession } from '@/lib/auth';
import { StockCalculatorHub } from '@/components/StockCalculatorHub';
import { StockCalculatorSubNav } from '@/components/StockCalculatorSubNav';
import { listFullAnalysisRecords } from '@/lib/stock-calculator-full-history';
import { STOCK_ANALYSIS_INTRO, STOCK_ANALYSIS_TITLE } from '@/lib/navigation';

export default async function StockCalculatorHubPage() {
  const session = await requireSession();
  const entries = await listFullAnalysisRecords(
    session.tenantId,
    session.userId,
    session.authMode
  );

  return (
    <div className="page">
      <header className="page-header">
        <h1>{STOCK_ANALYSIS_TITLE}</h1>
        <p className="muted">
          {STOCK_ANALYSIS_INTRO} Private to <strong>{session.email}</strong>.{' '}
          <strong>Not linked</strong> to <Link href="/portfolio">Portfolio</Link> lots — use this
          for any name you hold or are researching.
        </p>
        <StockCalculatorSubNav />
      </header>

      <StockCalculatorHub />

      <section className="card wide stock-analysis-history-cta">
        {entries.length === 0 ? (
          <p className="muted">
            No full analysis runs saved on the server yet. Try <strong>Maruti (MARUTI)</strong> —
            sample data exists for all modules. After you run analysis, it appears in history (and
            in this browser until you sign in with cloud save).
          </p>
        ) : (
          <p className="muted">
            You have <strong>{entries.length}</strong> saved full analysis run
            {entries.length !== 1 ? 's' : ''} on your account.
          </p>
        )}
        <p className="stock-analysis-history-link">
          <Link href="/stock-calculator/history" className="btn secondary">
            View all previous Stock Analysis →
          </Link>
        </p>
      </section>
    </div>
  );
}
