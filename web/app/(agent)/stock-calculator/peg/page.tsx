import Link from 'next/link';
import { requireSession } from '@/lib/auth';
import { loadFrameworkMarkdown } from '@/lib/load-framework-markdown';
import { MarkdownView } from '@/components/MarkdownView';
import { PegEvaluationPanel } from '@/components/PegEvaluationPanel';
import { StockCalculatorSubNav } from '@/components/StockCalculatorSubNav';
import { STOCK_ANALYSIS_TITLE } from '@/lib/navigation';
import { groupPegByDate, listPegRecords } from '@/lib/peg-history';

function clipFrameworkIntro(md: string): string {
  const lines = md.split('\n');
  const end = lines.findIndex((l, i) => i > 12 && /^## Analysis sequence/.test(l));
  const slice = end > 0 ? lines.slice(0, end) : lines.slice(0, 45);
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

export default async function PegEvaluationPage() {
  const session = await requireSession();
  const frameworkMd =
    (await loadFrameworkMarkdown('StockBook/PEG-FRAMEWORK.md')) ??
    '# PEG Evaluation\n\nFramework file not found in repo.';

  const entries = await listPegRecords(session.tenantId, session.userId, session.authMode);
  const timeline = groupPegByDate(entries);

  return (
    <div className="page page-prose">
      <header className="page-header">
        <h1>{STOCK_ANALYSIS_TITLE}</h1>
        <p className="muted">
          PEG Evaluation — private to <strong>{session.email}</strong>. Each run saved to your
          history.
        </p>
        <StockCalculatorSubNav />
      </header>

      <div className="journal-section-intro card wide">
        <h2 className="journal-section-title">PEG + quality scorecard</h2>
        <p className="muted small">
          Five metrics together: <strong>P/E · PEG · ROCE · Debt · FCF</strong> · 100-point model ·
          Hero-style combo check · max P/E at target PEG.
        </p>
      </div>

      <section className="card wide sector-framework-ref">
        <h2>Framework reference</h2>
        <p className="muted small">
          From <code>StockBook/PEG-FRAMEWORK.md</code>
        </p>
        <MarkdownView content={clipFrameworkIntro(frameworkMd)} />
      </section>

      <PegEvaluationPanel />

      {entries.length === 0 ? (
        <section className="card wide">
          <p className="muted">
            No PEG runs yet. Try <strong>Hero MotoCorp (HEROMOTOCO)</strong> — sample{' '}
            <code>PEG_HEROMOTOCO.md</code> · or <strong>ITC</strong> / <strong>Tata Consumer</strong>{' '}
            from PARAMETERS.
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
                                href={`/stock-calculator/peg/${entry.id}`}
                                className="analysis-log-item"
                              >
                                <span className="analysis-log-when">
                                  {formatTime(entry.createdAt)} IST
                                </span>
                                <span className="analysis-log-main">
                                  <strong className="analysis-log-title">{entry.stockName}</strong>
                                  <span className="tag">{entry.ticker}</span>
                                  <span className="tag">{entry.sector}</span>
                                  <span className="tag">{entry.totalScore100}/100</span>
                                  {entry.pegRatio != null && (
                                    <span className="tag">PEG {entry.pegRatio.toFixed(2)}×</span>
                                  )}
                                  {entry.warningCount > 0 && (
                                    <span className="tag eq-tag-warn">
                                      {entry.warningCount} warning
                                      {entry.warningCount !== 1 ? 's' : ''}
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
