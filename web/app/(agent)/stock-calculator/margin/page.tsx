import Link from 'next/link';
import { requireSession } from '@/lib/auth';
import { readRepoMarkdown } from '@/lib/content';
import { MarkdownView } from '@/components/MarkdownView';
import { MarginAnalysisPanel } from '@/components/MarginAnalysisPanel';
import { StockCalculatorSubNav } from '@/components/StockCalculatorSubNav';
import { groupMarginByDate, listMarginRecords } from '@/lib/margin-history';

function clipFrameworkIntro(md: string): string {
  const lines = md.split('\n');
  const end = lines.findIndex((l, i) => i > 15 && /^## Four parts/.test(l));
  const slice = end > 0 ? lines.slice(0, end) : lines.slice(0, 40);
  return slice.join('\n').trim();
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata',
    });
  } catch {
    return '';
  }
}

export default async function MarginAnalysisPage() {
  const session = await requireSession();
  const frameworkMd =
    (await readRepoMarkdown('StockBook/MARGIN-FRAMEWORK.md')) ??
    '# Margin Analysis\n\nFramework file not found in repo.';

  const entries = await listMarginRecords(session.tenantId, session.userId, session.authMode);
  const timeline = groupMarginByDate(entries);

  return (
    <div className="page page-prose">
      <header className="page-header">
        <h1>Stock Calculator</h1>
        <p className="muted">
          Margin Analysis — private to <strong>{session.email}</strong>. Each run saved to your
          history.
        </p>
        <StockCalculatorSubNav />
      </header>

      <div className="journal-section-intro card wide">
        <h2 className="journal-section-title">📊 Margin Analysis</h2>
        <p className="muted small">
          Parts: <strong>A 5Y margin history</strong> · <strong>B Today vs 10Y</strong> ·{' '}
          <strong>C Drivers &amp; pass-through</strong> · <strong>D Quarterly trend</strong>.
        </p>
      </div>

      <section className="card wide sector-framework-ref">
        <h2>Framework reference</h2>
        <p className="muted small">
          From <code>StockBook/MARGIN-FRAMEWORK.md</code>
        </p>
        <MarkdownView content={clipFrameworkIntro(frameworkMd)} />
      </section>

      <MarginAnalysisPanel />

      {entries.length === 0 ? (
        <section className="card wide">
          <p className="muted">
            No margin runs yet. Try <strong>Maruti (MARUTI)</strong> — sample shows Q1 FY27 volume
            ↑ margin ↓ pass-through failure.
          </p>
        </section>
      ) : (
        <>
          <h2 className="section-heading">Analysis history</h2>
          <p className="muted small analysis-log-summary">
            <strong>{entries.length}</strong> run{entries.length !== 1 ? 's' : ''} ·{' '}
            <strong>{timeline.length}</strong> year{timeline.length !== 1 ? 's' : ''}
          </p>

          <div className="history-timeline">
            {timeline.map((yearGroup) => (
              <section key={yearGroup.year} className="card wide history-year-block">
                <h2 className="history-year">{yearGroup.year}</h2>
                <p className="muted small">{yearGroup.totalItems} analyses</p>

                {yearGroup.months.map((monthGroup) => (
                  <div
                    key={`${yearGroup.year}-${monthGroup.month}`}
                    className="history-month-block"
                  >
                    <h3>{monthGroup.monthLabel}</h3>

                    {monthGroup.days.map((dayGroup) => (
                      <div key={dayGroup.date} className="history-day-block">
                        <h4 className="history-day">{dayGroup.dayLabel}</h4>
                        <ul className="analysis-log-list">
                          {dayGroup.items.map((entry) => (
                            <li key={entry.id}>
                              <Link
                                href={`/stock-calculator/margin/${entry.id}`}
                                className="analysis-log-item"
                              >
                                <span className="analysis-log-when">
                                  {formatTime(entry.createdAt)} IST
                                </span>
                                <span className="analysis-log-main">
                                  <strong className="analysis-log-title">{entry.stockName}</strong>
                                  <span className="tag">{entry.ticker}</span>
                                  <span className="tag">{entry.sector}</span>
                                  {entry.warningCount > 0 && (
                                    <span className="tag eq-tag-warn">
                                      {entry.warningCount} warning
                                      {entry.warningCount !== 1 ? 's' : ''}
                                    </span>
                                  )}
                                  {entry.ebitdaDeltaPp != null && (
                                    <span className="tag">
                                      EBITDA Δ {entry.ebitdaDeltaPp > 0 ? '+' : ''}
                                      {entry.ebitdaDeltaPp} pp
                                    </span>
                                  )}
                                  {entry.cmp != null && (
                                    <span className="tag">
                                      CMP ₹{entry.cmp.toLocaleString('en-IN')}
                                    </span>
                                  )}
                                </span>
                                <span className="analysis-log-query muted">
                                  {entry.verdict.slice(0, 90)}
                                  {entry.verdict.length > 90 ? '…' : ''}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ))}
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
