/** Tab-specific analysis slices for Stock Calculator UI. */

import type { PeBasis, PeSnapshot, ProjectionScenario } from './stock-calculator-engine';
import type {
  CagrGapAnalysis,
  FrameworkQualityMetrics,
  RiskFactorResult,
} from './stock-calculator-framework';

export type CalculatorTabId =
  | 'valuation'
  | 'risk'
  | 'forward-growth'
  | 'historical-growth'
  | 'profitability'
  | 'entry-approach';

export const CALCULATOR_TABS: { id: CalculatorTabId; label: string }[] = [
  { id: 'valuation', label: 'Valuation' },
  { id: 'risk', label: 'Risk' },
  { id: 'forward-growth', label: 'Forward Growth' },
  { id: 'historical-growth', label: 'Historical Growth' },
  { id: 'profitability', label: 'Profitability' },
  { id: 'entry-approach', label: 'Entry Approach' },
];

export interface ParamCompareRow {
  parameter: string;
  avg10y: string;
  today: string;
  read: string;
}

export interface HistoricalGrowthTab {
  part1Verdict: string | null;
  cheapOrExpensive: string | null;
  peToday: string | null;
  pe10yAvg: string | null;
  premiumToIv: string | null;
  ownerEarningsYield: string | null;
  epsCagrHist: string | null;
  rows: ParamCompareRow[];
}

export interface ForwardGrowthTab {
  epsCagrBase: string | null;
  epsCagrPessimistic: string | null;
  epsCagrOptimistic: string | null;
  forwardFairPe: string | null;
  framework5yFairPrice: string | null;
  implied5yPriceCagr: string | null;
  forwardPremiumIv: string | null;
  forwardVerdict: string | null;
  volumeCagr: string | null;
  addCase: string | null;
}

export interface EntryApproachTab {
  stockbookVerdict: string | null;
  axisBValue: string | null;
  axisATier: string | null;
  sipPace: string | null;
  monthlyPace: string | null;
  blendedCeiling: string | null;
  holderAction: string | null;
  approachExcerpt: string | null;
}

export interface CalculatorTabAnalysis {
  historical: HistoricalGrowthTab;
  forward: ForwardGrowthTab;
  entry: EntryApproachTab;
}

function cleanCell(raw: string | undefined): string {
  return (raw ?? '').replace(/\*\*/g, '').trim() || '—';
}

function extractTableRow(md: string, paramPattern: string): ParamCompareRow | null {
  const re = new RegExp(
    `\\|\\s*\\*\\*${paramPattern}[^|]*\\*\\*[^\\n]*\\|[^\\n]*\\|[^\\n]*\\|[^\\n]*\\|\\s*([^|]+?)\\s*\\|\\s*[^|]*\\|\\s*([^|]+?)\\s*\\|\\s*([^|]+?)\\s*\\|`,
    'i'
  );
  const m = md.match(re);
  if (!m) return null;
  return {
    parameter: paramPattern.replace(/\\[()]/g, (c) => (c === '(' ? '(' : ')')),
    avg10y: cleanCell(m[1]),
    today: cleanCell(m[2]),
    read: cleanCell(m[3]),
  };
}

function extractQuickRead(md: string, label: string): string | null {
  const re = new RegExp(`\\|\\s*\\*\\*${label}[^|]*\\*\\*[^\\n]*\\|[^\\n]*\\|[^\\n]*\\|\\s*\\*\\*([^*]+?)\\*\\*`, 'i');
  const m = md.match(re);
  return m ? cleanCell(m[1]) : null;
}

function extractAssumptionCell(md: string, label: string, column: 'base' | 'pessimistic' | 'optimistic'): string | null {
  const rowRe = new RegExp(
    `\\|\\s*\\*\\*${label}[^|]*\\*\\*[^\\n]*\\|([^|]+)\\|([^|]+)\\|([^|]+)\\|`,
    'i'
  );
  const m = md.match(rowRe);
  if (!m) return null;
  const idx = column === 'pessimistic' ? 1 : column === 'base' ? 2 : 3;
  return cleanCell(m[idx]);
}

function extractApproachField(md: string, label: string): string | null {
  const re = new RegExp(`\\|\\s*\\*\\*${label}\\*\\*[^\\n]*\\|\\s*\\*\\*([^*]+?)\\*\\*`, 'i');
  const m = md.match(re);
  if (m) return cleanCell(m[1]);
  const re2 = new RegExp(`\\|\\s*\\*\\*${label}\\*\\*[^\\n]*\\|\\s*([^|]+?)\\s*\\|`, 'i');
  const m2 = md.match(re2);
  return m2 ? cleanCell(m2[1]) : null;
}

