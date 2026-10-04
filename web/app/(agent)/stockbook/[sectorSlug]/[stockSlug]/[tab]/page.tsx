import { notFound } from 'next/navigation';
import Link from 'next/link';
import { resolveStockFromSlugs, readStockTabContent } from '@/lib/content';
import { requireSession } from '@/lib/auth';
import { StockSubNav } from '@/components/StockSubNav';
import { MarkdownView, HtmlReportView } from '@/components/MarkdownView';
import { ProsePanel } from '@/components/ProsePanel';
import { ChatPanel } from '@/components/ChatPanel';
import {
  sanitizeStockbookHtmlForWeb,
  sanitizeStockbookMarkdownForWeb,
} from '@/lib/investor-report-format';
import type { StockbookTabId } from '@/lib/navigation';
import { STOCKBOOK_TABS } from '@/lib/navigation';

interface Props {
  params: Promise<{ sectorSlug: string; stockSlug: string; tab: string }>;
}

export default async function StockDetailPage({ params }: Props) {
  const { sectorSlug, stockSlug, tab } = await params;
  const session = await requireSession();
  const entry = await resolveStockFromSlugs(sectorSlug, stockSlug, session.tenantId);
  if (!entry) notFound();

  const tabId = (STOCKBOOK_TABS.some((t) => t.id === tab) ? tab : 'summary') as StockbookTabId;
  const file = await readStockTabContent(entry.sector, entry.stock, tabId, session.tenantId);

  return (
    <div className="page page-prose stock-detail">
      <Link href="/journal/analysis" className="back-link">
        ← Analysis Log
      </Link>

      <StockSubNav
        sectorSlug={sectorSlug}
        stockSlug={stockSlug}
        activeTab={tabId}
        stockName={entry.stock}
      />

      {entry.ticker && <p className="muted">Ticker: {entry.ticker}</p>}

      <div className="split-layout stock-split">
        <ProsePanel className="stock-content">
          {file ? (
            file.type === 'html' ? (
              <HtmlReportView
                html={sanitizeStockbookHtmlForWeb(file.content)}
                title="Investor report"
              />
            ) : (
              <MarkdownView content={sanitizeStockbookMarkdownForWeb(file.content)} />
            )
          ) : (
            <div className="empty-state">
              <p>
                No <strong>{tabId}</strong> file yet for {entry.stock}.
              </p>
              <p className="muted">
                Chat answers write to dev StockBook; Cursor workflow writes to root StockBook.
              </p>
            </div>
          )}
        </ProsePanel>

        <aside className="chat-sidebar">
          <h3>Ask about {entry.stock}</h3>
          <ChatPanel
            context={{
              ticker: entry.ticker,
              sector: entry.sector,
              stockName: entry.stock,
            }}
          />
        </aside>
      </div>
    </div>
  );
}
