import Link from 'next/link';
import { JournalSubNav } from '@/components/JournalSubNav';
import { listNewsArchive, formatNewsDayLabel, newsDatePath } from '@/lib/news-archive';

export default async function JournalNewsPage() {
  const archive = await listNewsArchive();
  const totalDays = archive.reduce((s, y) => s + y.totalDays, 0);

  return (
    <div className="page">
      <header className="page-header">
        <h1>Journal</h1>
        <p className="muted">
          Daily market intel and your Ask Agent history — browse by{' '}
          <strong>year → month → date</strong>.
        </p>
        <JournalSubNav />
      </header>

      <div className="journal-section-intro card wide">
        <h2 className="journal-section-title">Daily News</h2>
        <p className="muted small">
          Dated macro and portfolio headlines from <code>News/YYYY-MM/DD/summary.md</code>.
          Refresh via <Link href="/services">Services → News today</Link>.
        </p>
      </div>

      {archive.length === 0 ? (
        <section className="card wide">
          <p className="muted">
            No dated summaries yet. Run news from <Link href="/services">Services</Link> or{' '}
            <Link href="/chat">Ask Agent</Link>.
          </p>
        </section>
      ) : (
        <>
          <p className="muted small analysis-log-summary">
            <strong>{totalDays}</strong> daily summaries ·{' '}
            <strong>{archive.length}</strong> year{archive.length !== 1 ? 's' : ''}
          </p>

          <div className="history-timeline">
            {archive.map((yearGroup) => (
              <section key={yearGroup.year} className="card wide history-year-block">
                <h2 className="history-year">{yearGroup.year}</h2>
                <p className="muted small">{yearGroup.totalDays} days</p>

                {yearGroup.months.map((monthGroup) => (
                  <div
                    key={`${yearGroup.year}-${monthGroup.month}`}
                    className="history-month-block"
                  >
                    <h3>{monthGroup.monthLabel}</h3>

                    {monthGroup.days.map((day) => (
                      <div key={day.date} className="history-day-block">
                        <Link
                          href={newsDatePath(day.year, day.month, day.day)}
                          className="news-day-link"
                        >
                          <h4 className="history-day">{formatNewsDayLabel(day)}</h4>
                          <p className="news-day-title">{day.title}</p>
                          {day.preview && (
                            <p className="muted small news-day-preview">{day.preview}…</p>
                          )}
                        </Link>
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
