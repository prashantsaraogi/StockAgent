/**
 * PE Evaluation Scorecard — Part A/B/C from StockBook/PE-EVALUATION-FRAMEWORK.md
 */

import { readStockTabContent } from './content';
import { fetchLiveNseCmp } from './nse-cmp';
import { parseParametersMetrics } from './stock-calculator-engine';
import {
  parseFrameworkQualityMetrics,
  parseRiskFactor,
} from './stock-calculator-framework';
import {
  parseForwardGrowthTab,
  parseHistoricalGrowthTab,
} from './stock-calculator-tabs';
import { loadPeEvaluation, type PeEvaluationResult } from './pe-evaluation';

export type EvidenceType = 'FACT' | 'ASSUMPTION' | 'HYPOTHESIS' | 'UNVERIFIED';
export type ScoreSignal = -1 | 0 | 1;

export interface PeScorecardInput {
  ticker: string;
  purchasePrice: number;
  purchaseDate: string;
  tenantId: string;
}

export interface ScorecardMetric {
  id: string;
  label: string;
  value: string;
  signal: ScoreSignal;
  bucket: 'valuation' | 'business' | 'risk';
  note?: string;
}

export interface PeScorecardResult {
  ticker: string;
  stockName: string;
  sector: string;
  purchasePrice: number;
  purchaseDate: string;
  yearsHeld: number;
  priceReturnPct: number | null;
  cmp: number | null;
  cmpSource: string;
  stockbookParametersUrl: string;
  purchaseEps: number | null;
  purchaseEpsSource: EvidenceType;
  purchasePe: number | null;
  purchasePeBand: string;
  purchasePeTone: 'good' | 'neutral' | 'warn' | 'bad';
  epsToday: number | null;
  epsGrowthSincePurchasePct: number | null;
  epsGrowthBand: string;
  epsGrowthTone: 'good' | 'neutral' | 'warn' | 'bad';
  peCompressionPp: number | null;
  peCompressionRule: string;
  peCompressionTone: 'good' | 'neutral' | 'warn' | 'bad';
  metrics: ScorecardMetric[];
  rawScore: number;
  valuationScore10: number;
  businessScore10: number;
  riskScore10: number;
  weightedOverall10: number;
  freshVerdict: string;
  freshVerdictTone: 'good' | 'neutral' | 'warn' | 'bad';
  legacyVerdict: string;
  holderQuestions: { question: string; answer: string }[];
  parameters: PeEvaluationResult;
}

