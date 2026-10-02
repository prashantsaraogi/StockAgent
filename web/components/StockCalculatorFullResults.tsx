'use client';

import { useState } from 'react';
import type { StockCalculatorFullResult } from '@/lib/stock-calculator-full';
import type { FullAnalysisChildIds } from '@/lib/stock-calculator-full-history';
import { CalculatorSummaryPanel } from '@/components/CalculatorSummaryPanel';
import { PeScorecardResults } from '@/components/PeScorecardResults';
import { PeParametersBrief } from '@/components/PeParametersBrief';
import { EarningsQualityResults } from '@/components/EarningsQualityResults';
import { MarginAnalysisResults } from '@/components/MarginAnalysisResults';
import { BusinessQualityResults } from '@/components/BusinessQualityResults';
import { RiskDecisionResults } from '@/components/RiskDecisionResults';

export type FullResultTabId =
  | 'overview'
  | 'cagr'
  | 'pe'
  | 'earnings-quality'
  | 'margin'
  | 'business-quality'
  | 'risk';

const FULL_TABS: { id: FullResultTabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'cagr', label: 'CAGR' },
  { id: 'pe', label: 'PE' },
  { id: 'earnings-quality', label: 'Earnings Quality' },
  { id: 'margin', label: 'Margin' },
  { id: 'business-quality', label: 'Business Quality' },
  { id: 'risk', label: 'Risk & Decision' },
];

interface StockCalculatorFullResultsProps {
  analysis: StockCalculatorFullResult;
  fullRecordId?: string;
  childIds?: FullAnalysisChildIds;
  savedAt?: string;
}

function verdictToneClass(verdict: string): string {
  if (verdict.startsWith('🟢')) return 'pe-tone-good';
  if (verdict.startsWith('🔴')) return 'pe-tone-bad';
  return 'pe-tone-warn';
}

export function StockCalculatorFullResults({
  analysis,
  fullRecordId,
  childIds,
  savedAt,
}: StockCalculatorFullResultsProps) {
  const [activeTab, setActiveTab] = useState<FullResultTabId>('overview');
  const c = analysis.cagr;

  return (
    <div className="calc-full-results">
      <section className="card wide calc-full-header">
        <h2>
          Full analysis — {analysis.stockName}{' '}
          <span className="muted">({analysis.ticker})</span>
        </h2>
        <p className="muted small">
          {analysis.sector} · {analysis.inputs.expectedCagrPct}% CAGR · {analysis.inputs.years}Y ·{' '}
          {analysis.inputs.peBasis === 'forward' ? 'Forward' : 'TTM'} P/E
          {savedAt &&
            ` · ${new Date(savedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} IST`}
        </p>

        <nav className="sub-nav calc-tabs calc-full-module-tabs" aria-label="Analysis modules">
          {FULL_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`sub-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </section>

      {activeTab === 'overview' && (
        <section className="card wide calc-full-overview">
          <h3>Module verdicts</h3>
          <div className="calc-full-overview-grid">
            {(
              [
                ['CAGR Evaluation', analysis.overview.cagrVerdict, childIds?.cagr, '/stock-calculator/cagr'],
                ['PE Evaluation', analysis.overview.peVerdict, childIds?.pe, '/stock-calculator/pe'],
                [
                  'Earnings Quality',
                  analysis.overview.earningsQualityVerdict,
                  childIds?.earningsQuality,
                  '/stock-calculator/earnings-quality',
                ],
                ['Margin Analysis', analysis.overview.marginVerdict, childIds?.margin, '/stock-calculator/margin'],
                [
                  'Business Quality',
                  analysis.overview.businessQualityVerdict,
                  childIds?.businessQuality,
                  '/stock-calculator/business-quality',
                ],
                ['Risk & Decision', analysis.overview.riskVerdict, childIds?.riskDecision, '/stock-calculator/risk-decision'],
              ] as const
            ).map(([label, verdict, childId, basePath]) => (
              <article key={label} className="calc-full-overview-card">
                <span className="pe-eval-label">{label}</span>
                <p className={`calc-full-overview-verdict ${verdictToneClass(verdict)}`}>{verdict}</p>
                {childId && (
                  <a href={`${basePath}/${childId}`} className="muted small">
                    Open saved module →
                  </a>
                )}
              </article>
            ))}
          </div>
          <p className="muted small">
            Use the tabs above for full detail on each module. All six analyses were saved to their
            respective histories.
          </p>
        </section>
      )}

      {activeTab === 'cagr' && (
        <CalculatorSummaryPanel
          ticker={c.ticker}
          stockName={c.stockName}
          peBasis={c.peBasis}
          years={c.years}
          expectedCagrPct={c.expectedCagrPct}
          anchorPe={c.anchorPe}
          anchorEps={c.anchorEps}
          projectedEps={c.projectedEps}
          snapshot={c.snapshot}
          tabAnalysis={c.tabAnalysis}
          impliedVerdict={c.impliedVerdict}
          quality={c.quality}
          internalRisk={c.internalRisk}
          externalRisk={c.externalRisk}
          cagrGap={c.cagrGap}
          scenarios={c.scenarios}
          investmentAmountInr={c.investmentAmountInr}
          detailId={childIds?.cagr}
          report={c.report}
          frameworkVerdict={c.frameworkVerdict}
          reportMode={c.reportMode}
        />
      )}

      {activeTab === 'pe' &&
        (analysis.peScorecard ? (
          <PeScorecardResults data={analysis.peScorecard} recordId={childIds?.pe ?? undefined} />
        ) : (
          <PeParametersBrief
            data={analysis.peParameters}
            hint="Add optional purchase price & date in the form for the full PE scorecard (legacy holder lens)."
          />
        ))}

      {activeTab === 'earnings-quality' && (
        <EarningsQualityResults
          data={analysis.earningsQuality}
          recordId={childIds?.earningsQuality}
        />
      )}

      {activeTab === 'margin' && (
        <MarginAnalysisResults data={analysis.margin} recordId={childIds?.margin} />
      )}

      {activeTab === 'business-quality' && (
        <BusinessQualityResults
          data={analysis.businessQuality}
          recordId={childIds?.businessQuality}
        />
      )}

      {activeTab === 'risk' && (
        <RiskDecisionResults data={analysis.riskDecision} recordId={childIds?.riskDecision} />
      )}

      {fullRecordId && (
        <p className="muted small calc-full-footer">
          Full analysis saved · ID <code>{fullRecordId.slice(0, 8)}…</code>
        </p>
      )}
    </div>
  );
}
