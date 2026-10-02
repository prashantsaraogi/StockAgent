import Link from 'next/link';
import { requireSession } from '@/lib/auth';
import { StockCalculatorHub } from '@/components/StockCalculatorHub';
import { StockCalculatorSubNav } from '@/components/StockCalculatorSubNav';
import { groupFullAnalysisByDate, listFullAnalysisRecords } from '@/lib/stock-calculator-full-history';

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

export default async function StockCalculatorHubPage() {
  const session = await requireSession();
  const entries = await listFullAnalysisRecords(
    session.tenantId,
    session.userId,
    session.authMode
  );
  const timeline = groupFullAnalysisByDate(entries);

  return (
    <div className="page">
      <header className="page-header">
        <h1>Stock Calculator</h1>
        <p className="muted">
          One stock · six framework modules — private to <strong>{session.email}</strong>.{' '}
          <strong>Not linked</strong> to <Link href="/portfolio">Portfolio</Link> holdings.
        </p>
        <StockCalculatorSubNav />
      </header>

      <div className="journal-section-intro card wide">
        <h2 className="journal-section-title">Full analysis</h2>
        <p className="muted small">
          Enter the stock once below. We run <strong>CAGR</strong>, <strong>PE</strong>,{' '}
          <strong>Earnings Quality</strong>, <strong>Margin</strong>,{' '}
          <strong>Business Quality &amp; Moat</strong>, and <strong>Risk &amp; Decision</strong> in
          parallel and show tabbed results. Individual sub-tabs remain for single-module history.
        </p>
      </div>

      <StockCalculatorHub />

      {entries.length === 0 ? (
        <section className="card wide">
          <p className="muted">
            No full analysis runs yet. Try <strong>Maruti (MARUTI)</strong> — sample data exists for
            all modules.
          </p>
        </section>
      ) : (
        <>
          <h2 className="section-heading">Full analysis history</h2>
          <p className="muted small analysis-log-summary">
            <strong>{entries.length}</strong> run{entries.length !== 1 ? 's' : ''} ·{' '}
            <strong>{timeline.length}</strong> year{timeline.length !== 1 ? 's' : ''}
          </p>

          <div className="history-timeline">
            {timeline.map((yearGroup) => (
              <section key={yearGroup.year} className="card wide history-year-block">
                <h2 className="history-year">{yearGroup.year}</h2>
                <p className="muted small">{yearGroup.totalItems} full analyses</p>

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
                                href={`/stock-calculator/full/${entry.id}`}
                                className="analysis-log-item"
                              >
                                <span className="analysis-log-when">
                                  {formatTime(entry.createdAt)} IST
                                </span>
                                <span className="analysis-log-main">
                                  <strong className="analysis-log-title">{entry.stockName}</strong>
                                  <span className="tag">{entry.ticker}</span>
                                  <span className="tag">{entry.sector}</span>
                                  <span className="tag">
                                    {entry.expectedCagrPct}% · {entry.years}Y
                                  </span>
                                  {entry.cmp != null && (
                                    <span className="tag">
                                      CMP ₹{entry.cmp.toLocaleString('en-IN')}
                                    </span>
                                  )}
                                </span>
                                <span className="analysis-log-query muted">
                                  {entry.overviewVerdict.slice(0, 90)}
                                  {entry.overviewVerdict.length > 90 ? '…' : ''}
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
