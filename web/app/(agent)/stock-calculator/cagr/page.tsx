import Link from 'next/link';
import { requireSession } from '@/lib/auth';
import { listCalculatorRecords, groupCalculatorByDate } from '@/lib/stock-calculator-history';
import { StockCalculatorForm } from '@/components/StockCalculatorForm';
import { StockCalculatorSubNav } from '@/components/StockCalculatorSubNav';

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

function peBasisLabel(basis: string): string {
  return basis === 'forward' ? 'Forward P/E' : 'TTM P/E';
}

export default async function CagrEvaluationPage() {
  const session = await requireSession();
  const entries = await listCalculatorRecords(
    session.tenantId,
    session.userId,
    session.authMode
  );
  const timeline = groupCalculatorByDate(entries);

  return (
    <div className="page">
      <header className="page-header">
        <h1>Stock Calculator</h1>
        <p className="muted">
          Framework-backed what-if tools — private to <strong>{session.email}</strong>.{' '}
          <strong>Not linked</strong> to <Link href="/portfolio">Portfolio</Link> holdings.
        </p>
        <StockCalculatorSubNav />
      </header>

      <div className="journal-section-intro card wide">
        <h2 className="journal-section-title">CAGR Evaluation</h2>
        <p className="muted small">
          Project exit value from expected CAGR, anchor P/E, and framework quality / risk haircuts.
          For all six modules at once, use{' '}
          <Link href="/stock-calculator">Full Analysis</Link>. History: year → month → date (IST).
        </p>
      </div>

      <StockCalculatorForm />

      {entries.length === 0 ? (
        <section className="card wide">
          <p className="muted">
            No calculator runs yet. Enter a stock above — history appears here by date.
          </p>
        </section>
      ) : (
        <>
          <h2 className="section-heading">Calculation history</h2>
          <p className="muted small analysis-log-summary">
            <strong>{entries.length}</strong> run{entries.length !== 1 ? 's' : ''} ·{' '}
            <strong>{timeline.length}</strong> year{timeline.length !== 1 ? 's' : ''}
          </p>

          <div className="history-timeline">
            {timeline.map((yearGroup) => (
              <section key={yearGroup.year} className="card wide history-year-block">
                <h2 className="history-year">{yearGroup.year}</h2>
                <p className="muted small">{yearGroup.totalItems} calculations</p>

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
                                href={`/stock-calculator/cagr/${entry.id}`}
                                className="analysis-log-item"
                              >
                                <span className="analysis-log-when">
                                  {formatTime(entry.createdAt)} IST
                                </span>
                                <span className="analysis-log-main">
                                  <strong className="analysis-log-title">
                                    {entry.stockName}
                                  </strong>
                                  <span className="tag">{entry.ticker}</span>
                                  <span className="tag">{entry.sector}</span>
                                  <span className="tag">{peBasisLabel(entry.peBasis)}</span>
                                  <span className="tag">
                                    {entry.expectedCagrPct}% · {entry.years}Y
                                  </span>
                                  {entry.manualPeOverride != null && (
                                    <span className="tag warn">PE {entry.manualPeOverride}×</span>
                                  )}
                                  {entry.investmentAmountInr != null && (
                                    <span className="tag">
                                      ₹{Math.round(entry.investmentAmountInr).toLocaleString('en-IN')}
                                    </span>
                                  )}
                                </span>
                                <span className="analysis-log-query muted">
                                  CMP ₹{entry.cmp.toLocaleString('en-IN')} ·{' '}
                                  {entry.impliedVerdict.slice(0, 80)}
                                  {entry.impliedVerdict.length > 80 ? '…' : ''}
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
