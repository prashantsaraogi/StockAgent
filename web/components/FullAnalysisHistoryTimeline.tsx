import Link from 'next/link';
import { groupByYearMonthDate } from '@/lib/date-history-group';
import type { StockCalculatorFullRecord } from '@/lib/stock-calculator-full-history';

export interface FullAnalysisHistoryListItem {
  id: string;
  createdAt: string;
  stockName: string;
  ticker: string;
  sector: string;
  expectedCagrPct: number;
  years: number;
  cmp: number | null;
  overviewVerdict: string;
  sessionOnly?: boolean;
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

export function recordsToHistoryItems(
  entries: StockCalculatorFullRecord[]
): FullAnalysisHistoryListItem[] {
  return entries.map((entry) => ({
    id: entry.id,
    createdAt: entry.createdAt,
    stockName: entry.stockName,
    ticker: entry.ticker,
    sector: entry.sector,
    expectedCagrPct: entry.expectedCagrPct,
    years: entry.years,
    cmp: entry.cmp,
    overviewVerdict: entry.overviewVerdict,
  }));
}

interface Props {
  items: FullAnalysisHistoryListItem[];
  emptyMessage?: string;
}

export function FullAnalysisHistoryTimeline({ items, emptyMessage }: Props) {
  if (items.length === 0) {
    return (
      <section className="card wide">
        <p className="muted">
          {emptyMessage ??
            'No saved runs yet. Run Basic or Advanced analysis above — each run appears here with a detail page and Refresh.'}
        </p>
      </section>
    );
  }

  const timeline = groupByYearMonthDate(items, (item) => item.createdAt);

  return (
    <>
      <p className="muted small analysis-log-summary">
        <strong>{items.length}</strong> run{items.length !== 1 ? 's' : ''} ·{' '}
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
                                {entry.sessionOnly && (
                                  <span className="tag">This browser session</span>
                                )}
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
  );
}
