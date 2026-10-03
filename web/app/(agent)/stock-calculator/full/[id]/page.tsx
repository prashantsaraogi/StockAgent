import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { getFullAnalysisRecord } from '@/lib/stock-calculator-full-history';
import {
  StockCalculatorFullResults,
  type FullResultTabId,
} from '@/components/StockCalculatorFullResults';
import { StockCalculatorSubNav } from '@/components/StockCalculatorSubNav';
import { STOCK_ANALYSIS_TITLE } from '@/lib/navigation';

const VALID_TABS = new Set<FullResultTabId>([
  'framework',
  'overview',
  'cagr',
  'pe',
  'earnings-quality',
  'margin',
  'business-quality',
  'risk',
]);

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function FullAnalysisDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { tab } = await searchParams;
  const initialTab =
    tab && VALID_TABS.has(tab as FullResultTabId) ? (tab as FullResultTabId) : undefined;
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
        ← {STOCK_ANALYSIS_TITLE}
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
        initialTab={initialTab}
        preferFrameworkTab={entry.analysis.basicAnalysis ?? Boolean(entry.analysis.frameworkReport)}
      />
    </div>
  );
}
