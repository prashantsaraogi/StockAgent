/**
 * Earnings Quality Part A (5Y rear-view) + Part B (5Y forward, risk-adjusted)
 * StockBook/EARNINGS-QUALITY-FRAMEWORK.md
 */

import type { EvidenceType, QualityTone } from './earnings-quality';
import type { FrameworkQualityMetrics, RiskFactorResult } from './stock-calculator-framework';

export interface HistoricalYearRow {
  fiscalYear: string;
  revenueCr: number | null;
  patCr: number | null;
  eps: number | null;
  epsYoYPct: number | null;
  revenueYoYPct: number | null;
  cfoPatRatio: number | null;
  qualitySignal: '🟢' | '🟡' | '🔴' | '—';
  evidence: EvidenceType;
  note?: string;
}

export interface EarningsQualityPartA {
  title: string;
  years: HistoricalYearRow[];
  epsCagr5y: number | null;
  patCagr5y: number | null;
  revenueCagr5y: number | null;
  cashQualityNote: string;
  verdict: string;
  tone: QualityTone;
  dataComplete: boolean;
}

export interface ForwardYearRow {
  fiscalYear: string;
  baseEpsGrowthPct: number;
  internalHaircutPp: number;
  externalHaircutPp: number;
  effectiveHaircutPp: number;
  adjustedEpsGrowthPct: number;
  projectedEps: number;
  internalFactor: string;
  externalFactor: string;
  evidence: EvidenceType;
}

export interface EarningsQualityPartB {
  title: string;
  years: ForwardYearRow[];
  startingEps: number;
  baseEpsCagrPct: number;
  internalRisk: RiskFactorResult;
  externalRisk: RiskFactorResult;
  currentYearHighlight: string;
  verdict: string;
  tone: QualityTone;
  aiEnriched: boolean;
}

