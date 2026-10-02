import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { getPegRecord } from '@/lib/peg-history';
import { PegEvaluationResults } from '@/components/PegEvaluationResults';
import { StockCalculatorSubNav } from '@/components/StockCalculatorSubNav';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PegDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await requireSession();
  const entry = await getPegRecord(session.tenantId, id, session.userId, session.authMode);
  if (!entry) notFound();

  const when = new Date(entry.createdAt).toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  return (
    <div className="page page-prose">
      <Link href="/stock-calculator/peg" className="back-link">
        ← PEG Evaluation
      </Link>

      <header className="page-header">
        <h1>
          {entry.stockName} ({entry.ticker})
        </h1>
        <p className="muted">
          {when} · {entry.sector}
        </p>
        <div className="analysis-detail-tags">
          <span className="tag">{entry.ticker}</span>
          <span className="tag">{entry.totalScore100}/100</span>
          {entry.pegRatio != null && <span className="tag">PEG {entry.pegRatio.toFixed(2)}×</span>}
          {entry.cmp != null && (
            <span className="tag">CMP ₹{entry.cmp.toLocaleString('en-IN')}</span>
          )}
          <span className="tag verdict">{entry.verdict.slice(0, 60)}</span>
        </div>
        <StockCalculatorSubNav />
      </header>

      <PegEvaluationResults data={entry.analysis} recordId={entry.id} savedAt={entry.createdAt} />
    </div>
  );
}
