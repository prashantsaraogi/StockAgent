import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { getEarningsQualityRecord } from '@/lib/earnings-quality-history';
import { EarningsQualityResults } from '@/components/EarningsQualityResults';
import { StockCalculatorSubNav } from '@/components/StockCalculatorSubNav';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EarningsQualityDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await requireSession();
  const entry = await getEarningsQualityRecord(
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
      <Link href="/stock-calculator/earnings-quality" className="back-link">
        ← Earnings Quality
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
          {entry.cmp != null && (
            <span className="tag">CMP ₹{entry.cmp.toLocaleString('en-IN')}</span>
          )}
          {entry.warningCount > 0 && (
            <span className="tag eq-tag-warn">
              {entry.warningCount} warning{entry.warningCount !== 1 ? 's' : ''}
            </span>
          )}
          <span className="tag verdict">{entry.overallVerdict}</span>
        </div>
        <StockCalculatorSubNav />
      </header>

      <EarningsQualityResults
        data={entry.analysis}
        recordId={entry.id}
        savedAt={entry.createdAt}
      />
    </div>
  );
}