function parseNum(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const s = raw.replace(/,/g, '').replace(/[₹Rs.%cr\s]/gi, '').trim();
  if (!s || s === '—' || s === '-') return null;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

function parseEvidence(cell: string | undefined): EvidenceType {
  const s = (cell ?? '').toUpperCase();
  if (s.includes('FACT')) return 'FACT';
  if (s.includes('MANAGEMENT')) return 'MANAGEMENT CLAIM';
  if (s.includes('HYPOTHESIS')) return 'HYPOTHESIS';
  if (s.includes('ASSUMPTION')) return 'OUR ASSUMPTION';
  return 'UNVERIFIED';
}

function parseQualitySignal(cell: string | undefined): HistoricalYearRow['qualitySignal'] {
  const s = cell ?? '';
  if (s.includes('🟢') || /healthy|strong/i.test(s)) return '🟢';
  if (s.includes('🔴') || /warn|weak|bad/i.test(s)) return '🔴';
  if (s.includes('🟡') || /mixed|moderate/i.test(s)) return '🟡';
  return '—';
}

function cagrFromSeries(values: number[]): number | null {
  if (values.length < 2) return null;
  const first = values[0];
  const last = values[values.length - 1];
  if (first <= 0 || last <= 0) return null;
  const years = values.length - 1;
  return (Math.pow(last / first, 1 / years) - 1) * 100;
}

function toneFromPartA(epsCagr: number | null, hasWarningYears: boolean): QualityTone {
  if (hasWarningYears) return 'warn';
  if (epsCagr == null) return 'neutral';
  if (epsCagr >= 12) return 'good';
  if (epsCagr >= 5) return 'neutral';
  return 'bad';
}

function toneFromPartB(adjustedFirstYear: number, base: number): QualityTone {
  if (adjustedFirstYear >= base * 0.85) return 'good';
  if (adjustedFirstYear >= base * 0.6) return 'warn';
  return 'bad';
}

/** Parse `## Part A — Five-year rear-view` table from EARNINGS_QUALITY file. */
export function parsePartAFromMarkdown(md: string): HistoricalYearRow[] {
  const section =
    md.match(/## Part A[^\n]*\n([\s\S]*?)(?=\n## Part B|\n## [A-D]\.|\n---\n|$)/i)?.[1] ?? '';
  const rows: HistoricalYearRow[] = [];

  for (const line of section.split('\n')) {
    if (!line.trim().startsWith('|') || /FY|Metric|---/i.test(line) && /FY/i.test(line) === false)
      continue;
    if (/^\|\s*FY/i.test(line) || /---/.test(line)) continue;

    const cells = line
      .split('|')
      .map((c) => c.trim())
      .filter(Boolean);
    if (cells.length < 4 || !/^FY/i.test(cells[0])) continue;

    rows.push({
      fiscalYear: cells[0],
      revenueCr: parseNum(cells[1]),
      patCr: parseNum(cells[2]),
      eps: parseNum(cells[3]),
      epsYoYPct: parseNum(cells[4]),
      revenueYoYPct: parseNum(cells[5]),
      cfoPatRatio: parseNum(cells[6]),
      qualitySignal: parseQualitySignal(cells[7]),
      evidence: parseEvidence(cells[cells.length - 1]),
      note: cells.length > 9 ? cells[8] : undefined,
    });
  }

  return rows.slice(-5);
}

/** Synthesize 5Y EPS path from latest EPS + 5Y CAGR when table missing. */
export function synthesizePartAFromCagr(
  latestEps: number | null,
  epsCagr5yPct: number | null,
  revCagr5yPct: number | null,
  patCagr5yPct: number | null
): HistoricalYearRow[] {
  if (latestEps == null || epsCagr5yPct == null) return [];

  const cagr = epsCagr5yPct / 100;
  const years: HistoricalYearRow[] = [];
  const currentFy = new Date().getMonth() >= 3 ? new Date().getFullYear() + 1 : new Date().getFullYear();
  const endFy = currentFy - 1;

  for (let i = 4; i >= 0; i--) {
    const fy = endFy - i;
    const eps = latestEps / Math.pow(1 + cagr, i);
    years.push({
      fiscalYear: `FY${String(fy).slice(-2)}`,
      revenueCr: null,
      patCr: null,
      eps: Math.round(eps * 10) / 10,
      epsYoYPct: i === 0 ? null : Math.round(epsCagr5yPct * 10) / 10,
      revenueYoYPct: revCagr5yPct,
      cfoPatRatio: null,
      qualitySignal: '—',
      evidence: 'OUR ASSUMPTION',
      note: i > 0 ? 'Back-calculated from latest EPS + 5Y CAGR' : 'Latest TTM/proxy',
    });
  }

  // Recompute YoY from synthesized EPS
  for (let i = 1; i < years.length; i++) {
    const prev = years[i - 1].eps!;
    const cur = years[i].eps!;
    if (prev > 0) years[i].epsYoYPct = Math.round(((cur - prev) / prev) * 1000) / 10;
  }

  if (patCagr5yPct != null) {
    years[years.length - 1].note = `${years[years.length - 1].note ?? ''} · PAT CAGR ${patCagr5yPct}%`.trim();
  }

  return years;
}

export function buildPartA(input: {
  eqMd: string;
  latestEps: number | null;
  epsCagr5y: number | null;
  patCagr5y: number | null;
  revCagr5y: number | null;
  cfoPatRatio: number | null;
}): EarningsQualityPartA {
  let years = parsePartAFromMarkdown(input.eqMd);
  let dataComplete = years.length >= 4;

  if (years.length === 0) {
    years = synthesizePartAFromCagr(
      input.latestEps,
      input.epsCagr5y,
      input.revCagr5y,
      input.patCagr5y
    );
  }

  const epsSeries = years.map((y) => y.eps).filter((v): v is number => v != null && v > 0);
  const patSeries = years.map((y) => y.patCr).filter((v): v is number => v != null && v > 0);
  const revSeries = years.map((y) => y.revenueCr).filter((v): v is number => v != null && v > 0);

  const epsCagr5y =
    epsSeries.length >= 2 ? cagrFromSeries(epsSeries) : input.epsCagr5y;
  const patCagr5y =
    patSeries.length >= 2 ? cagrFromSeries(patSeries) : input.patCagr5y;
  const revenueCagr5y =
    revSeries.length >= 2 ? cagrFromSeries(revSeries) : input.revCagr5y;

  const hasWarning = years.some((y) => y.qualitySignal === '🔴' || (y.epsYoYPct != null && y.epsYoYPct < 0));
  const tone = toneFromPartA(epsCagr5y, hasWarning);

  let verdict: string;
  if (!dataComplete && years.length > 0) {
    verdict = '🟡 Mixed — 5Y EPS path estimated from CAGR; add Part A table in StockBook for FY-level FACT';
  } else if (epsCagr5y != null && epsCagr5y >= 10 && !hasWarning) {
    verdict = '🟢 Healthy — 5Y EPS compounding with consistent growth';
  } else if (hasWarning || (epsCagr5y != null && epsCagr5y < 5)) {
    verdict = '🟡 Mixed — rear-view shows weak or uneven EPS years';
  } else {
    verdict = '🟡 Moderate — 5Y EPS growth positive but not compounder-grade';
  }

  const cashQualityNote =
    input.cfoPatRatio != null
      ? input.cfoPatRatio >= 0.8
        ? `CFO/PAT ${input.cfoPatRatio.toFixed(2)} — cash backs earnings`
        : `CFO/PAT ${input.cfoPatRatio.toFixed(2)} — accrual flag`
      : 'CFO/PAT UNVERIFIED — refresh from annual report';

  return {
    title: 'Part A — Five-year rear-view (historical earnings quality)',
    years,
    epsCagr5y: epsCagr5y != null ? Math.round(epsCagr5y * 10) / 10 : null,
    patCagr5y: patCagr5y != null ? Math.round(patCagr5y * 10) / 10 : null,
    revenueCagr5y: revenueCagr5y != null ? Math.round(revenueCagr5y * 10) / 10 : null,
    cashQualityNote,
    verdict,
    tone,
    dataComplete,
  };
}

/** External haircut tapers for temporary L1/L2 risks in outer years. */
function yearExternalHaircut(basePp: number, yearIndex: number, level: string): number {
  if (basePp <= 0) return 0;
  if (level.includes('L3')) return basePp;
  const taper = [1, 0.85, 0.7, 0.55, 0.45][yearIndex] ?? 0.4;
  return Math.round(basePp * taper * 10) / 10;
}

function yearInternalHaircut(basePp: number, yearIndex: number): number {
  if (basePp <= 0) return 0;
  const taper = [1, 0.9, 0.8, 0.75, 0.7][yearIndex] ?? 0.65;
  return Math.round(basePp * taper * 10) / 10;
}

export function buildPartB(input: {
  startingEps: number;
  quality: FrameworkQualityMetrics;
  internalRisk: RiskFactorResult;
  externalRisk: RiskFactorResult;
  aiYearNotes?: Record<string, string>;
}): EarningsQualityPartB {
  const baseEpsCagrPct =
    input.quality.baseEpsCagrPct ?? 8;
  const intBase = input.internalRisk.haircutMidPp;
  const extBase = input.externalRisk.haircutMidPp;
  const intFactor =
    input.internalRisk.topRisks[0] ??
    input.internalRisk.summary.slice(0, 80) ??
    'No internal risks parsed';
  const extFactor =
    input.externalRisk.topRisks[0] ??
    input.externalRisk.summary.slice(0, 80) ??
    'No external risks parsed';

  const currentMonth = new Date().getMonth();
  const startFyNum =
    currentMonth >= 3
      ? new Date().getFullYear() + 1
      : new Date().getFullYear();

  const years: ForwardYearRow[] = [];
  let eps = input.startingEps;

  for (let i = 0; i < 5; i++) {
    const fyNum = startFyNum + i;
    const fiscalYear = `FY${String(fyNum).slice(-2)}`;
    const intHair = yearInternalHaircut(intBase, i);
    const extHair = yearExternalHaircut(
      extBase,
      i,
      input.externalRisk.level
    );
    const effectiveHair = Math.max(intHair, extHair);
    const adjusted = Math.max(-5, baseEpsCagrPct - effectiveHair);
    eps = eps * (1 + adjusted / 100);

    const aiNote = input.aiYearNotes?.[fiscalYear];
    years.push({
      fiscalYear,
      baseEpsGrowthPct: baseEpsCagrPct,
      internalHaircutPp: intHair,
      externalHaircutPp: extHair,
      effectiveHaircutPp: effectiveHair,
      adjustedEpsGrowthPct: Math.round(adjusted * 10) / 10,
      projectedEps: Math.round(eps * 10) / 10,
      internalFactor: aiNote ? `${intFactor} · ${aiNote}` : intFactor,
      externalFactor: extFactor,
      evidence: input.aiYearNotes ? 'HYPOTHESIS' : 'OUR ASSUMPTION',
    });
  }

  const currentYear = years[0];
  const currentYearHighlight =
    extBase >= 3
      ? `Current year (${currentYear.fiscalYear}): external risk elevated — effective haircut ${currentYear.effectiveHaircutPp} pp (${input.externalRisk.level}). ${extFactor}`
      : intBase >= 3
        ? `Current year: internal execution risk — haircut ${currentYear.effectiveHaircutPp} pp. ${intFactor}`
        : `Current year: moderate risk overlay — base ${baseEpsCagrPct}% → adjusted ${currentYear.adjustedEpsGrowthPct}%`;

  const tone = toneFromPartB(currentYear.adjustedEpsGrowthPct, baseEpsCagrPct);
  const endEps = years[years.length - 1].projectedEps;
  const implied5yCagr =
    input.startingEps > 0
      ? (Math.pow(endEps / input.startingEps, 1 / 5) - 1) * 100
      : null;

  let verdict: string;
  if (currentYear.adjustedEpsGrowthPct < 5) {
    verdict = '🔴 Warning — risk-adjusted near-term EPS growth weak';
  } else if (implied5yCagr != null && implied5yCagr >= baseEpsCagrPct * 0.75) {
    verdict = '🟡 Mixed — outer years recover as haircuts taper; verify external drivers';
  } else {
    verdict = '🟡 Mixed — forward EPS path below base thesis after risk overlay';
  }

  return {
    title: 'Part B — Five-year forward (risk-adjusted EPS path)',
    years,
    startingEps: input.startingEps,
    baseEpsCagrPct,
    internalRisk: input.internalRisk,
    externalRisk: input.externalRisk,
    currentYearHighlight,
    verdict,
    tone,
    aiEnriched: Boolean(input.aiYearNotes && Object.keys(input.aiYearNotes).length > 0),
  };
}
