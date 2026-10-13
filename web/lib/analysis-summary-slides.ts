/**
 * 60-second summary slides from a full Stock Analysis run (YouTube / share friendly).
 */

import type { StockCalculatorFullResult } from './stock-calculator-full';

export type SlideBulletTone = 'good' | 'warn' | 'bad' | 'neutral';

export interface SummarySlideBullet {
  text: string;
  tone?: SlideBulletTone;
}

export interface SummarySlideRow {
  module: string;
  signal: string;
  takeaway: string;
}

export interface SummarySlide {
  title: string;
  subtitle?: string;
  bullets?: SummarySlideBullet[];
  rows?: SummarySlideRow[];
}

function cleanVerdict(raw: string): string {
  return raw.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
}

function toneFromVerdict(v: string): SlideBulletTone {
  if (v.startsWith('🟢')) return 'good';
  if (v.startsWith('🔴')) return 'bad';
  if (v.startsWith('🟡')) return 'warn';
  return 'neutral';
}

function signalLabel(v: string): string {
  const c = cleanVerdict(v);
  if (c.length > 36) return `${c.slice(0, 33)}…`;
  return c || '—';
}

function pePositive(pe: StockCalculatorFullResult): SummarySlideBullet[] {
  const bullets: SummarySlideBullet[] = [];
  const bq = cleanVerdict(pe.businessQuality.verdict);
  if (bq) {
    bullets.push({
      text: `Business quality: ${bq}`,
      tone: toneFromVerdict(pe.businessQuality.verdict),
    });
  }
  const prem = pe.peParameters.premiumTo10yPct;
  if (prem != null && prem <= 0) {
    bullets.push({
      text: `P/E at or below 10-year reference (${prem >= 0 ? '+' : ''}${prem.toFixed(1)}%)`,
      tone: 'good',
    });
  } else if (prem != null && prem < 12) {
    bullets.push({
      text: `P/E only modestly above 10-year norm (+${prem.toFixed(1)}%)`,
      tone: 'neutral',
    });
  }
  const score = pe.businessQuality.businessQualityScore10;
  if (score != null && score >= 7) {
    bullets.push({ text: `Moat score ${score.toFixed(1)}/10 — above average franchise`, tone: 'good' });
  }
  const gap = pe.cagr.cagrGap;
  if (gap.gapTone === 'positive') {
    bullets.push({
      text: `Your ${pe.inputs.expectedCagrPct}% CAGR test is conservative vs supported band`,
      tone: 'good',
    });
  }
  if (bullets.length < 3 && pe.cagr.snapshot.cmp > 0) {
    bullets.push({
      text: `${pe.stockName} — ${pe.sector} · CMP ₹${Math.round(pe.cagr.snapshot.cmp).toLocaleString('en-IN')}`,
      tone: 'neutral',
    });
  }
  while (bullets.length < 3) {
    bullets.push({ text: 'Quality compounder profile — review modules for detail', tone: 'neutral' });
  }
  return bullets.slice(0, 4);
}

function riskBullets(pe: StockCalculatorFullResult): SummarySlideBullet[] {
  const bullets: SummarySlideBullet[] = [];
  const int = pe.cagr.internalRisk;
  const ext = pe.cagr.externalRisk;
  if (int.topRisks[0]) {
    bullets.push({
      text: `Company: ${int.topRisks[0].replace(/\s*\([^)]+\)\s*$/, '')}`,
      tone: int.level.includes('L2') || int.level.includes('L3') ? 'warn' : 'neutral',
    });
  }
  if (ext.topRisks[0]) {
    bullets.push({
      text: `Macro / sector: ${ext.topRisks[0].replace(/\s*\([^)]+\)\s*$/, '')}`,
      tone: 'warn',
    });
  }
  if (pe.cagr.cagrGap.gapTone === 'negative') {
    bullets.push({
      text: `Expected ${pe.inputs.expectedCagrPct}% CAGR above risk-adjusted path — prefer WAIT on lump sums`,
      tone: 'bad',
    });
  }
  const eq = cleanVerdict(pe.earningsQuality.overallVerdict);
  if (eq.startsWith('🔴') || eq.includes('Warning')) {
    bullets.push({ text: `Earnings quality flag: ${eq}`, tone: 'bad' });
  } else if (eq.startsWith('🟡')) {
    bullets.push({ text: `Earnings quality: ${eq}`, tone: 'warn' });
  }
  if (bullets.length === 0) {
    bullets.push({ text: 'No major risk flags in this run — still verify quarterly results', tone: 'neutral' });
  }
  return bullets.slice(0, 4);
}

