/** Framework-derived quality metrics + risk scoring for Stock Calculator. */

import { parseParametersEpsCagrBasePct } from './parameters-assumptions';

export type RiskLevel = 'L1' | 'L2' | 'L3' | 'L1-L2' | 'L2-L3' | 'none';

export interface FrameworkQualityMetrics {
  roePct: number | null;
  roeDisplay: string;
  roeRead: string | null;
  debtDisplay: string;
  debtRatio: number | null;
  debtRead: string | null;
  ebitdaMarginPct: number | null;
  ebitdaDisplay: string;
  ebitdaRead: string | null;
  cashFlowDisplay: string;
  cashFlowRead: string | null;
  baseEpsCagrPct: number | null;
  baseEpsCagrRange: string | null;
  impliedPriceCagrPct: number | null;
}

export interface RiskFactorResult {
  level: RiskLevel;
  score: number;
  haircutMidPp: number;
  haircutRange: string;
  activeRiskCount: number;
  topRisks: string[];
  summary: string;
  source: 'internal-negative-risk.md' | 'external-negative-risk.md' | 'unavailable';
}

export interface CagrGapAnalysis {
  frameworkBaseEpsCagrPct: number | null;
  internalHaircutPp: number;
  externalHaircutPp: number;
  possibleEpsCagrPct: number | null;
  impliedPriceCagrPct: number | null;
  /** Conservative framework-supported CAGR (min of EPS-adjusted and implied price CAGR when both exist). */
  possibleCagrPct: number | null;
  expectedCagrPct: number;
  cagrGapPp: number | null;
  gapVerdict: string;
  gapTone: 'positive' | 'neutral' | 'negative' | 'unknown';
}

