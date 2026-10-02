import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JournalSubNav } from '@/components/JournalSubNav';
import { requireSession } from '@/lib/auth';
import { getAnalysisRecord } from '@/lib/analysis-history';
import { MarkdownView } from '@/components/MarkdownView';
import { ProsePanel } from '@/components/ProsePanel';
import { marketCapBucketLabel } from '@/lib/market-cap';
import { stockbookPath } from '@/lib/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function JournalAnalysisDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await requireSession();
  const entry = await getAnalysisRecord(session.tenantId, id);
  if (!entry) notFound();

  const when = new Date(entry.createdAt).toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  return (
    <div className="page page-prose">
      <Link href="/journal/analysis" className="back-link">
        ← Analysis Log
      </Link>

      <header className="page-header">
        <h1>{entry.stockName ?? entry.ticker ?? 'Analysis'}</h1>
        <p className="muted">
          {when} · {entry.sector} · {marketCapBucketLabel(entry.marketCapBucket)}
          {entry.marketCapCr != null && (
            <> · MCap ₹{entry.marketCapCr.toLocaleString('en-IN')} cr</>
          )}
        </p>
        <div className="analysis-detail-tags">
          {entry.ticker && <span className="tag">{entry.ticker}</span>}
          {entry.verdict && <span className="tag verdict">{entry.verdict}</span>}
          {entry.agentMode && <span className="tag">{entry.agentMode}</span>}
        </div>
        <JournalSubNav />
      </header>

      <ProsePanel>
        <h2>Your question</h2>
        <MarkdownView content={entry.query} />

        <h2 className="mt-section">Framework answer</h2>
        <MarkdownView content={entry.answer} />
      </ProsePanel>

      {entry.stockName && entry.sector && (
        <section className="card">
          <h3>Framework reference (read-only)</h3>
          <p className="muted small">
            Shared StockBook research files — not your personal log.
          </p>
          <Link
            href={stockbookPath(entry.sector, entry.stockName, 'summary')}
            className="card-link"
          >
            Open {entry.stockName} framework files →
          </Link>
        </section>
      )}

      <p className="footer-note muted small">
        Private to {session.email} · ID <code>{entry.id.slice(0, 8)}…</code>
      </p>
    </div>
  );
}
