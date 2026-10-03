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
import { MarkdownView } from '@/components/MarkdownView';

export type FullResultTabId =
  | 'framework'
  | 'overview'
  | 'cagr'
  | 'pe'
  | 'earnings-quality'
  | 'margin'
  | 'business-quality'
  | 'risk';

const MODULE_TABS: { id: FullResultTabId; label: string }[] = [
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
  /** Open a module tab from URL (?tab=cagr) on saved full analysis pages. */
  initialTab?: FullResultTabId;
  /** Basic Analysis — default to Framework report tab when present */
  preferFrameworkTab?: boolean;
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
  initialTab,
  preferFrameworkTab,
}: StockCalculatorFullResultsProps) {
  const defaultTab: FullResultTabId =
    initialTab ??
    (preferFrameworkTab && analysis.frameworkReport?.markdown ? 'framework' : 'overview');
  const [activeTab, setActiveTab] = useState<FullResultTabId>(defaultTab);
  const c = analysis.cagr;

  const tabs: { id: FullResultTabId; label: string }[] = analysis.frameworkReport?.markdown
    ? [{ id: 'framework', label: 'Framework report' }, ...MODULE_TABS]
    : MODULE_TABS;

  const overviewModules: {
    label: string;
    verdict: string;
    tab: FullResultTabId;
    childId?: string | null;
    historyBase: string;
  }[] = [
    {
      label: 'CAGR Evaluation',
      verdict: analysis.overview.cagrVerdict,
      tab: 'cagr',
      childId: childIds?.cagr,
      historyBase: '/stock-calculator/cagr',
    },
    {
      label: 'PE Evaluation',
      verdict: analysis.overview.peVerdict,
      tab: 'pe',
      childId: childIds?.pe,
      historyBase: '/stock-calculator/pe',
    },
    {
      label: 'Earnings Quality',
      verdict: analysis.overview.earningsQualityVerdict,
      tab: 'earnings-quality',
      childId: childIds?.earningsQuality,
      historyBase: '/stock-calculator/earnings-quality',
    },
    {
      label: 'Margin Analysis',
      verdict: analysis.overview.marginVerdict,
      tab: 'margin',
      childId: childIds?.margin,
      historyBase: '/stock-calculator/margin',
    },
    {
      label: 'Business Quality',
      verdict: analysis.overview.businessQualityVerdict,
      tab: 'business-quality',
      childId: childIds?.businessQuality,
      historyBase: '/stock-calculator/business-quality',
    },
    {
      label: 'Risk & Decision',
      verdict: analysis.overview.riskVerdict,
      tab: 'risk',
      childId: childIds?.riskDecision,
      historyBase: '/stock-calculator/risk-decision',
    },
  ];

  return (
    <div className="calc-full-results">
      <section className="card wide calc-full-header">
        <h2>
          {analysis.basicAnalysis ? 'Basic analysis' : 'Full analysis'} — {analysis.stockName}{' '}
          <span className="muted">({analysis.ticker})</span>
        </h2>
        {analysis.frameworkReport?.oneLineVerdict && (
          <p className="calc-full-one-line">{analysis.frameworkReport.oneLineVerdict}</p>
        )}
        <p className="muted small">
          {analysis.sector} · {analysis.inputs.expectedCagrPct}% CAGR · {analysis.inputs.years}Y ·{' '}
          {analysis.inputs.peBasis === 'forward' ? 'Forward' : 'TTM'} P/E
          {analysis.frameworkReport?.reportMode === 'gemini' && ' · Gemini synthesis (Analysis section)'}
          {savedAt &&
            ` · ${new Date(savedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} IST`}
        </p>

        <nav className="sub-nav calc-tabs calc-full-module-tabs" aria-label="Analysis modules">
          {tabs.map((tab) => (
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

      {activeTab === 'framework' && analysis.frameworkReport?.markdown && (
        <section className="card wide calc-full-framework-report">
          <MarkdownView content={analysis.frameworkReport.markdown} headingAnchors />
        </section>
      )}

      {activeTab === 'overview' && (
        <section className="card wide calc-full-overview">
          <h3>Module verdicts</h3>
          <div className="calc-full-overview-grid">
            {overviewModules.map((mod) => (
              <article key={mod.label} className="calc-full-overview-card">
                <span className="pe-eval-label">{mod.label}</span>
                <p className={`calc-full-overview-verdict ${verdictToneClass(mod.verdict)}`}>
                  {mod.verdict}
                </p>
                <button
                  type="button"
                  className="btn-link muted small calc-full-overview-open"
                  onClick={() => setActiveTab(mod.tab)}
                >
                  View module detail →
                </button>
              </article>
            ))}
          </div>
          <p className="muted small">
            Use the tabs above or <strong>View module detail</strong> on each card — full results are
            in this report. Saved copies also appear under each module&apos;s history tab when
            Supabase history is enabled.
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
