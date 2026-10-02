import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { getMarginRecord } from '@/lib/margin-history';
import { MarginAnalysisResults } from '@/components/MarginAnalysisResults';
import { StockCalculatorSubNav } from '@/components/StockCalculatorSubNav';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MarginDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await requireSession();
  const entry = await getMarginRecord(session.tenantId, id, session.userId, session.authMode);
  if (!entry) notFound();

  const when = new Date(entry.createdAt).toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  return (
    <div className="page page-prose">
      <Link href="/stock-calculator/margin" className="back-link">
        ← Margin Analysis
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
          {entry.ebitdaDeltaPp != null && (
            <span className="tag">EBITDA Δ {entry.ebitdaDeltaPp > 0 ? '+' : ''}{entry.ebitdaDeltaPp} pp</span>
          )}
          <span className="tag verdict">{entry.verdict.slice(0, 60)}</span>
        </div>
        <StockCalculatorSubNav />
      </header>

      <MarginAnalysisResults data={entry.analysis} recordId={entry.id} savedAt={entry.createdAt} />
    </div>
  );
}
