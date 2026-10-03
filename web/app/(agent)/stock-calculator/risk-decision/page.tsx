import Link from 'next/link';
import { requireSession } from '@/lib/auth';
import { loadFrameworkMarkdown } from '@/lib/load-framework-markdown';
import { MarkdownView } from '@/components/MarkdownView';
import { RiskDecisionPanel } from '@/components/RiskDecisionPanel';
import { StockCalculatorSubNav } from '@/components/StockCalculatorSubNav';
import {
  groupRiskDecisionByDate,
  listRiskDecisionRecords,
} from '@/lib/risk-decision-history';

function clipFrameworkIntro(md: string): string {
  const lines = md.split('\n');
  const end = lines.findIndex((l, i) => i > 15 && /^## Section A/.test(l));
  return (end > 0 ? lines.slice(0, end) : lines.slice(0, 45)).join('\n').trim();
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

export default async function RiskDecisionPage() {
  const session = await requireSession();
  const frameworkMd =
    (await loadFrameworkMarkdown('StockBook/RISK-DECISION-FRAMEWORK.md')) ??
    '# Risk & Decision\n\nFramework not found.';

  const entries = await listRiskDecisionRecords(
    session.tenantId,
    session.userId,
    session.authMode
  );
  const timeline = groupRiskDecisionByDate(entries);

  return (
    <div className="page page-prose">
      <header className="page-header">
        <h1>Stock Calculator</h1>
        <p className="muted">
          Risk &amp; Decision — final engine · private to <strong>{session.email}</strong>
        </p>
        <StockCalculatorSubNav />
      </header>

      <div className="journal-section-intro card wide">
        <h2 className="journal-section-title">⭐ Risk &amp; Decision</h2>
        <p className="muted small">
          Combines all five tabs · Investment Thesis card · Risk · Catalysts · Thesis breakers ·
          Score /100 + verdict.
        </p>
      </div>

      <section className="card wide sector-framework-ref">
        <h2>Framework reference</h2>
        <MarkdownView content={clipFrameworkIntro(frameworkMd)} />
      </section>

      <RiskDecisionPanel />

      {entries.length === 0 ? (
        <section className="card wide">
          <p className="muted">
            No decision runs yet. Try <strong>Maruti (MARUTI)</strong> — expect ~72/100, HOLD /
            SELECTIVE ADD.
          </p>
        </section>
      ) : (
        <>
          <h2 className="section-heading">Decision history</h2>
          <div className="history-timeline">
            {timeline.map((yearGroup) => (
              <section key={yearGroup.year} className="card wide history-year-block">
                <h2 className="history-year">{yearGroup.year}</h2>
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
                                href={`/stock-calculator/risk-decision/${entry.id}`}
                                className="analysis-log-item"
                              >
                                <span className="analysis-log-when">
                                  {formatTime(entry.createdAt)} IST
                                </span>
                                <span className="analysis-log-main">
                                  <strong>{entry.stockName}</strong>
                                  <span className="tag">{entry.ticker}</span>
                                  <span className="tag rd-tag-score">
                                    {entry.quantitativeScore100}/100
                                  </span>
                                  <span className="tag">{entry.thesisStatus}</span>
                                </span>
                                <span className="muted analysis-log-query">
                                  {entry.investmentVerdict}
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
