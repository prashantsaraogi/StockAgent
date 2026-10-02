import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { getBusinessQualityRecord } from '@/lib/business-quality-history';
import { BusinessQualityResults } from '@/components/BusinessQualityResults';
import { StockCalculatorSubNav } from '@/components/StockCalculatorSubNav';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BusinessQualityDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await requireSession();
  const entry = await getBusinessQualityRecord(
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
      <Link href="/stock-calculator/business-quality" className="back-link">
        ← Business Quality &amp; Moat
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
          <span className="tag bq-tag-score">{entry.businessQualityScore10}/10</span>
          <span className="tag verdict">{entry.verdict.slice(0, 60)}</span>
        </div>
        <StockCalculatorSubNav />
      </header>

      <BusinessQualityResults
        data={entry.analysis}
        recordId={entry.id}
        savedAt={entry.createdAt}
      />
    </div>
  );
}