function clip(text: string, max = 1200): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + '…';
}

export function parseHistoricalGrowthTab(parametersMd: string | null): HistoricalGrowthTab {
  const md = parametersMd ?? '';
  const rows: ParamCompareRow[] = [];

  for (const p of ['P/E', 'Owner Earnings Yield', 'Premium to IV', 'ROE', 'EBITDA margin', 'P/B']) {
    const row = extractTableRow(md, p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (row) rows.push(row);
  }

  const peRow = rows.find((r) => r.parameter === 'P/E');
  const oeyRow = rows.find((r) => r.parameter === 'Owner Earnings Yield');
  const ivRow = rows.find((r) => r.parameter === 'Premium to IV');

  const epsHist = md.match(/\|\s*\*\*EPS CAGR \(5Y\)\*\*[\s\S]*?\|\s*([\d.]+\s*%)\s*\|\s*\*\*([\d.]+\s*%)\*\*/i);

  let cheapOrExpensive: string | null = null;
  const pastForward = md.match(/\|\s*\*\*Cheap or expensive\?\*\*[^\n]*\|\s*([^|]+)\|/i);
  if (pastForward) cheapOrExpensive = cleanCell(pastForward[1]);

  let part1Verdict: string | null = null;
  const part1Col = md.match(/\|\s*\*\*Cheap or expensive\?\*\*[^\n]*\|\s*\*\*([^*]+?)\*\*/i);
  if (part1Col) part1Verdict = cleanCell(part1Col[1]);

  return {
    part1Verdict,
    cheapOrExpensive,
    peToday: peRow?.today ?? null,
    pe10yAvg: peRow?.avg10y ?? null,
    premiumToIv: ivRow?.today ?? null,
    ownerEarningsYield: oeyRow?.today ?? null,
    epsCagrHist: epsHist ? `${cleanCell(epsHist[1])} → base ${cleanCell(epsHist[2])}` : null,
    rows,
  };
}

export function parseForwardGrowthTab(parametersMd: string | null): ForwardGrowthTab {
  const md = parametersMd ?? '';

  const implied = md.match(
    /\|\s*\*\*Implied 5Y price CAGR\*\*[\s\S]*?\|\s*[^|]+\|\s*[^|]+\|\s*[^|]+\|\s*[^|]+\|\s*\*\*\+?([\d.]+\s*%)\*\*/i
  );

  const fairPrice = md.match(
    /\|\s*\*\*5Y fair price \(base\)\*\*[\s\S]*?\|\s*[^|]+\|\s*[^|]+\|\s*\*\*Rs\s*([\d,]+(?:\.\d+)?)\*\*/i
  );

  const forwardPrem = md.match(
    /\|\s*\*\*Premium to forward IV\*\*[\s\S]*?\|\s*\*\*([^*]+?)\*\*/i
  );

  let forwardVerdict: string | null = null;
  const acceptable = md.match(/\|\s*\*\*Acceptable 5Y return\?\*\*[^\n]*\|\s*N\/A\s*\|\s*([^|]+)\|/i);
  if (acceptable) forwardVerdict = cleanCell(acceptable[1]);

  const volume = md.match(/\|\s*\*\*Volume CAGR[^|]*\*\*[^\n]*\|\s*\*\*([^*]+?)\*\*/i);

  return {
    epsCagrBase: extractAssumptionCell(md, 'EPS CAGR \\(5Y\\)', 'base'),
    epsCagrPessimistic: extractAssumptionCell(md, 'EPS CAGR \\(5Y\\)', 'pessimistic'),
    epsCagrOptimistic: extractAssumptionCell(md, 'EPS CAGR \\(5Y\\)', 'optimistic'),
    forwardFairPe: extractAssumptionCell(md, 'Forward fair P/E', 'base'),
    framework5yFairPrice: fairPrice ? `₹${cleanCell(fairPrice[1])}` : null,
    implied5yPriceCagr: implied ? cleanCell(implied[1]) : null,
    forwardPremiumIv: forwardPrem ? cleanCell(forwardPrem[1]) : null,
    forwardVerdict,
    volumeCagr: volume ? cleanCell(volume[1]) : null,
    addCase: extractQuickRead(md, 'ADD case\\?'),
  };
}

export function parseEntryApproachTab(
  approachMd: string | null,
  parametersMd: string | null
): EntryApproachTab {
  const approach = approachMd ?? '';
  const params = parametersMd ?? '';

  let approachExcerpt: string | null = null;
  const tierSection = approach.match(/## Valuation tier[\s\S]*?(?=##|$)/i);
  if (tierSection) {
    approachExcerpt = clip(tierSection[0].trim(), 900);
  } else if (approach) {
    approachExcerpt = clip(approach.replace(/^#.*\n/, ''), 900);
  }

  let holderAction: string | null = null;
  const holder = params.match(/\|\s*\*\*Holder action\*\*[^\n]*\|\s*[^|]+\|\s*([^|]+)\|/i);
  if (holder) holderAction = cleanCell(holder[1]);

  const axisB = approach.match(/\|\s*\*\*Current value \(B\)\*\*[^\n]*\|\s*\*\*([^*]+?)\*\*/i);
  const axisBAlt = approach.match(/\|\s*\*\*Reading\*\*[^\n]*\|\s*Tier[^\n]*\|\s*\*\*([^*]+?)\*\*/i);

  return {
    stockbookVerdict: extractApproachField(approach, 'Current value @ CMP') ?? extractQuickRead(params, 'ADD case\\?'),
    axisBValue: axisB ? cleanCell(axisB[1]) : axisBAlt ? cleanCell(axisBAlt[1]) : null,
    axisATier: extractApproachField(approach, 'Label'),
    sipPace: extractApproachField(approach, 'SIP stance'),
    monthlyPace: extractApproachField(approach, 'Monthly pace'),
    blendedCeiling: extractApproachField(approach, 'Blended ceiling'),
    holderAction,
    approachExcerpt,
  };
}

export function buildCalculatorTabAnalysis(
  parametersMd: string | null,
  approachMd: string | null
): CalculatorTabAnalysis {
  return {
    historical: parseHistoricalGrowthTab(parametersMd),
    forward: parseForwardGrowthTab(parametersMd),
    entry: parseEntryApproachTab(approachMd, parametersMd),
  };
}

/** Minimal tab analysis for older saved runs without persisted tab fields. */
export function buildFallbackTabAnalysis(
  snapshot: PeSnapshot,
  quality: FrameworkQualityMetrics
): CalculatorTabAnalysis {
  return {
    historical: {
      part1Verdict: null,
      cheapOrExpensive: null,
      peToday: snapshot.ttmPe != null ? `${snapshot.ttmPe.toFixed(1)}×` : null,
      pe10yAvg: snapshot.avg10yPe != null ? `${snapshot.avg10yPe.toFixed(1)}×` : null,
      premiumToIv: null,
      ownerEarningsYield: null,
      epsCagrHist: quality.baseEpsCagrRange,
      rows: [],
    },
    forward: {
      epsCagrBase: quality.baseEpsCagrRange,
      epsCagrPessimistic: null,
      epsCagrOptimistic: null,
      forwardFairPe: snapshot.forwardFairPe != null ? `${snapshot.forwardFairPe.toFixed(1)}×` : null,
      framework5yFairPrice:
        snapshot.framework5yFairPrice != null
          ? `₹${Math.round(snapshot.framework5yFairPrice).toLocaleString('en-IN')}`
          : null,
      implied5yPriceCagr:
        quality.impliedPriceCagrPct != null ? `${quality.impliedPriceCagrPct.toFixed(1)}%` : null,
      forwardPremiumIv: null,
      forwardVerdict: null,
      volumeCagr: null,
      addCase: null,
    },
    entry: {
      stockbookVerdict: null,
      axisBValue: null,
      axisATier: null,
      sipPace: null,
      monthlyPace: null,
      blendedCeiling: null,
      holderAction: null,
      approachExcerpt: null,
    },
  };
}

export interface CalculatorPanelData {
  ticker: string;
  stockName: string;
  peBasis: PeBasis;
  years: number;
  expectedCagrPct: number;
  anchorPe: number;
  anchorEps: number;
  projectedEps: number;
  impliedVerdict: string;
  frameworkVerdict?: string;
  reportMode?: 'framework-local' | 'gemini';
  report?: string;
  snapshot: PeSnapshot;
  quality: FrameworkQualityMetrics;
  internalRisk: RiskFactorResult;
  externalRisk: RiskFactorResult;
  cagrGap: CagrGapAnalysis;
  scenarios: ProjectionScenario[];
  investmentAmountInr?: number | null;
  tabAnalysis: CalculatorTabAnalysis;
}
