import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { getPeEvaluationRecord } from '@/lib/pe-evaluation-history';
import { PeScorecardResults } from '@/components/PeScorecardResults';
import { StockCalculatorSubNav } from '@/components/StockCalculatorSubNav';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PeEvaluationDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await requireSession();
  const entry = await getPeEvaluationRecord(
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
    <div className="page page-prose">
      <Link href="/stock-calculator/pe" className="back-link">
        ← PE Evaluation Framework
      </Link>

      <header className="page-header">
        <h1>
          {entry.stockName} ({entry.ticker})
        </h1>
        <p className="muted">
          {when} · {entry.sector} · Bought ₹
          {entry.purchasePrice.toLocaleString('en-IN')} on {entry.purchaseDate}
        </p>
        <div className="analysis-detail-tags">
          <span className="tag">{entry.ticker}</span>
          {entry.cmp != null && (
            <span className="tag">CMP ₹{entry.cmp.toLocaleString('en-IN')}</span>
          )}
          {entry.purchasePe != null && (
            <span className="tag">Purchase {entry.purchasePe.toFixed(1)}× P/E</span>
          )}
          <span className="tag verdict">
            Score {entry.rawScore > 0 ? '+' : ''}
            {entry.rawScore}/8 · {entry.weightedOverall10}/10
          </span>
        </div>
        <StockCalculatorSubNav />
      </header>

      <PeScorecardResults data={entry.scorecard} recordId={entry.id} savedAt={entry.createdAt} />
    </div>
  );
}
