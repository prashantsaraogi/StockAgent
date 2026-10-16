'use client';

import type { StockCalculatorFullResult } from '@/lib/stock-calculator-full';
import { buildExternalStockReferenceLinks } from '@/lib/external-stock-reference-links';
import { buildParametersPastForwardOverview } from '@/lib/parameters-past-forward-overview';

interface ParametersPastForwardOverviewProps {
  analysis: StockCalculatorFullResult;
}

function readTone(read: string | null): string {
  if (!read) return '';
  const r = read.toLowerCase();
  if (/cheap|attractive|strong|safe|pass|below|modest|fair|recover|dominant|intact/.test(r) && !/expensive|stretched|weak|fail|above|trap/.test(r)) {
    return 'pf-read-good';
  }
  if (/expensive|stretched|weak|fail|trap|compressed|below hurdle|pause|avoid/.test(r)) {
    return 'pf-read-warn';
  }
  return 'pf-read-neutral';
}

export function ParametersPastForwardOverview({ analysis }: ParametersPastForwardOverviewProps) {
  const rows = buildParametersPastForwardOverview({
    pe: analysis.peParameters,
    earningsQuality: analysis.earningsQuality,
  });
  const links = buildExternalStockReferenceLinks(analysis.ticker, analysis.stockName);
  const paramDate = analysis.peParameters.parametersDate;

  return (
    <section className="calc-pf-overview" aria-labelledby="calc-pf-heading">
      <h3 id="calc-pf-heading">Parameters — past vs future</h3>
      <p className="muted small calc-pf-intro">
        Same metric, two lenses: <strong>left</strong> = rear-view (10Y / trailing, like Value Research
        historical ratios &amp; Moneycontrol TTM). <strong>Right</strong> = forward vision (5Y @ normalized
        earnings — confirm with{' '}
        <a href={links.valueResearchSearch} target="_blank" rel="noopener noreferrer">
          Value Research
        </a>{' '}
        &amp;{' '}
        <a href={links.moneycontrolSearch} target="_blank" rel="noopener noreferrer">
          Moneycontrol
        </a>
        ). Source: StockBook PARAMETERS{paramDate ? ` · ${paramDate}` : ''}.
      </p>

      <div className="calc-pf-table-wrap">
        <table className="calc-pf-table">
          <thead>
            <tr>
              <th scope="col">Parameter</th>
              <th scope="col" className="calc-pf-col-past">
                Past performance
                <span className="calc-pf-col-hint">Part 1 · 10Y rear-view</span>
              </th>
              <th scope="col" className="calc-pf-col-future">
                Future performance
                <span className="calc-pf-col-hint">Part 2 · 5Y forward</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="calc-pf-param">
                  <strong>{row.parameter}</strong>
                  <details className="calc-pf-ref">
                    <summary className="muted small">VRO &amp; Moneycontrol labels</summary>
                    <dl className="calc-pf-ref-dl small muted">
                      <div>
                        <dt>Past · VRO</dt>
                        <dd>{row.external.valueResearchPast}</dd>
                      </div>
                      <div>
                        <dt>Past · MC</dt>
                        <dd>{row.external.moneycontrolPast}</dd>
                      </div>
                      <div>
                        <dt>Future · VRO</dt>
                        <dd>{row.external.valueResearchFuture}</dd>
                      </div>
                      <div>
                        <dt>Future · MC</dt>
                        <dd>{row.external.moneycontrolFuture}</dd>
                      </div>
                    </dl>
                  </details>
                </td>
                <td className="calc-pf-col-past">
                  <div className="calc-pf-value">{row.past.value}</div>
                  {row.past.read && (
                    <div className={`calc-pf-read ${readTone(row.past.read)}`}>{row.past.read}</div>
                  )}
                </td>
                <td className="calc-pf-col-future">
                  <div className="calc-pf-value">{row.future.value}</div>
                  {row.future.read && (
                    <div className={`calc-pf-read ${readTone(row.future.read)}`}>{row.future.read}</div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="muted small">
        Reference hubs:{' '}
        <a href={links.valueResearchHome} target="_blank" rel="noopener noreferrer">
          valueresearchonline.com/stocks
        </a>
        {' · '}
        <a href={links.moneycontrolHome} target="_blank" rel="noopener noreferrer">
          moneycontrol.com
        </a>
        . External sites use different layouts per stock — use the label cheat-sheet on each row to
        compare apples-to-apples with this report.
      </p>
    </section>
  );
}
