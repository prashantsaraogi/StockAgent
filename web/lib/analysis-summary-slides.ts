/**
 * 60-second summary slides from a full Stock Analysis run (YouTube / share friendly).
 */

import type { StockCalculatorFullResult } from './stock-calculator-full';
import { resolveTtmForwardPeMetrics } from './pe-ttm-forward-metrics';

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

export interface SummarySlideCard {
  label: string;
  verdict: string;
  tone: SlideBulletTone;
}

export interface SummarySlideBar {
  label: string;
  value: number;
  max: number;
  display: string;
  tone?: SlideBulletTone;
}

export interface SummarySlideChart {
  heading: string;
  bars: SummarySlideBar[];
}

export interface SummarySlide {
  title: string;
  subtitle?: string;
  bullets?: SummarySlideBullet[];
  rows?: SummarySlideRow[];
  /** Overview-style module cards (no links — for video slide 1). */
  cards?: SummarySlideCard[];
  /** Horizontal bar charts (parameters / scores). */
  charts?: SummarySlideChart[];
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

function overviewCards(pe: StockCalculatorFullResult): SummarySlideCard[] {
  const o = pe.overview;
  const items: { label: string; verdict: string }[] = [
    { label: 'CAGR Evaluation', verdict: o.cagrVerdict },
    { label: 'PE Evaluation', verdict: o.peVerdict },
    { label: 'Earnings Quality', verdict: o.earningsQualityVerdict },
    { label: 'Margin Analysis', verdict: o.marginVerdict },
    { label: 'Business Quality', verdict: o.businessQualityVerdict },
    { label: 'Risk & Decision', verdict: o.riskVerdict },
  ];
  return items.map((item) => ({
    label: item.label,
    verdict: signalLabel(item.verdict),
    tone: toneFromVerdict(item.verdict),
  }));
}

function barToneScore10(score: number): SlideBulletTone {
  if (score >= 7.5) return 'good';
  if (score >= 5.5) return 'warn';
  return 'bad';
}

function valuationParameterCharts(a: StockCalculatorFullResult): SummarySlideChart[] {
  const peM = resolveTtmForwardPeMetrics(a);
  const ttm = peM.ttmPe;
  const fwd = peM.forwardPe;
  const avg10 = peM.avg10yPe;
  const fair = peM.forwardFairPe;
  const bars: SummarySlideBar[] = [];
  const values = [ttm, fwd, avg10, fair].filter((v): v is number => v != null && v > 0);
  const max = values.length > 0 ? Math.max(...values) * 1.08 : 50;

  if (ttm != null && ttm > 0) {
    bars.push({
      label: 'TTM P/E today',
      value: ttm,
      max,
      display: `${ttm.toFixed(1)}×`,
      tone:
        avg10 != null && ttm <= avg10
          ? 'good'
          : avg10 != null && ttm > avg10 * 1.15
            ? 'warn'
            : 'neutral',
    });
  }
  if (fwd != null && fwd > 0) {
    bars.push({
      label: 'Forward P/E',
      value: fwd,
      max,
      display: `${fwd.toFixed(1)}×`,
      tone:
        fair != null && fwd <= fair
          ? 'good'
          : fair != null && fwd > fair * 1.1
            ? 'warn'
            : 'neutral',
    });
  }
  if (avg10 != null && avg10 > 0) {
    bars.push({
      label: '10-year avg P/E',
      value: avg10,
      max,
      display: `${avg10.toFixed(1)}×`,
      tone: 'neutral',
    });
  }
  if (fair != null && fair > 0) {
    bars.push({
      label: 'Forward fair P/E',
      value: fair,
      max,
      display: `${fair.toFixed(1)}×`,
      tone: 'neutral',
    });
  }
  const prem = a.peParameters.premiumTo10yPct;
  if (prem != null && avg10 != null) {
    const premBar = Math.min(40, Math.max(0, Math.abs(prem)));
    bars.push({
      label: prem >= 0 ? 'Premium vs 10Y' : 'Discount vs 10Y',
      value: premBar,
      max: 40,
      display: `${prem >= 0 ? '+' : ''}${prem.toFixed(1)}%`,
      tone: prem <= 0 ? 'good' : prem > 15 ? 'warn' : 'neutral',
    });
  }
  if (bars.length === 0) {
    bars.push({
      label: 'P/E data',
      value: 1,
      max: 10,
      display: 'Refresh parameters',
      tone: 'neutral',
    });
  }
  return [{ heading: 'Valuation vs history', bars }];
}

function moduleScoreCharts(a: StockCalculatorFullResult): SummarySlideChart[] {
  const comps = a.riskDecision.components?.filter((c) => c.score10 > 0) ?? [];
  const bars: SummarySlideBar[] = comps.slice(0, 6).map((c) => ({
    label: c.label.replace(/\s*\(.*\)/, '').slice(0, 22),
    value: c.score10,
    max: 10,
    display: `${c.score10.toFixed(1)}/10`,
    tone: barToneScore10(c.score10),
  }));
  if (bars.length === 0) {
    bars.push({
      label: 'Business quality',
      value: a.businessQuality.businessQualityScore10,
      max: 10,
      display: `${a.businessQuality.businessQualityScore10.toFixed(1)}/10`,
      tone: barToneScore10(a.businessQuality.businessQualityScore10),
    });
  }
  return [{ heading: 'Module scores (0–10)', bars }];
}

function growthParameterCharts(a: StockCalculatorFullResult): SummarySlideChart[] {
  const gap = a.cagr.cagrGap;
  const expected = a.inputs.expectedCagrPct;
  const possible = gap.possibleCagrPct;
  const base = gap.frameworkBaseEpsCagrPct ?? a.cagr.quality.baseEpsCagrPct;
  const bars: SummarySlideBar[] = [];
  const nums = [expected, possible, base].filter((v): v is number => v != null);
  const max = nums.length > 0 ? Math.max(...nums) * 1.15 : 20;

  bars.push({
    label: 'Your CAGR test',
    value: expected,
    max,
    display: `${expected.toFixed(1)}%`,
    tone: gap.gapTone === 'negative' ? 'warn' : gap.gapTone === 'positive' ? 'good' : 'neutral',
  });
  if (possible != null) {
    bars.push({
      label: 'Supported band',
      value: possible,
      max,
      display: `${possible.toFixed(1)}%`,
      tone: 'neutral',
    });
  }
  if (base != null) {
    bars.push({
      label: 'Base EPS CAGR',
      value: base,
      max,
      display: `${base.toFixed(1)}%`,
      tone: 'neutral',
    });
  }
  const intH = a.cagr.internalRisk.haircutMidPp;
  const extH = a.cagr.externalRisk.haircutMidPp;
  if (intH > 0 || extH > 0) {
    bars.push({
      label: 'Risk haircut (max)',
      value: Math.max(intH, extH),
      max: 12,
      display: `−${Math.max(intH, extH).toFixed(1)} pp`,
      tone: Math.max(intH, extH) >= 5 ? 'warn' : 'neutral',
    });
  }
  return [{ heading: 'Growth & risk trim', bars }];
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
      title: 'Overview',
      subtitle: `${analysis.stockName} (${analysis.ticker}) · ${analysis.sector} · ${date}`,
      cards: overviewCards(analysis),
    },
    {
      title: 'Parameters · valuation',
      subtitle: `CMP ₹${Math.round(analysis.cagr.snapshot.cmp).toLocaleString('en-IN')} · ${analysis.inputs.peBasis.toUpperCase()} lens`,
      charts: valuationParameterCharts(analysis),
    },
    {
      title: 'Parameters · scores',
      charts: moduleScoreCharts(analysis),
    },
    {
      title: 'Parameters · growth',
      charts: growthParameterCharts(analysis),
    },
    {
      title: 'Risk lens',
      bullets: riskBullets(analysis),
    },
    {
      title: 'Overall',
      bullets: overallBullets(analysis),
    },
    {
      title: 'End',
      subtitle: `${analysis.stockName} · ${analysis.ticker}`,
      bullets: [
        { text: 'Re-run when price or results change materially', tone: 'neutral' },
        { text: 'Not investment advice', tone: 'neutral' },
      ],
    },
  ];
}

/** Total runtime for YouTube capture — duration per slide = total / slide count */
export const SUMMARY_TOTAL_SECONDS = 60;

export function summarySecondsPerSlide(slideCount: number): number {
  return SUMMARY_TOTAL_SECONDS / Math.max(1, slideCount);
}