function parsePctFromCell(cell: string | null | undefined): number | null {
  if (!cell) return null;
  const m = cell.replace(/,/g, '').match(/(-?\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : null;
}

function yearsBetween(from: string, to: string): number {
  const a = new Date(`${from}T12:00:00`);
  const b = new Date(`${to}T12:00:00`);
  return Math.max(0, (b.getTime() - a.getTime()) / (365.25 * 86400000));
}

function classifyPurchasePe(pe: number): { band: string; tone: PeScorecardResult['purchasePeTone'] } {
  if (pe < 15) return { band: 'Cheap', tone: 'good' };
  if (pe < 20) return { band: 'Attractive', tone: 'good' };
  if (pe < 25) return { band: 'Reasonable', tone: 'neutral' };
  if (pe < 30) return { band: 'Premium', tone: 'warn' };
  if (pe < 40) return { band: 'Expensive', tone: 'bad' };
  return { band: 'Very expensive', tone: 'bad' };
}

function classifyEpsGrowth(pct: number): { band: string; tone: PeScorecardResult['epsGrowthTone'] } {
  if (pct > 50) return { band: 'Excellent', tone: 'good' };
  if (pct > 25) return { band: 'Good', tone: 'good' };
  if (pct > 10) return { band: 'Moderate', tone: 'neutral' };
  if (pct >= 0) return { band: 'Weak', tone: 'warn' };
  return { band: 'Bad', tone: 'bad' };
}

function bucketTo10(signals: ScoreSignal[]): number {
  if (signals.length === 0) return 5;
  const sum = signals.reduce<number>((a, b) => a + b, 0);
  const max = signals.length;
  return Math.round(((sum + max) / (2 * max)) * 100) / 10;
}

function rawToFreshVerdict(raw: number): { text: string; tone: PeScorecardResult['freshVerdictTone'] } {
  if (raw >= 6) return { text: 'BUY / ADD — strong business + reasonable valuation', tone: 'good' };
  if (raw >= 4) return { text: 'HOLD / selective ADD — good company, watch one factor', tone: 'good' };
  if (raw >= 2) return { text: 'HOLD — do not aggressively add fresh capital', tone: 'neutral' };
  if (raw >= 0) return { text: 'WAIT — risk/reward unattractive for fresh ₹', tone: 'warn' };
  return { text: 'AVOID fresh entry — multiple warning signs', tone: 'bad' };
}

function rawToLegacyVerdict(raw: number): string {
  if (raw >= 6) return 'HOLD legacy · selective add OK if PCCL/tier permits';
  if (raw >= 4) return 'HOLD legacy · token SIP only';
  if (raw >= 2) return 'HOLD legacy · pause new adds if overweight/expensive';
  if (raw >= 0) return 'HOLD legacy · 0% surplus · no TRIM for valuation alone';
  return 'HOLD legacy unless Tier-1 exit criteria · pause all adds · no avg-down to fix cost';
}

function signalPeVsHistory(currentPe: number | null, avg10y: number | null): ScoreSignal {
  if (currentPe == null || avg10y == null || avg10y <= 0) return 0;
  const prem = ((currentPe - avg10y) / avg10y) * 100;
  if (prem <= -8) return 1;
  if (prem >= 12) return -1;
  return 0;
}

function signalForwardPe(forwardPe: number | null, fairPe: number | null): ScoreSignal {
  if (forwardPe == null || fairPe == null || fairPe <= 0) return 0;
  const prem = ((forwardPe - fairPe) / fairPe) * 100;
  if (prem <= -5) return 1;
  if (prem >= 10) return -1;
  return 0;
}

function signalEpsGrowth(pct: number | null): ScoreSignal {
  if (pct == null) return 0;
  if (pct > 15) return 1;
  if (pct < 5) return -1;
  return 0;
}

function signalRoe(roe: number | null): ScoreSignal {
  if (roe == null) return 0;
  if (roe >= 15) return 1;
  if (roe < 12) return -1;
  return 0;
}

function signalMargin(read: string | null): ScoreSignal {
  if (!read) return 0;
  const r = read.toLowerCase();
  if (/strong|improv|recover|dominant|healthy|stable/.test(r)) return 1;
  if (/weak|compress|drag|fall|deterior/.test(r)) return -1;
  return 0;
}

function signalDebt(read: string | null): ScoreSignal {
  if (!read) return 0;
  const r = read.toLowerCase();
  if (/fortress|strong|safe|net cash|light|low/.test(r)) return 1;
  if (/high|elevated|stress|heavy/.test(r)) return -1;
  return 0;
}

function signalQuarterTrend(internalSummary: string | null): ScoreSignal {
  if (!internalSummary) return 0;
  const s = internalSummary.toLowerCase();
  if (/no material|none identified|low risk/.test(s)) return 1;
  if (/l2|l3|material|elevated|deterior/.test(s)) return -1;
  return 0;
}

export async function runPeEvaluationScorecard(
  input: PeScorecardInput
): Promise<PeScorecardResult | null> {
  const base = await loadPeEvaluation(input.ticker, input.tenantId);
  if (!base) return null;

  const today = new Date().toISOString().slice(0, 10);
  const yearsHeld = yearsBetween(input.purchaseDate, today);

  const parametersMd =
    (await readStockTabContent(base.sector, base.stockName, 'parameters', input.tenantId))
      ?.content ?? null;
  const internalMd =
    (await readStockTabContent(base.sector, base.stockName, 'internal-risk', input.tenantId))
      ?.content ?? null;

  const forward = parseForwardGrowthTab(parametersMd);
  const historical = parseHistoricalGrowthTab(parametersMd);
  const quality = parseFrameworkQualityMetrics(parametersMd, null);
  const internalRisk = parseRiskFactor(internalMd, 'internal-negative-risk.md');

  let cmp = base.cmp;
  let cmpSource = base.cmpSource;
  if (cmp == null) {
    const live = await fetchLiveNseCmp(base.ticker);
    if (live?.price) {
      cmp = live.price;
      cmpSource = live.source;
    }
  }

  const metricsParsed = parametersMd ? parseParametersMetrics(parametersMd) : null;
  const ttmPe = metricsParsed?.ttmPe ?? base.ttmPe;
  const forwardPe = metricsParsed?.forwardPe ?? base.forwardPe;
  const avg10yPe = metricsParsed?.avg10yPe ?? base.avg10yPe;
  const forwardFairPe = metricsParsed?.forwardFairPe ?? base.forwardFairPe;
  const normalizedEps = metricsParsed?.normalizedEps ?? base.normalizedEps;

  const epsToday =
    normalizedEps ??
    (cmp != null && ttmPe != null && ttmPe > 0 ? cmp / ttmPe : null);

  const epsCagrBasePct = parsePctFromCell(forward.epsCagrBase);

  let purchaseEps: number | null = null;
  let purchaseEpsSource: EvidenceType = 'UNVERIFIED';

  if (epsToday != null && epsCagrBasePct != null && yearsHeld > 0.08) {
    purchaseEps = epsToday / Math.pow(1 + epsCagrBasePct / 100, yearsHeld);
    purchaseEpsSource = 'ASSUMPTION';
  } else if (avg10yPe != null && avg10yPe > 0) {
    purchaseEps = input.purchasePrice / avg10yPe;
    purchaseEpsSource = 'HYPOTHESIS';
  }

  const purchasePe =
    purchaseEps != null && purchaseEps > 0 ? input.purchasePrice / purchaseEps : null;
  const purchaseClass =
    purchasePe != null ? classifyPurchasePe(purchasePe) : { band: 'Unknown', tone: 'neutral' as const };

  const epsGrowthSincePurchasePct =
    epsToday != null && purchaseEps != null && purchaseEps > 0
      ? (epsToday / purchaseEps - 1) * 100
      : null;
  const epsGrowthClass =
    epsGrowthSincePurchasePct != null
      ? classifyEpsGrowth(epsGrowthSincePurchasePct)
      : { band: 'Unknown', tone: 'neutral' as const };

  const peCompressionPp =
    purchasePe != null && ttmPe != null ? ttmPe - purchasePe : null;

  let peCompressionRule = 'Insufficient data for P/E × EPS rule';
  let peCompressionTone: PeScorecardResult['peCompressionTone'] = 'neutral';
  if (peCompressionPp != null && epsGrowthSincePurchasePct != null) {
    const peDown = peCompressionPp < -1;
    const peUp = peCompressionPp > 1;
    const epsUp = epsGrowthSincePurchasePct > 5;
    const epsDown = epsGrowthSincePurchasePct < 0;
    if (peDown && epsUp) {
      peCompressionRule =
        'P/E ↓ + EPS ↑ — usually healthy (business improved, market less euphoric)';
      peCompressionTone = 'good';
    } else if (peDown && epsDown) {
      peCompressionRule = 'P/E ↓ + EPS ↓ — warning';
      peCompressionTone = 'bad';
    } else if (peUp && epsDown) {
      peCompressionRule = 'P/E ↑ + EPS ↓ — dangerous';
      peCompressionTone = 'bad';
    } else if (peUp && epsUp) {
      peCompressionRule = 'P/E ↑ + EPS ↑ — growth priced in; check forward P/E';
      peCompressionTone = 'warn';
    } else {
      peCompressionRule = 'Mixed — review forward earnings and PARAMETERS Part 2';
      peCompressionTone = 'neutral';
    }
  }

  const priceReturnPct =
    cmp != null && input.purchasePrice > 0
      ? ((cmp - input.purchasePrice) / input.purchasePrice) * 100
      : null;

  const revenueGrowthCell = forward.volumeCagr ?? historical.epsCagrHist;
  const revenueGrowthPct = parsePctFromCell(revenueGrowthCell);

  const metrics: ScorecardMetric[] = [
    {
      id: 'current-pe',
      label: 'Current P/E vs 10Y history',
      value:
        ttmPe != null && avg10yPe != null
          ? `${ttmPe.toFixed(1)}× vs ${avg10yPe.toFixed(1)}× avg`
          : '—',
      signal: signalPeVsHistory(ttmPe, avg10yPe),
      bucket: 'valuation',
    },
    {
      id: 'forward-pe',
      label: 'Forward P/E vs forward fair P/E',
      value:
        forwardPe != null && forwardFairPe != null
          ? `${forwardPe.toFixed(1)}× vs ${forwardFairPe.toFixed(1)}× fair`
          : '—',
      signal: signalForwardPe(forwardPe, forwardFairPe),
      bucket: 'valuation',
      note: 'Confirmatory only — see PARAMETERS-FRAMEWORK',
    },
    {
      id: 'eps-growth',
      label: 'EPS growth since purchase',
      value:
        epsGrowthSincePurchasePct != null
          ? `${epsGrowthSincePurchasePct.toFixed(1)}%`
          : forward.epsCagrBase
            ? `Forward base ${forward.epsCagrBase} (no purchase EPS)`
            : '—',
      signal: signalEpsGrowth(epsGrowthSincePurchasePct ?? epsCagrBasePct),
      bucket: 'business',
      note: `Purchase EPS: ${purchaseEpsSource}`,
    },
    {
      id: 'revenue-growth',
      label: 'Revenue / volume growth',
      value: revenueGrowthCell ?? '—',
      signal: signalEpsGrowth(revenueGrowthPct),
      bucket: 'business',
    },
    {
      id: 'margin',
      label: 'Operating margin (EBITDA)',
      value: quality.ebitdaDisplay,
      signal: signalMargin(quality.ebitdaRead),
      bucket: 'business',
    },
    {
      id: 'roe',
      label: 'ROCE / ROE',
      value: quality.roeDisplay,
      signal: signalRoe(quality.roePct),
      bucket: 'business',
    },
    {
      id: 'debt',
      label: 'Debt / balance sheet',
      value: quality.debtDisplay,
      signal: signalDebt(quality.debtRead),
      bucket: 'risk',
    },
    {
      id: 'quarter-trend',
      label: 'Recent quarter / risk trend',
      value: internalRisk.summary.slice(0, 80),
      signal: signalQuarterTrend(internalRisk.summary),
      bucket: 'risk',
    },
  ];

  const rawScore = metrics.reduce((s, m) => s + m.signal, 0);
  const valuationScore10 = bucketTo10(
    metrics.filter((m) => m.bucket === 'valuation').map((m) => m.signal)
  );
  const businessScore10 = bucketTo10(
    metrics.filter((m) => m.bucket === 'business').map((m) => m.signal)
  );
  const riskScore10 = bucketTo10(metrics.filter((m) => m.bucket === 'risk').map((m) => m.signal));
  const weightedOverall10 =
    Math.round((valuationScore10 * 0.4 + businessScore10 * 0.4 + riskScore10 * 0.2) * 10) / 10;

  const fresh = rawToFreshVerdict(rawScore);

  const wouldBuyToday =
    cmp != null
      ? rawScore >= 4
        ? `Yes — at ₹${cmp.toLocaleString('en-IN')} the scorecard supports fresh entry (subject to PCCL & buy workflow).`
        : rawScore >= 2
          ? `Neutral — at ₹${cmp.toLocaleString('en-IN')} only token/staged size; rank vs surplus alternatives.`
          : `No — at ₹${cmp.toLocaleString('en-IN')} fresh capital should wait; ignore anchor at ₹${input.purchasePrice.toLocaleString('en-IN')}.`
      : 'CMP unavailable — verify live quote.';

  const holderQuestions = [
    { question: 'Would I buy today at CMP?', answer: wouldBuyToday },
    {
      question: 'Is the business better or worse than at purchase?',
      answer:
        epsGrowthSincePurchasePct != null && epsGrowthSincePurchasePct > 10
          ? 'Better — EPS materially higher since purchase.'
          : epsGrowthSincePurchasePct != null && epsGrowthSincePurchasePct < 0
            ? 'Worse — EPS below purchase-era level.'
            : 'Mixed / moderate — check latest results and PARAMETERS.',
    },
    {
      question: 'Are earnings higher or lower than when I bought?',
      answer:
        epsToday != null && purchaseEps != null
          ? `EPS ~₹${purchaseEps.toFixed(0)} at purchase (${purchaseEpsSource}) → ~₹${epsToday.toFixed(0)} today.`
          : 'UNVERIFIED — add purchase-era EPS from filings for FACT.',
    },
    {
      question: "Is today's P/E justified by today's/future earnings?",
      answer:
        forward.forwardVerdict ??
        forward.addCase ??
        historical.part1Verdict ??
        'See PARAMETERS Part 2 forward IV premium.',
    },
    {
      question: 'Better stock at same valuation for fresh ₹?',
      answer:
        'Rank vs quadrant-map and sector peers — scorecard is per-stock only; no sell-to-rotate.',
    },
  ];

  return {
    ticker: base.ticker,
    stockName: base.stockName,
    sector: base.sector,
    purchasePrice: input.purchasePrice,
    purchaseDate: input.purchaseDate,
    yearsHeld: Math.round(yearsHeld * 10) / 10,
    priceReturnPct,
    cmp,
    cmpSource,
    stockbookParametersUrl: base.stockbookParametersUrl,
    purchaseEps,
    purchaseEpsSource,
    purchasePe,
    purchasePeBand: purchaseClass.band,
    purchasePeTone: purchaseClass.tone,
    epsToday,
    epsGrowthSincePurchasePct,
    epsGrowthBand: epsGrowthClass.band,
    epsGrowthTone: epsGrowthClass.tone,
    peCompressionPp,
    peCompressionRule,
    peCompressionTone,
    metrics,
    rawScore,
    valuationScore10,
    businessScore10,
    riskScore10,
    weightedOverall10,
    freshVerdict: fresh.text,
    freshVerdictTone: fresh.tone,
    legacyVerdict: rawToLegacyVerdict(rawScore),
    holderQuestions,
    parameters: base,
  };
}
