/**
 * Ask Agent — compact factor table (earnings, valuation, technical, etc.)
 */

import type { StockCalculatorFullResult } from './stock-calculator-full';

type FactorSignal = '🟢' | '🟡' | '🔴' | '⚠️';

interface FactorRow {
  factor: string;
  view: string;
  signal: FactorSignal;
}

function isNbfcOrBank(sector: string, stockName: string): boolean {
  const s = `${sector} ${stockName}`.toLowerCase();
  return /nbfc|bank|finance|housing finance|power finance|rec\b|pfc/i.test(s);
}

function assessRecentEpsGrowth(analysis: StockCalculatorFullResult): 'strong' | 'moderate' | 'weak' | 'unknown' {
  const eq = analysis.earningsQuality;
  const pe = analysis.peParameters;
  const qs = eq.quarterly ?? [];
  const latestQ = qs[qs.length - 1];
  const yoyQ = qs.length >= 5 ? qs[qs.length - 5] : qs.length >= 2 ? qs[0] : null;

  let yoyPct: number | null = null;
  if (latestQ?.eps != null && yoyQ?.eps != null && yoyQ.eps !== 0) {
    yoyPct = ((latestQ.eps - yoyQ.eps) / Math.abs(yoyQ.eps)) * 100;
  } else if (latestQ?.pat != null && yoyQ?.pat != null && yoyQ.pat !== 0) {
    yoyPct = ((latestQ.pat - yoyQ.pat) / Math.abs(yoyQ.pat)) * 100;
  }

  const eps = latestQ?.eps ?? pe.trailingEps ?? pe.normalizedEps;
  if (eps != null && eps < 0) return 'weak';
  if (yoyPct == null) {
    if (eq.overallTone === 'good') return 'strong';
    if (eq.overallTone === 'bad') return 'weak';
    return 'unknown';
  }
  if (yoyPct >= 8) return 'strong';
  if (yoyPct <= -5) return 'weak';
  return 'moderate';
}

function signalForEarnings(band: ReturnType<typeof assessRecentEpsGrowth>): FactorRow {
  switch (band) {
    case 'strong':
      return { factor: 'Earnings', view: 'Strong', signal: '🟢' };
    case 'weak':
      return { factor: 'Earnings', view: 'Weak', signal: '🔴' };
    case 'moderate':
      return { factor: 'Earnings', view: 'Moderate', signal: '🟡' };
    default:
      return { factor: 'Earnings', view: 'Mixed — verify quarterly file', signal: '🟡' };
  }
}

function signalForAssetQuality(analysis: StockCalculatorFullResult): FactorRow {
  const eq = analysis.earningsQuality;
  const bq = analysis.businessQuality.businessQualityScore10;
  const nbfc = isNbfcOrBank(analysis.sector, analysis.stockName);

  if (!nbfc) {
    if (bq >= 8 && eq.overallTone === 'good') {
      return { factor: 'Asset / franchise quality', view: 'Strong', signal: '🟢' };
    }
    if (bq <= 4 || eq.overallTone === 'bad') {
      return { factor: 'Asset / franchise quality', view: 'Weak', signal: '🔴' };
    }
    return { factor: 'Asset / franchise quality', view: 'Average', signal: '🟡' };
  }

  const badFlags = eq.warnings?.filter((w) => w.severity === 'bad').length ?? 0;
  if (badFlags > 0) {
    return { factor: 'Asset quality', view: 'Stressed — quality flags', signal: '🔴' };
  }
  if (eq.overallTone === 'good' || bq >= 7) {
    return { factor: 'Asset quality', view: 'Improving / stable', signal: '🟢' };
  }
  if (eq.overallTone === 'bad') {
    return { factor: 'Asset quality', view: 'Deteriorating', signal: '🔴' };
  }
  return { factor: 'Asset quality', view: 'Monitor NPAs / book', signal: '🟡' };
}

function parseDividendYieldHint(analysis: StockCalculatorFullResult): number | null {
  const oey = analysis.peParameters.historical?.ownerEarningsYield;
  if (oey) {
    const m = oey.match(/([\d.]+)\s*%/);
    if (m) return parseFloat(m[1]);
  }
  return null;
}

function signalForDividend(analysis: StockCalculatorFullResult): FactorRow {
  const y = parseDividendYieldHint(analysis);
  const psu = /power finance|rec|pfc|ntpc|coal india|ioc|ongc|bank.*psu/i.test(
    `${analysis.stockName} ${analysis.sector}`
  );

  if (y != null) {
    if (y >= 3.5) return { factor: 'Dividend', view: 'Attractive', signal: '🟢' };
    if (y >= 2) return { factor: 'Dividend', view: 'Moderate yield', signal: '🟡' };
    return { factor: 'Dividend', view: 'Low yield', signal: '🟡' };
  }
  if (psu || isNbfcOrBank(analysis.sector, analysis.stockName)) {
    return { factor: 'Dividend', view: 'Often attractive (verify yield @ CMP)', signal: '🟢' };
  }
  return { factor: 'Dividend', view: 'Not primary lens — check filings', signal: '🟡' };
}

