import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireSession } from '@/lib/auth';
import { getCalculatorRecord } from '@/lib/stock-calculator-history';
import { CalculatorSummaryPanel } from '@/components/CalculatorSummaryPanel';
import { sanitizeVerdictLabel } from '@/lib/investor-report-format';
import { StockCalculatorSubNav } from '@/components/StockCalculatorSubNav';

interface Props {
  params: Promise<{ id: string }>;
}

function peBasisLabel(basis: string): string {
  return basis === 'forward' ? 'Forward P/E' : 'TTM P/E';
}

export default async function CagrEvaluationDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await requireSession();
  const entry = await getCalculatorRecord(
    session.tenantId,
    id,
    session.userId,
    session.authMode
  );
  if (!entry) notFound();

  const when = new Date(entry.createdAt).toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  return (
    <div className="page page-prose">
      <Link href="/stock-calculator/cagr" className="back-link">
        ← CAGR Evaluation
      </Link>

      <header className="page-header">
        <h1>
          {entry.stockName} ({entry.ticker})
        </h1>
        <p className="muted">
          {when} · {entry.sector} · {peBasisLabel(entry.peBasis)} · {entry.expectedCagrPct}% CAGR
          · {entry.years} year{entry.years !== 1 ? 's' : ''}
        </p>
        <div className="analysis-detail-tags">
          <span className="tag">{entry.ticker}</span>
          <span className="tag">CMP ₹{entry.cmp.toLocaleString('en-IN')}</span>
          <span className="tag">{entry.anchorPe.toFixed(1)}× anchor P/E</span>
          {entry.frameworkVerdict && (
            <span className="tag verdict">
              {sanitizeVerdictLabel(entry.frameworkVerdict.split('—')[0].trim())}
            </span>
          )}
          {entry.reportMode === 'gemini' && <span className="tag">Enhanced narrative</span>}
          {entry.manualPeOverride != null && (
            <span className="tag warn">Manual {entry.manualPeOverride}×</span>
          )}
          {entry.investmentAmountInr != null && entry.investmentAmountInr > 0 && (
            <span className="tag">
              Invest ₹{Math.round(entry.investmentAmountInr).toLocaleString('en-IN')}
            </span>
          )}
        </div>
        <StockCalculatorSubNav />
      </header>

      {entry.quality && entry.cagrGap && (
        <CalculatorSummaryPanel
          ticker={entry.ticker}
          stockName={entry.stockName}
          peBasis={entry.peBasis}
          years={entry.years}
          expectedCagrPct={entry.expectedCagrPct}
          anchorPe={entry.anchorPe}
          anchorEps={entry.anchorEps}
          projectedEps={entry.projectedEps}
          snapshot={entry.snapshot}
          tabAnalysis={entry.tabAnalysis!}
          impliedVerdict={entry.impliedVerdict}
          quality={entry.quality}
          internalRisk={entry.internalRisk!}
          externalRisk={entry.externalRisk!}
          cagrGap={entry.cagrGap}
          scenarios={entry.scenarios}
          investmentAmountInr={entry.investmentAmountInr}
          report={entry.report}
          frameworkVerdict={entry.frameworkVerdict}
          reportMode={entry.reportMode}
        />
      )}

      <p className="footer-note muted small">
        Private to {session.email} · ID <code>{entry.id.slice(0, 8)}…</code>
        report (not generic AI)
      </p>
    </div>
  );
}
