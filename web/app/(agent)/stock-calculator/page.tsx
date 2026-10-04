import Link from 'next/link';
import { requireSession } from '@/lib/auth';
import { StockCalculatorHub } from '@/components/StockCalculatorHub';
import { StockCalculatorSubNav } from '@/components/StockCalculatorSubNav';
import { STOCK_ANALYSIS_INTRO, STOCK_ANALYSIS_TITLE } from '@/lib/navigation';

export default async function StockCalculatorHubPage() {
  const session = await requireSession();

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
        <p className="stock-analysis-history-link">
          <Link href="/stock-calculator/history" className="btn secondary">
            View all previous Stock Analysis →
          </Link>
        </p>
      </section>
    </div>
  );
}
