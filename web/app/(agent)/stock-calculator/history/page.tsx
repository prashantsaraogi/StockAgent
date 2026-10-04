import Link from 'next/link';
import { requireSession } from '@/lib/auth';
import { StockCalculatorSubNav } from '@/components/StockCalculatorSubNav';
import { FullAnalysisHistoryView } from '@/components/FullAnalysisHistoryView';
import { listFullAnalysisRecords } from '@/lib/stock-calculator-full-history';
import { STOCK_ANALYSIS_INTRO, STOCK_ANALYSIS_TITLE } from '@/lib/navigation';

export default async function StockAnalysisHistoryPage() {
  const session = await requireSession();
  const entries = await listFullAnalysisRecords(
    session.tenantId,
    session.userId,
    session.authMode
  );

  return (
    <div className="page">
      <header className="page-header">
        <h1>{STOCK_ANALYSIS_TITLE} — History</h1>
        <p className="muted">
          {STOCK_ANALYSIS_INTRO} Saved full analyses for <strong>{session.email}</strong>. Click a
          run to open detail; use <strong>Refresh</strong> on the detail page to re-fetch live
          data.
        </p>
        <StockCalculatorSubNav />
      </header>

      <p className="muted small">
        <Link href="/stock-calculator">← Back to Analyze</Link>
      </p>

      <FullAnalysisHistoryView serverEntries={entries} />
    </div>
  );
}