function signalForValuation(analysis: StockCalculatorFullResult, premiumPccl: number | null): FactorRow {
  const pe = analysis.peParameters;
  if (pe.premiumTo10yPct != null) {
    if (pe.premiumTo10yPct <= -5) {
      return { factor: 'Valuation', view: 'Relatively cheap vs 10Y P/E', signal: '🟢' };
    }
    if (pe.premiumTo10yPct >= 15) {
      return { factor: 'Valuation', view: 'Expensive vs 10Y P/E', signal: '🔴' };
    }
    return { factor: 'Valuation', view: 'Fair vs history', signal: '🟡' };
  }
  if (premiumPccl != null && premiumPccl <= 0) {
    return { factor: 'Valuation', view: 'At/below PCCL stress anchor', signal: '🟢' };
  }
  if (pe.ttmPe != null && pe.ttmPe <= 12 && isNbfcOrBank(analysis.sector, analysis.stockName)) {
    return { factor: 'Valuation', view: 'Relatively cheap (low P/E)', signal: '🟢' };
  }
  if (pe.ttmPe != null && pe.ttmPe >= 35) {
    return { factor: 'Valuation', view: 'Rich multiple', signal: '🔴' };
  }
  if (pe.ttmPe != null) {
    return { factor: 'Valuation', view: 'Reasonable vs live P/E', signal: '🟡' };
  }
  return { factor: 'Valuation', view: 'Verify PARAMETERS / PCCL', signal: '🟡' };
}

function signalForGrowth(analysis: StockCalculatorFullResult): FactorRow {
  const gap = analysis.cagr.cagrGap;
  if (gap.gapTone === 'positive' || (gap.possibleCagrPct != null && gap.possibleCagrPct >= 10)) {
    return { factor: 'Growth', view: 'Positive', signal: '🟢' };
  }
  if (gap.gapTone === 'negative') {
    return { factor: 'Growth', view: 'Below hurdle', signal: '🔴' };
  }
  if (assessRecentEpsGrowth(analysis) === 'strong') {
    return { factor: 'Growth', view: 'Positive', signal: '🟢' };
  }
  return { factor: 'Growth', view: 'Moderate / mixed', signal: '🟡' };
}

function signalForTechnical(
  cmp: number | null,
  high: number | null | undefined,
  low: number | null | undefined
): FactorRow {
  if (cmp == null || high == null || low == null || high <= low) {
    return { factor: 'Technical trend', view: 'UNVERIFIED — no 52W range', signal: '🟡' };
  }
  const range = high - low;
  const pos = (cmp - low) / range;
  if (pos <= 0.25) {
    return { factor: 'Technical trend', view: 'Weak (near 52W low)', signal: '🔴' };
  }
  if (pos >= 0.75) {
    return { factor: 'Technical trend', view: 'Strong (near 52W high)', signal: '🟢' };
  }
  return { factor: 'Technical trend', view: 'Mid-range', signal: '🟡' };
}

function signalForKeyRisk(analysis: StockCalculatorFullResult): FactorRow {
  const top =
    analysis.riskDecision.concerns[0] ??
    analysis.riskDecision.riskFactors?.find((r) => r.signal === '🔴')?.factor ??
    analysis.riskDecision.thesis.riskLabel;
  const sectorHint = isNbfcOrBank(analysis.sector, analysis.stockName)
    ? 'Borrower / sector credit risk'
    : 'Thesis / execution risk';
  const detail = top ? top.slice(0, 72) : sectorHint;
  return { factor: 'Key risk', view: detail, signal: '⚠️' };
}

export function buildInvestorFactorLensMarkdown(
  analysis: StockCalculatorFullResult,
  opts: {
    cmp: number | null;
    premiumPccl: number | null;
    fiftyTwoWeekHigh?: number | null;
    fiftyTwoWeekLow?: number | null;
  }
): string {
  const rows: FactorRow[] = [
    signalForEarnings(assessRecentEpsGrowth(analysis)),
    signalForAssetQuality(analysis),
    signalForDividend(analysis),
    signalForValuation(analysis, opts.premiumPccl),
    signalForGrowth(analysis),
    signalForTechnical(opts.cmp, opts.fiftyTwoWeekHigh, opts.fiftyTwoWeekLow),
    signalForKeyRisk(analysis),
  ];

  const tableLines = rows.map((r) => `| ${r.factor} | ${r.signal} ${r.view} |`);

  const rangeLine =
    opts.cmp != null && opts.fiftyTwoWeekLow != null && opts.fiftyTwoWeekHigh != null
      ? `\n*52-week range (Yahoo):* roughly **₹${Math.round(opts.fiftyTwoWeekLow).toLocaleString('en-IN')}–₹${Math.round(opts.fiftyTwoWeekHigh).toLocaleString('en-IN')}** vs CMP **₹${Math.round(opts.cmp).toLocaleString('en-IN')}**.\n`
      : '';

  return `## Factor lens (quick read)

| Factor | View |
|--------|------|
${tableLines.join('\n')}
${rangeLine}
*Framework-derived — not a duplicate of external AI summaries. Add StockBook for name-specific catalysts (e.g. mergers).*
`;
}