function moduleRows(pe: StockCalculatorFullResult): SummarySlideRow[] {
  const o = pe.overview;
  return [
    {
      module: 'CAGR / growth test',
      signal: signalLabel(o.cagrVerdict),
      takeaway: cleanVerdict(pe.cagr.frameworkVerdict ?? pe.cagr.impliedVerdict).slice(0, 48),
    },
    {
      module: 'P/E valuation',
      signal: signalLabel(o.peVerdict),
      takeaway:
        pe.peParameters.premiumTo10yPct != null
          ? `${pe.peParameters.premiumTo10yPct >= 0 ? '+' : ''}${pe.peParameters.premiumTo10yPct.toFixed(1)}% vs 10Y`
          : 'See P/E tab',
    },
    {
      module: 'Earnings quality',
      signal: signalLabel(o.earningsQualityVerdict),
      takeaway: 'Cash vs profit cross-check',
    },
    {
      module: 'Margin',
      signal: signalLabel(o.marginVerdict),
      takeaway: 'Vs history & peers',
    },
    {
      module: 'Business quality',
      signal: signalLabel(o.businessQualityVerdict),
      takeaway:
        pe.businessQuality.businessQualityScore10 != null
          ? `Score ${pe.businessQuality.businessQualityScore10.toFixed(1)}/10`
          : 'Moat pillars',
    },
    {
      module: 'Risk & decision',
      signal: signalLabel(o.riskVerdict),
      takeaway: cleanVerdict(pe.riskDecision.investmentVerdict).slice(0, 48),
    },
  ];
}

function overallBullets(pe: StockCalculatorFullResult): SummarySlideBullet[] {
  const one = pe.frameworkReport?.oneLineVerdict
    ? cleanVerdict(pe.frameworkReport.oneLineVerdict)
    : cleanVerdict(pe.riskDecision.investmentVerdict);
  const bullets: SummarySlideBullet[] = [
    {
      text: one.length > 120 ? `${one.slice(0, 117)}…` : one,
      tone: toneFromVerdict(`${pe.riskDecision.verdictEmoji} ${pe.riskDecision.investmentVerdict}`),
    },
  ];
  const fv = pe.cagr.frameworkVerdict ? cleanVerdict(pe.cagr.frameworkVerdict) : '';
  if (fv && fv !== one) {
    bullets.push({ text: fv, tone: toneFromVerdict(pe.cagr.frameworkVerdict ?? '') });
  }
  bullets.push({
    text: `Test: ${pe.inputs.expectedCagrPct}% EPS CAGR · ${pe.inputs.years} years · ${pe.inputs.peBasis.toUpperCase()} P/E`,
    tone: 'neutral',
  });
  return bullets.slice(0, 4);
}

export function buildAnalysisSummarySlides(analysis: StockCalculatorFullResult): SummarySlide[] {
  const date = new Date(analysis.analyzedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return [
    {
      title: analysis.stockName,
      subtitle: `${analysis.ticker} · ${analysis.sector} · Stock Analysis · ${date}`,
      bullets: [
        { text: '60-second summary — positives, risks, module ranks', tone: 'neutral' },
        { text: 'Not investment advice · from your saved run', tone: 'neutral' },
      ],
    },
    {
      title: 'What looks supportive',
      bullets: pePositive(analysis),
    },
    {
      title: 'Risk lens',
      bullets: riskBullets(analysis),
    },
    {
      title: 'Module signals (this run)',
      rows: moduleRows(analysis),
    },
    {
      title: 'Overall',
      bullets: overallBullets(analysis),
    },
    {
      title: 'End',
      subtitle: `${analysis.stockName} (${analysis.ticker}) · ${date}`,
      bullets: [
        { text: 'Full detail: Stock Analysis → same saved report', tone: 'neutral' },
        { text: 'Re-run when CMP or results move materially', tone: 'neutral' },
        { text: 'Not investment advice', tone: 'neutral' },
      ],
    },
  ];
}

/** Slide count × duration ≈ 60s for YouTube capture */
export const SUMMARY_SLIDE_COUNT = 6;
export const SUMMARY_TOTAL_SECONDS = 60;
export const SUMMARY_SECONDS_PER_SLIDE = SUMMARY_TOTAL_SECONDS / SUMMARY_SLIDE_COUNT;