function parseNum(s: string): number | null {
  const cleaned = s.replace(/,/g, '').replace(/\+/g, '').replace(/%/g, '').replace(/×/g, '').trim();
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** Master table row: Parameter | What | Link | 10Y avg (normal) | 10Y incl COVID | Today @ CMP | vs | Read */
export function extractParametersMasterCells(
  md: string,
  paramName: string
): { avg10y: string | null; today: string | null; read: string | null } {
  const escaped = paramName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const rowRe = new RegExp(`\\|\\s*\\*\\*${escaped}[^|]*\\*\\*([^\\n]+)`, 'i');
  const tail = md.match(rowRe)?.[1];
  if (!tail) return { avg10y: null, today: null, read: null };
  const cells = tail
    .split('|')
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
  if (cells.length < 5) return { avg10y: null, today: null, read: null };
  const clean = (s: string | undefined) => s?.replace(/\*\*/g, '').trim() ?? null;
  return {
    avg10y: clean(cells[2]),
    today: clean(cells[4]),
    read: clean(cells[6] ?? cells[cells.length - 1]),
  };
}

function extractTodayColumn(md: string, paramName: string): string | null {
  return extractParametersMasterCells(md, paramName).today;
}

function parsePercentDisplay(raw: string | null): { pct: number | null; display: string } {
  if (!raw) return { pct: null, display: '—' };
  const display = raw.replace(/\*\*/g, '').trim();
  if (/unverified|pending|n\/a/i.test(display)) return { pct: null, display };
  const range = display.match(/([\d.]+)\s*[-–]\s*([\d.]+)\s*%/);
  if (range) {
    const mid = (parseFloat(range[1]) + parseFloat(range[2])) / 2;
    return { pct: mid, display };
  }
  const single = display.match(/~?\s*([\d.]+)\s*%/);
  if (single) return { pct: parseFloat(single[1]), display };
  return { pct: null, display };
}

function parseRatioDisplay(raw: string | null): { ratio: number | null; display: string } {
  if (!raw) return { ratio: null, display: '—' };
  const display = raw.replace(/\*\*/g, '').trim();
  if (/unverified|pending|strong|fortress|safe|maintained|light/i.test(display) && !/\d/.test(display)) {
    return { ratio: null, display };
  }
  const n = parseNum(display);
  if (n != null) return { ratio: n, display };
  return { ratio: null, display };
}

function extractReadColumn(md: string, paramName: string): string | null {
  return extractParametersMasterCells(md, paramName).read;
}

export function parseBaseEpsCagrFromText(md: string): {
  baseEpsCagrPct: number | null;
  baseEpsCagrRange: string | null;
} {
  const baseGrowthMatch = md.match(
    /\*\*Base-case sustainable EPS growth:\*\*\s*\*\*([\d.\-–]+)\s*%\s*CAGR\*\*/i
  );
  if (!baseGrowthMatch) return { baseEpsCagrPct: null, baseEpsCagrRange: null };

  const rangeStr = baseGrowthMatch[1].replace(/–/g, '-').trim();
  const baseEpsCagrRange = `${rangeStr}% CAGR`;
  const parts = rangeStr.split('-').map((p) => parseFloat(p.trim()));
  let baseEpsCagrPct: number | null = null;
  if (parts.length === 2 && parts.every((n) => Number.isFinite(n))) {
    baseEpsCagrPct = (parts[0] + parts[1]) / 2;
  } else if (parts.length === 1 && Number.isFinite(parts[0])) {
    baseEpsCagrPct = parts[0];
  }
  return { baseEpsCagrPct, baseEpsCagrRange };
}

export function parseFrameworkQualityMetrics(
  parametersMd: string | null,
  detailMd: string | null,
  riskMd?: string | null
): FrameworkQualityMetrics {
  const md = parametersMd ?? '';

  const roeRaw =
    extractTodayColumn(md, 'ROE') ??
    extractTodayColumn(md, 'ROE \\(DuPont result\\)');
  const roe = parsePercentDisplay(roeRaw);

  const ebitdaRaw = extractTodayColumn(md, 'EBITDA margin');
  const ebitda = parsePercentDisplay(ebitdaRaw);

  const debtRaw =
    extractTodayColumn(md, 'Net debt / EBITDA') ??
    extractTodayColumn(md, 'Debt / Equity') ??
    extractTodayColumn(md, 'D/E');
  const debt = parseRatioDisplay(debtRaw);

  let cashFlowDisplay = '—';
  let cashFlowRead: string | null = null;

  const netCashRaw = extractTodayColumn(md, 'Net cash');
  if (netCashRaw) {
    cashFlowDisplay = netCashRaw.replace(/\*\*/g, '').trim();
    cashFlowRead = extractReadColumn(md, 'Net cash');
  }

  if (detailMd) {
    const fcfMatch = detailMd.match(
      /\|\s*(?:FCF|Free cash flow|Operating cash flow)[^|]*\|\s*(?:₹|Rs\.?\s*)?([\d,.]+)\s*Cr/i
    );
    if (fcfMatch) {
      cashFlowDisplay = `₹${fcfMatch[1]} Cr (operations)`;
    }
    const convMatch = detailMd.match(/cash conversion[^|]*\|\s*\*?\*?([^|*]+?)\*?\*?\s*\|/i);
    if (convMatch && cashFlowDisplay === '—') {
      cashFlowDisplay = convMatch[1].trim();
    }
  }

  if (cashFlowDisplay === '—') {
    const oeyRaw = extractTodayColumn(md, 'Owner Earnings Yield');
    if (oeyRaw) {
      const oey = parsePercentDisplay(oeyRaw);
      cashFlowDisplay = oey.display !== '—' ? `OEY ${oey.display}` : '—';
      cashFlowRead = extractReadColumn(md, 'Owner Earnings Yield');
    }
  }

  let baseEpsCagrPct: number | null = null;
  let baseEpsCagrRange: string | null = null;

  const epsCagrFromParams = parseParametersEpsCagrBasePct(md);
  if (epsCagrFromParams != null) {
    baseEpsCagrPct = epsCagrFromParams;
    baseEpsCagrRange = `${epsCagrFromParams}% (PARAMETERS base)`;
  }

  if (baseEpsCagrPct == null && riskMd) {
    const fromRisk = parseBaseEpsCagrFromText(riskMd);
    baseEpsCagrPct = fromRisk.baseEpsCagrPct;
    baseEpsCagrRange = fromRisk.baseEpsCagrRange;
  }

  let impliedPriceCagrPct: number | null = null;
  const impliedRow = md.match(
    /\|\s*\*\*Implied 5Y price CAGR\*\*[\s\S]*?\|\s*[^|]+\|\s*[^|]+\|\s*[^|]+\|\s*\*\*\+?([\d.]+)\s*%\*\*/i
  );
  if (impliedRow) impliedPriceCagrPct = parseFloat(impliedRow[1]);

  return {
    roePct: roe.pct,
    roeDisplay: roe.display,
    roeRead: extractReadColumn(md, 'ROE') ?? extractReadColumn(md, 'ROE (DuPont result)'),
    debtDisplay: debt.display,
    debtRatio: debt.ratio,
    debtRead: extractReadColumn(md, 'Net debt / EBITDA'),
    ebitdaMarginPct: ebitda.pct,
    ebitdaDisplay: ebitda.display,
    ebitdaRead: extractReadColumn(md, 'EBITDA margin'),
    cashFlowDisplay,
    cashFlowRead,
    baseEpsCagrPct,
    baseEpsCagrRange,
    impliedPriceCagrPct,
  };
}

function levelFromString(raw: string): { level: RiskLevel; score: number; haircutMid: number; range: string } {
  const s = raw.toUpperCase().replace(/\*/g, '').trim();
  if (s.includes('L3')) return { level: 'L3', score: 3, haircutMid: 8, range: '≥8 pp' };
  if (s.includes('L2') && s.includes('L1')) return { level: 'L1-L2', score: 1.5, haircutMid: 3.5, range: '2–5 pp' };
  if (s.includes('L2') && s.includes('L3')) return { level: 'L2-L3', score: 2.5, haircutMid: 6.5, range: '5–8 pp' };
  if (s.includes('L2')) return { level: 'L2', score: 2, haircutMid: 5, range: '3–7 pp' };
  if (s.includes('L1')) return { level: 'L1', score: 1, haircutMid: 1, range: '0–2 pp' };
  return { level: 'none', score: 0, haircutMid: 0, range: '0 pp' };
}

function parseHaircutFromImpact(impact: string): number | null {
  const m = impact.match(/(-?\d+)\s*to\s*(-?\d+)\s*pp/i);
  if (m) return (Math.abs(parseInt(m[1], 10)) + Math.abs(parseInt(m[2], 10))) / 2;
  const single = impact.match(/(-?\d+)\s*pp/i);
  if (single) return Math.abs(parseInt(single[1], 10));
  return null;
}

export function parseRiskFactor(
  riskMd: string | null,
  source: RiskFactorResult['source']
): RiskFactorResult {
  if (!riskMd) {
    return {
      level: 'none',
      score: 0,
      haircutMidPp: 0,
      haircutRange: '0 pp',
      activeRiskCount: 0,
      topRisks: [],
      summary: 'Risk register not available in StockBook.',
      source: 'unavailable',
    };
  }

  const registerSection = riskMd.split(/## Risk register/i)[1]?.split(/## /)[0] ?? riskMd;
  const rows = [...registerSection.matchAll(/^\|\s*\*?\*?[IE]\d+[^|\n]*\|\s*([^|]+)\|[^|\n]*\|\s*\*?\*?(L[\d\-]+(?:\s*-\s*L[\d]+)?)\*?\*?\s*\|\s*\*?\*?([^|*]+)\*?\*?\s*\|/gim)];

  if (rows.length === 0) {
    return {
      level: 'none',
      score: 0,
      haircutMidPp: 0,
      haircutRange: '0 pp',
      activeRiskCount: 0,
      topRisks: [],
      summary: 'No active risks parsed from register.',
      source,
    };
  }

  let worst = { level: 'none' as RiskLevel, score: 0, haircutMid: 0, range: '0 pp' };
  const topRisks: string[] = [];

  for (const row of rows) {
    const name = row[1].replace(/\*\*/g, '').trim();
    const parsed = levelFromString(row[2]);
    const impactHaircut = parseHaircutFromImpact(row[3]) ?? parsed.haircutMid;
    if (parsed.score >= worst.score) {
      worst = {
        level: parsed.level,
        score: parsed.score,
        haircutMid: impactHaircut,
        range: row[3].replace(/\*\*/g, '').trim() || parsed.range,
      };
    }
    if (topRisks.length < 3 && parsed.score > 0) {
      topRisks.push(`${name} (${parsed.level})`);
    }
  }

  const label = source === 'internal-negative-risk.md' ? 'Internal' : 'External';
  return {
    level: worst.level,
    score: worst.score,
    haircutMidPp: worst.haircutMid,
    haircutRange: worst.range,
    activeRiskCount: rows.length,
    topRisks,
    summary: `${label} worst case **${worst.level}** — growth haircut ~${worst.haircutMid.toFixed(1)} pp (${worst.range})`,
    source,
  };
}

export function computeCagrGapAnalysis(input: {
  quality: FrameworkQualityMetrics;
  internalRisk: RiskFactorResult;
  externalRisk: RiskFactorResult;
  expectedCagrPct: number;
  primaryPriceCagrPct: number;
}): CagrGapAnalysis {
  const { quality, internalRisk, externalRisk, expectedCagrPct, primaryPriceCagrPct } = input;

  const frameworkBase = quality.baseEpsCagrPct;
  const combinedHaircut = Math.max(internalRisk.haircutMidPp, externalRisk.haircutMidPp);
  const stressHaircut = internalRisk.haircutMidPp + externalRisk.haircutMidPp;

  let possibleEpsCagrPct: number | null = null;
  if (frameworkBase != null) {
    possibleEpsCagrPct = Math.max(0, frameworkBase - combinedHaircut);
  }

  const impliedPriceCagrPct = quality.impliedPriceCagrPct ?? primaryPriceCagrPct;

  let possibleCagrPct: number | null = null;
  if (possibleEpsCagrPct != null && impliedPriceCagrPct != null) {
    possibleCagrPct = Math.min(possibleEpsCagrPct, impliedPriceCagrPct);
  } else {
    possibleCagrPct = possibleEpsCagrPct ?? impliedPriceCagrPct;
  }

  let cagrGapPp: number | null = null;
  let gapVerdict = 'Framework base CAGR unavailable — gap not computed.';
  let gapTone: CagrGapAnalysis['gapTone'] = 'unknown';

  if (possibleCagrPct != null) {
    cagrGapPp = possibleCagrPct - expectedCagrPct;
    if (cagrGapPp >= 2) {
      gapVerdict = `Room to spare — framework supports up to ~${possibleCagrPct.toFixed(1)}% vs your ${expectedCagrPct}% expectation (+${cagrGapPp.toFixed(1)} pp headroom).`;
      gapTone = 'positive';
    } else if (cagrGapPp >= -2) {
      gapVerdict = `Aligned — your ${expectedCagrPct}% expectation is near supported ~${possibleCagrPct.toFixed(1)}% (${cagrGapPp >= 0 ? '+' : ''}${cagrGapPp.toFixed(1)} pp).`;
      gapTone = 'neutral';
    } else {
      gapVerdict = `Stretched expectation — your ${expectedCagrPct}% exceeds supported ~${possibleCagrPct.toFixed(1)}% by ${Math.abs(cagrGapPp).toFixed(1)} pp (stress haircut up to ${stressHaircut.toFixed(1)} pp).`;
      gapTone = 'negative';
    }
  }

  return {
    frameworkBaseEpsCagrPct: frameworkBase,
    internalHaircutPp: internalRisk.haircutMidPp,
    externalHaircutPp: externalRisk.haircutMidPp,
    possibleEpsCagrPct,
    impliedPriceCagrPct,
    possibleCagrPct,
    expectedCagrPct,
    cagrGapPp,
    gapVerdict,
    gapTone,
  };
}

export function riskLevelClass(level: RiskLevel): string {
  switch (level) {
    case 'L3':
    case 'L2-L3':
      return 'risk-l3';
    case 'L2':
    case 'L1-L2':
      return 'risk-l2';
    case 'L1':
      return 'risk-l1';
    default:
      return 'risk-none';
  }
}
