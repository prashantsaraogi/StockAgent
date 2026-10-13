import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { getFullAnalysisRecord } from '@/lib/stock-calculator-full-history';
import { buildAnalysisSummarySlides } from '@/lib/analysis-summary-slides';
import { AnalysisSummaryVideoPlayer } from '@/components/AnalysisSummaryVideoPlayer';
import { STOCK_ANALYSIS_TITLE } from '@/lib/navigation';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ record?: string }>;
}

export default async function AnalysisSummaryVideoPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { record: recordParam } = await searchParams;
  const recordMode = recordParam === '1' || recordParam === 'true';

  const session = await requireSession();
  const entry = await getFullAnalysisRecord(
    session.tenantId,
    id,
    session.userId,
    session.authMode
  );
  if (!entry) notFound();

  const slides = buildAnalysisSummarySlides(entry.analysis);

  return (
    <div className={`page ${recordMode ? 'asv-page-record' : ''}`}>
      {!recordMode && (
        <>
          <Link href={`/stock-calculator/full/${id}`} className="back-link">
            ← Back to full analysis
          </Link>
          <header className="page-header">
            <h1>
              60s summary — {entry.stockName} ({entry.ticker})
            </h1>
            <p className="muted small">
              Built from your saved Stock Analysis run · for YouTube or sharing (screen record)
            </p>
          </header>
        </>
      )}

      <AnalysisSummaryVideoPlayer slides={slides} recordMode={recordMode} />

      {!recordMode && (
        <p className="muted small" style={{ marginTop: '1rem' }}>
          Clean capture URL:{' '}
          <Link href={`/stock-calculator/full/${id}/summary-video?record=1`}>
            /stock-calculator/full/{id.slice(0, 8)}…/summary-video?record=1
          </Link>
          {' · '}
          <Link href="/stock-calculator">{STOCK_ANALYSIS_TITLE}</Link>
        </p>
      )}
    </div>
  );
}
