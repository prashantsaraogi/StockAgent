import Link from 'next/link';
import { requireSession } from '@/lib/auth';
import { PeEvaluationPanel } from '@/components/PeEvaluationPanel';
import { StockCalculatorSubNav } from '@/components/StockCalculatorSubNav';
import { STOCK_ANALYSIS_TITLE } from '@/lib/navigation';
import {
  groupPeEvaluationByDate,
  listPeEvaluationRecords,
} from '@/lib/pe-evaluation-history';

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

function fmtPe(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return `${n.toFixed(1)}×`;
}

export default async function PeEvaluationPage() {
  const session = await requireSession();

  const entries = await listPeEvaluationRecords(
    session.tenantId,
    session.userId,
    session.authMode
  );
  const timeline = groupPeEvaluationByDate(entries);

  return (
    <div className="page page-prose">
      <header className="page-header">
        <h1>{STOCK_ANALYSIS_TITLE}</h1>
        <p className="muted">
          P/E scorecard — private to <strong>{session.email}</strong>. Inputs: stock + purchase
          price + purchase date. Each run saved to your history.
        </p>
        <StockCalculatorSubNav />
      </header>

      <div className="journal-section-intro card wide">
        <h2 className="journal-section-title">P/E evaluation</h2>
        <p className="muted small">
          <strong>Part A</strong> — was purchase P/E cheap or expensive ·{' '}
          <strong>Part B</strong> — EPS growth + P/E compression ·{' '}
          <strong>Part C</strong> — 8-point scorecard at today&apos;s CMP.
        </p>
      </div>

      <PeEvaluationPanel />

      {entries.length === 0 ? (
        <section className="card wide">
          <p className="muted">
            No P/E scorecard runs yet. Enter a stock above — history appears here by date.
          </p>
        </section>
      ) : (
        <>
          <h2 className="section-heading">Scorecard history</h2>
          <p className="muted small analysis-log-summary">
            <strong>{entries.length}</strong> run{entries.length !== 1 ? 's' : ''} ·{' '}
            <strong>{timeline.length}</strong> year{timeline.length !== 1 ? 's' : ''}
          </p>

          <div className="history-timeline">
            {timeline.map((yearGroup) => (
              <section key={yearGroup.year} className="card wide history-year-block">
                <h2 className="history-year">{yearGroup.year}</h2>
                <p className="muted small">{yearGroup.totalItems} scorecards</p>

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
                                href={`/stock-calculator/pe/${entry.id}`}
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
                                  <span className="tag">
                                    Bought ₹
                                    {entry.purchasePrice.toLocaleString('en-IN')} ·{' '}
                                    {entry.purchaseDate}
                                  </span>
                                  <span className="tag">
                                    Score {entry.rawScore > 0 ? '+' : ''}
                                    {entry.rawScore}/8
                                  </span>
                                  {entry.purchasePe != null && (
                                    <span className="tag">Buy {fmtPe(entry.purchasePe)}</span>
                                  )}
                                </span>
                                <span className="analysis-log-query muted">
                                  {entry.cmp != null && (
                                    <>CMP ₹{entry.cmp.toLocaleString('en-IN')} · </>
                                  )}
                                  {entry.freshVerdict.slice(0, 90)}
                                  {entry.freshVerdict.length > 90 ? '…' : ''}
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
