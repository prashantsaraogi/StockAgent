import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { getFullAnalysisRecord } from '@/lib/stock-calculator-full-history';
import { StockCalculatorFullResults } from '@/components/StockCalculatorFullResults';
import { StockCalculatorSubNav } from '@/components/StockCalculatorSubNav';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function FullAnalysisDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await requireSession();
  const entry = await getFullAnalysisRecord(
    session.tenantId,
    id,
    session.userId,
    session.authMode
  );
  if (!entry) notFound();

  const when = new Date(entry.createdAt).toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  return (
    <div className="page">
      <Link href="/stock-calculator" className="back-link">
        ← Stock Calculator
      </Link>

      <header className="page-header">
        <h1>
          {entry.stockName} ({entry.ticker})
        </h1>
        <p className="muted">
          Full analysis · {when} · {entry.sector}
        </p>
        <StockCalculatorSubNav />
      </header>

      <StockCalculatorFullResults
        analysis={entry.analysis}
        fullRecordId={entry.id}
        childIds={entry.childIds}
        savedAt={entry.createdAt}
      />
    </div>
  );
}
