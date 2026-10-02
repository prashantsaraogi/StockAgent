import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { getRiskDecisionRecord } from '@/lib/risk-decision-history';
import { RiskDecisionResults } from '@/components/RiskDecisionResults';
import { StockCalculatorSubNav } from '@/components/StockCalculatorSubNav';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RiskDecisionDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await requireSession();
  const entry = await getRiskDecisionRecord(
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
      <Link href="/stock-calculator/risk-decision" className="back-link">
        ← Risk &amp; Decision
      </Link>

      <header className="page-header">
        <h1>
          {entry.stockName} ({entry.ticker})
        </h1>
        <p className="muted">{when}</p>
        <div className="analysis-detail-tags">
          <span className="tag rd-tag-score">{entry.quantitativeScore100}/100</span>
          <span className="tag verdict">{entry.investmentVerdict}</span>
        </div>
        <StockCalculatorSubNav />
      </header>

      <RiskDecisionResults data={entry.analysis} recordId={entry.id} savedAt={entry.createdAt} />
    </div>
  );
}
