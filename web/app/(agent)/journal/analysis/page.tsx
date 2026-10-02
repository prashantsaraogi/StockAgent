import Link from 'next/link';
import { JournalSubNav } from '@/components/JournalSubNav';
import { requireSession } from '@/lib/auth';
import { listAnalysisRecords, groupAnalysisByDate } from '@/lib/analysis-history';
import { marketCapBucketLabel } from '@/lib/market-cap';

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

export default async function JournalAnalysisPage() {
  const session = await requireSession();
  const entries = await listAnalysisRecords(session.tenantId);
  const timeline = groupAnalysisByDate(entries);

  return (
    <div className="page">
      <header className="page-header">
        <h1>Journal</h1>
        <p className="muted">
          Daily market intel and your Ask Agent history — private to{' '}
          <strong>{session.email}</strong>. Browsed by{' '}
          <strong>year → month → date</strong> (IST).
        </p>
        <JournalSubNav />
      </header>

      <div className="journal-section-intro card wide">
        <h2 className="journal-section-title">Analysis Log</h2>
        <p className="muted small">
          Each Ask Agent Q&amp;A saved by date. Holdings and lots stay in{' '}
          <Link href="/portfolio">Portfolio</Link>.
        </p>
      </div>

      <div className="card-grid dashboard-actions">
        <section className="card">
          <h3>Ask Agent</h3>
          <p className="muted small">Each Q&amp;A is saved to this timeline.</p>
          <Link href="/chat" className="btn-primary card-btn">
            Ask a question →
          </Link>
        </section>
        <section className="card">
          <h3>Portfolio</h3>
          <p className="muted small">Lots, CAGR, edits — separate tab.</p>
          <Link href="/portfolio" className="card-link">
            Open Portfolio →
          </Link>
        </section>
      </div>

      {entries.length === 0 ? (
        <section className="card wide">
          <p className="muted">
            No analyses yet. Use <Link href="/chat">Ask Agent</Link> — history appears here
            by date.
          </p>
        </section>
      ) : (
        <>
          <p className="muted small analysis-log-summary">
            <strong>{entries.length}</strong> analyses ·{' '}
            <strong>{timeline.length}</strong> year{timeline.length !== 1 ? 's' : ''}
          </p>

          <div className="history-timeline">
            {timeline.map((yearGroup) => (
              <section key={yearGroup.year} className="card wide history-year-block">
                <h2 className="history-year">{yearGroup.year}</h2>
                <p className="muted small">{yearGroup.totalItems} analyses</p>

                {yearGroup.months.map((monthGroup) => (
                  <div key={`${yearGroup.year}-${monthGroup.month}`} className="history-month-block">
                    <h3>{monthGroup.monthLabel}</h3>

                    {monthGroup.days.map((dayGroup) => (
                      <div key={dayGroup.date} className="history-day-block">
                        <h4 className="history-day">{dayGroup.dayLabel}</h4>
                        <ul className="analysis-log-list">
                          {dayGroup.items.map((entry) => (
                            <li key={entry.id}>
                              <Link
                                href={`/journal/analysis/${entry.id}`}
                                className="analysis-log-item"
                              >
                                <span className="analysis-log-when">
                                  {formatTime(entry.createdAt)} IST
                                </span>
                                <span className="analysis-log-main">
                                  <strong className="analysis-log-title">
                                    {entry.stockName ?? entry.ticker ?? 'General query'}
                                  </strong>
                                  {entry.ticker && <span className="tag">{entry.ticker}</span>}
                                  <span className="tag">{entry.sector}</span>
                                  <span className="tag">
                                    {marketCapBucketLabel(entry.marketCapBucket)}
                                  </span>
                                  {entry.verdict && (
                                    <span className="tag verdict">{entry.verdict}</span>
                                  )}
                                </span>
                                <span className="analysis-log-query muted">{entry.query}</span>
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
