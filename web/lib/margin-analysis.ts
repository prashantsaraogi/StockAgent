/**
 * Margin Analysis — Stock Calculator tab
 * StockBook/MARGIN-FRAMEWORK.md
 */

import fs from 'fs/promises';
import path from 'path';
import { readStockTabContent } from './content';
import { getRepoRoot } from './framework-paths';
import { getStockbookByTicker } from './stockbook-index';
import { resolveStock } from './stock-search';
import { fetchLiveNseCmp } from './nse-cmp';
import { stockbookPath } from './navigation';
import {
  extractParametersMasterCells,
  parseFrameworkQualityMetrics,
  parseRiskFactor,
} from './stock-calculator-framework';
import {
  getBundledEarningsQualityMd,
  getBundledMarginMd,
  getBundledParametersMd,
} from './load-bundled-stockbook';

export type EvidenceType = 'FACT' | 'MANAGEMENT CLAIM' | 'HYPOTHESIS' | 'OUR ASSUMPTION' | 'UNVERIFIED';
export type MarginSignal = '🟢' | '🟡' | '🔴' | '—';
export type TrendSignal = 'improving' | 'stable' | 'deteriorating' | 'unknown';
export type QualityTone = 'good' | 'neutral' | 'warn' | 'bad';

export interface MarginYearRow {
  fiscalYear: string;
  grossPct: number | null;
  ebitdaPct: number | null;
  ebitPct: number | null;
  netPct: number | null;
  ebitdaDeltaPp: number | null;
  signal: MarginSignal;
  evidence: EvidenceType;
  note?: string;
}

export interface MarginHistoryPart {
  title: string;
  years: MarginYearRow[];
  avgEbitdaPct: number | null;
  trendDirection: TrendSignal;
  trendLabel: string;
  verdict: string;
  tone: QualityTone;
  dataComplete: boolean;
}

export interface MarginVsHistoryRow {
  metric: string;
  todayPct: number | null;
  avg10yPct: number | null;
  deltaPp: number | null;
  read: string;
  signal: MarginSignal;
}

export interface MarginVsHistoryPart {
  title: string;
  rows: MarginVsHistoryRow[];
  primaryDeltaPp: number | null;
  verdict: string;
  tone: QualityTone;
}

export interface MarginDriverRow {
  driver: string;
  assessment: string;
  impact: MarginSignal;
  evidence: EvidenceType;
}

export interface MarginDriversPart {
  title: string;
  drivers: MarginDriverRow[];
  passThroughVerdict: string;
  tone: QualityTone;
}

export interface QuarterlyMarginRow {
  quarter: string;
  marginPct: number | null;
  revenue: number | null;
}

export interface MarginWarning {
  id: string;
  severity: 'warn' | 'bad';
  title: string;
  detail: string;
}

export interface MarginAnalysisResult {
  ticker: string;
  stockName: string;
  sector: string;
  cmp: number | null;
  cmpSource: string;
  analyzedAt: string;
  coreQuestion: string;
  dataSource: string;
  marginFile: string | null;
  parametersFile: string | null;
  stockbookUrl: string;
  partA: MarginHistoryPart;
  partB: MarginVsHistoryPart;
  partC: MarginDriversPart;
  partD: {
    title: string;
    quarters: QuarterlyMarginRow[];
    trend: TrendSignal;
    trendLabel: string;
    changePp: number | null;
  };
  warnings: MarginWarning[];
  overallVerdict: string;
  overallTone: QualityTone;
  summaryLines: string[];
  externalRiskNote: string | null;
}

export interface RunMarginAnalysisInput {
  ticker: string;
  tenantId: string;
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

function parseSignal(cell: string | undefined): MarginSignal {
  const s = cell ?? '';
  if (s.includes('🟢') || /positive|expand|strong|healthy/i.test(s)) return '🟢';
  if (s.includes('🔴') || /negative|compress|weak|fail/i.test(s)) return '🔴';
  if (s.includes('🟡') || /monitor|mixed|neutral|stable/i.test(s)) return '🟡';
  return '—';
}

function trendFromChange(pct: number | null): TrendSignal {
  if (pct == null || !Number.isFinite(pct)) return 'unknown';
  if (pct > 0.5) return 'improving';
  if (pct < -0.5) return 'deteriorating';
  return 'stable';
}

function trendLabel(t: TrendSignal): string {
  if (t === 'improving') return '↑ Expanding';
  if (t === 'deteriorating') return '↓ Compressing';
  if (t === 'stable') return '→ Stable';
  return '— Unknown';
}

function toneFromVerdict(v: string): QualityTone {
  if (v.startsWith('🟢')) return 'good';
  if (v.startsWith('🔴')) return 'bad';
  return 'warn';
}

function extractAvgColumn(md: string, paramName: string): string | null {
  return extractParametersMasterCells(md, paramName).avg10y;
}

function extractReadColumn(md: string, paramName: string): string | null {
  return extractParametersMasterCells(md, paramName).read;
}

async function readMarginFile(
  sector: string,
  stock: string,
  ticker: string,
  tenantId: string
): Promise<{ content: string; filename: string } | null> {
  const dirs = [path.join(getRepoRoot(), 'StockBook', sector, stock)];
  const { getUserPaths } = await import('./tenant');
  dirs.unshift(path.join(getUserPaths(tenantId).stockbookDir, sector, stock));

  for (const dir of dirs) {
    try {
      const files = await fs.readdir(dir);
      const hit =
        files.find((f) => f.toUpperCase() === `MARGIN_${ticker.toUpperCase()}.md`) ??
        files.find((f) => f.startsWith('MARGIN_') && f.endsWith('.md'));
      if (hit) {
        const content = await fs.readFile(path.join(dir, hit), 'utf8');
        return { content, filename: hit };
      }
    } catch {
      /* next */
    }
  }
  const bundled = getBundledMarginMd(ticker);
  if (bundled) {
    return { content: bundled, filename: `MARGIN_${ticker.toUpperCase()}.md` };
  }
  return null;
}

async function readEarningsQualityFile(
  sector: string,
  stock: string,
  ticker: string,
  tenantId: string
): Promise<string | null> {
  const dirs = [path.join(getRepoRoot(), 'StockBook', sector, stock)];
  const { getUserPaths } = await import('./tenant');
  dirs.unshift(path.join(getUserPaths(tenantId).stockbookDir, sector, stock));

  for (const dir of dirs) {
    try {
      const files = await fs.readdir(dir);
      const hit =
        files.find((f) => f.toUpperCase() === `EARNINGS_QUALITY_${ticker.toUpperCase()}.md`) ??
        files.find((f) => f.startsWith('EARNINGS_QUALITY_') && f.endsWith('.md'));
      if (hit) {
        return await fs.readFile(path.join(dir, hit), 'utf8');
      }
    } catch {
      /* next */
    }
  }
  return getBundledEarningsQualityMd(ticker);
}

function parsePartAFromMarkdown(md: string): MarginYearRow[] {
  const section =
    md.match(/## Part A[^\n]*\n([\s\S]*?)(?=\n## Part [BCD]|\n## [A-D]\.|\n---\n|$)/i)?.[1] ?? '';
  const rows: MarginYearRow[] = [];

  for (const line of section.split('\n')) {
    if (!line.trim().startsWith('|') || /---/.test(line)) continue;
    if (/^\|\s*FY/i.test(line) && /Gross|EBITDA/i.test(line)) continue;

    const cells = line
      .split('|')
      .map((c) => c.trim())
      .filter(Boolean);
    if (cells.length < 4 || !/^FY/i.test(cells[0])) continue;

    rows.push({
      fiscalYear: cells[0],
      grossPct: parseNum(cells[1]),
      ebitdaPct: parseNum(cells[2]),
      ebitPct: parseNum(cells[3]),
      netPct: parseNum(cells[4]),
      ebitdaDeltaPp: parseNum(cells[5]),
      signal: parseSignal(cells[6]),
      note: cells.length > 8 ? cells[7] : undefined,
      evidence: parseEvidence(cells[cells.length - 1]),
    });
  }

  return rows.slice(-5);
}

function parseDriversFromMarkdown(md: string): MarginDriverRow[] {
  const section =
    md.match(/## Part C[^\n]*\n([\s\S]*?)(?=\n## Part D|\n## [A-D]\.|\n---\n|$)/i)?.[1] ?? '';
  const drivers: MarginDriverRow[] = [];

  for (const line of section.split('\n')) {
    if (!line.trim().startsWith('|') || /---/.test(line)) continue;
    if (/Driver|Assessment/i.test(line)) continue;

    const cells = line
      .split('|')
      .map((c) => c.trim())
      .filter(Boolean);
    if (cells.length < 3) continue;

    drivers.push({
      driver: cells[0],
      assessment: cells[1],
      impact: parseSignal(cells[2]),
      evidence: parseEvidence(cells[cells.length - 1]),
    });
  }

  return drivers;
}

function parsePassThroughVerdict(md: string): string {
  const m = md.match(/\*\*Pass-through verdict:\*\*\s*(.+)/i);
  return m?.[1]?.trim() ?? 'Not stated — add Part C pass-through verdict in MARGIN file';
}

function parseQuarterlyMargins(eqMd: string): QuarterlyMarginRow[] {
  const section =
    eqMd.match(/## D\.[^\n]*\n([\s\S]*?)(?=\n## |\n\*\*Notes|\n---\n|$)/i)?.[1] ?? '';
  const rows: QuarterlyMarginRow[] = [];

  for (const line of section.split('\n')) {
    if (!line.trim().startsWith('|') || /---/.test(line)) continue;
    if (/Quarter|Metric/i.test(line) && !/^Q/i.test(line.split('|')[1]?.trim() ?? '')) continue;

    const cells = line
      .split('|')
      .map((c) => c.trim())
      .filter(Boolean);
    if (cells.length < 4 || !/^Q/i.test(cells[0])) continue;

    rows.push({
      quarter: cells[0],
      revenue: parseNum(cells[1]),
      marginPct: parseNum(cells[3]),
    });
  }

  return rows.slice(-8);
}

function buildPartA(years: MarginYearRow[], parametersEbitda: number | null): MarginHistoryPart {
  let dataComplete = years.length >= 4;
  const ebitdaSeries = years.map((y) => y.ebitdaPct).filter((v): v is number => v != null);

  let avgEbitdaPct: number | null = null;
  if (ebitdaSeries.length >= 2) {
    avgEbitdaPct = Math.round((ebitdaSeries.reduce((a, b) => a + b, 0) / ebitdaSeries.length) * 10) / 10;
  } else if (parametersEbitda != null) {
    avgEbitdaPct = parametersEbitda;
  }

  let trendDirection: TrendSignal = 'unknown';
  let changePp: number | null = null;
  if (ebitdaSeries.length >= 2) {
    changePp = ebitdaSeries[ebitdaSeries.length - 1] - ebitdaSeries[0];
    trendDirection = trendFromChange(changePp);
  }

  const hasRed = years.some((y) => y.signal === '🔴');
  let verdict: string;
  if (years.length === 0) {
    verdict = '🟡 Mixed — add Part A table in MARGIN_[TICKER].md';
  } else if (trendDirection === 'deteriorating' || hasRed) {
    verdict = '🟡 Mixed — 5Y margin trend compressing or weak years flagged';
  } else if (trendDirection === 'improving') {
    verdict = '🟢 Healthy — margins expanding over 5Y window';
  } else {
    verdict = '🟡 Moderate — margins stable but not expanding';
  }

  return {
    title: 'Part A — Five-year margin history',
    years,
    avgEbitdaPct,
    trendDirection,
    trendLabel: trendLabel(trendDirection),
    verdict,
    tone: toneFromVerdict(verdict),
    dataComplete,
  };
}

function buildPartB(parametersMd: string | null, quality: ReturnType<typeof parseFrameworkQualityMetrics>): MarginVsHistoryPart {
  const md = parametersMd ?? '';
  const rows: MarginVsHistoryRow[] = [];

  const metrics: { key: string; label: string; today: number | null; avg: number | null; read: string }[] = [];

  const ebitdaToday = quality.ebitdaMarginPct;
  const ebitdaAvgRaw = extractAvgColumn(md, 'EBITDA margin');
  const ebitdaAvg = parseNum(ebitdaAvgRaw?.replace(/[~%]/g, '') ?? null);
  metrics.push({
    key: 'ebitda',
    label: 'EBITDA margin',
    today: ebitdaToday,
    avg: ebitdaAvg,
    read: extractReadColumn(md, 'EBITDA margin') ?? quality.ebitdaRead ?? '—',
  });

  const roeToday = quality.roePct;
  const roeAvgRaw = extractAvgColumn(md, 'ROE');
  const roeAvg = parseNum(roeAvgRaw?.replace(/[%]/g, '') ?? null);
  if (roeToday != null || roeAvg != null) {
    metrics.push({
      key: 'roe',
      label: 'ROE',
      today: roeToday,
      avg: roeAvg,
      read: extractReadColumn(md, 'ROE') ?? quality.roeRead ?? '—',
    });
  }

  for (const m of metrics) {
    const deltaPp =
      m.today != null && m.avg != null ? Math.round((m.today - m.avg) * 10) / 10 : null;
    let signal: MarginSignal = '—';
    if (deltaPp != null) {
      if (deltaPp >= 1) signal = '🟢';
      else if (deltaPp <= -3) signal = '🔴';
      else if (deltaPp <= -1) signal = '🟡';
      else signal = '🟢';
    }
    rows.push({
      metric: m.label,
      todayPct: m.today,
      avg10yPct: m.avg,
      deltaPp,
      read: m.read,
      signal,
    });
  }

  const primary = rows.find((r) => r.metric === 'EBITDA margin');
  const primaryDeltaPp = primary?.deltaPp ?? null;

  let verdict: string;
  if (primaryDeltaPp == null) {
    verdict = '🟡 Mixed — PARAMETERS EBITDA margin vs 10Y avg UNVERIFIED';
  } else if (primaryDeltaPp <= -3) {
    verdict = '🔴 Warning — EBITDA margin materially below 10Y normal';
  } else if (primaryDeltaPp <= -1) {
    verdict = '🟡 Mixed — margin compressed vs historical norm';
  } else if (primaryDeltaPp >= 1) {
    verdict = '🟢 Healthy — margin above 10Y average';
  } else {
    verdict = '🟡 In line — margin near historical average';
  }

  return {
    title: 'Part B — Today vs 10Y history (PARAMETERS)',
    rows,
    primaryDeltaPp,
    verdict,
    tone: toneFromVerdict(verdict),
  };
}

function buildPartC(drivers: MarginDriverRow[], passThrough: string): MarginDriversPart {
  const negative = drivers.filter((d) => d.impact === '🔴').length;
  let tone: QualityTone = 'neutral';
  if (/weak|fail|negative|compress/i.test(passThrough)) tone = 'bad';
  else if (/strong|healthy|positive|maintain/i.test(passThrough)) tone = 'good';
  else if (negative >= 2) tone = 'warn';

  return {
    title: 'Part C — Margin drivers & pass-through',
    drivers,
    passThroughVerdict: passThrough,
    tone,
  };
}

function detectWarnings(
  partA: MarginHistoryPart,
  partB: MarginVsHistoryPart,
  quarters: QuarterlyMarginRow[]
): MarginWarning[] {
  const warnings: MarginWarning[] = [];

  if (partB.primaryDeltaPp != null && partB.primaryDeltaPp <= -3) {
    warnings.push({
      id: 'below-10y',
      severity: 'bad',
      title: 'Material compression vs 10Y average',
      detail: `EBITDA margin ${partB.primaryDeltaPp} pp below 10Y normal — investigate structural vs cyclical.`,
    });
  }

  if (partA.trendDirection === 'deteriorating') {
    warnings.push({
      id: '5y-trend-down',
      severity: 'warn',
      title: '5Y margin trend compressing',
      detail: 'Part A shows declining EBITDA margin over the historical window.',
    });
  }

  if (quarters.length >= 4) {
    const margins = quarters.map((q) => q.marginPct).filter((v): v is number => v != null);
    if (margins.length >= 4) {
      const first = margins[0];
      const last = margins[margins.length - 1];
      const revFirst = quarters[0].revenue;
      const revLast = quarters[quarters.length - 1].revenue;
      if (last < first - 1 && revLast != null && revFirst != null && revLast > revFirst * 1.05) {
        warnings.push({
          id: 'volume-up-margin-down',
          severity: 'bad',
          title: 'Volume ↑ but margin ↓',
          detail: `Revenue rose but margin fell ${(first - last).toFixed(1)} pp (${first}% → ${last}%) — pass-through failure.`,
        });
      }

      let consecutiveDown = 0;
      for (let i = 1; i < margins.length; i++) {
        if (margins[i] < margins[i - 1] - 0.2) consecutiveDown++;
        else consecutiveDown = 0;
      }
      if (consecutiveDown >= 2) {
        warnings.push({
          id: '3q-compression',
          severity: 'warn',
          title: 'Sustained quarterly margin compression',
          detail: 'Multiple consecutive quarters of declining margin — not one-off noise.',
        });
      }
    }
  }

  return warnings;
}

function combineVerdict(
  partA: MarginHistoryPart,
  partB: MarginVsHistoryPart,
  partC: MarginDriversPart,
  warnings: MarginWarning[]
): string {
  if (warnings.some((w) => w.severity === 'bad') || partB.verdict.startsWith('🔴')) {
    return '🔴 Warning — margin compression or pass-through failure flagged';
  }
  if (
    partA.verdict.startsWith('🟡') ||
    partB.verdict.startsWith('🟡') ||
    warnings.length > 0 ||
    /weak|fail/i.test(partC.passThroughVerdict)
  ) {
    return '🟡 Mixed — monitor margin trajectory vs history and drivers';
  }
  return '🟢 Healthy — margins aligned with history and drivers supportive';
}

export async function runMarginAnalysis(input: RunMarginAnalysisInput): Promise<MarginAnalysisResult | null> {
  const resolved = await resolveStock(input.ticker.trim());
  if (!resolved) return null;

  const loc = await getStockbookByTicker(resolved.ticker);
  const sector = loc?.sector ?? resolved.sector;
  const stockName = loc?.stock ?? resolved.company;

  const marginFile = await readMarginFile(sector, stockName, resolved.ticker, input.tenantId);
  const parameters = await readStockTabContent(sector, stockName, 'parameters', input.tenantId);
  const parametersMd =
    parameters?.content ?? getBundledParametersMd(resolved.ticker);
  const external = await readStockTabContent(sector, stockName, 'external-risk', input.tenantId);
  const eqMd = await readEarningsQualityFile(sector, stockName, resolved.ticker, input.tenantId);

  const marginMd = marginFile?.content ?? '';
  const quality = parseFrameworkQualityMetrics(parametersMd, null);
  const externalRisk = parseRiskFactor(external?.content ?? null, 'external-negative-risk.md');

  let cmp: number | null = null;
  let cmpSource = 'Unavailable';
  try {
    const live = await fetchLiveNseCmp(resolved.ticker);
    if (live?.price != null && live.price > 0) {
      cmp = live.price;
      cmpSource = live.source;
    }
  } catch {
    /* fallback */
  }
  if (cmp == null && parametersMd) {
    const cmpMatch = parametersMd.match(/\*\*CMP:\*\*\s*Rs\.?\s*([\d,]+(?:\.\d+)?)/i);
    if (cmpMatch) {
      cmp = parseFloat(cmpMatch[1].replace(/,/g, ''));
      cmpSource = 'PARAMETERS file';
    }
  }

  const partAYears = parsePartAFromMarkdown(marginMd);
  const partA = buildPartA(partAYears, quality.ebitdaMarginPct);
  const partB = buildPartB(parametersMd, quality);
  const partC = buildPartC(parseDriversFromMarkdown(marginMd), parsePassThroughVerdict(marginMd));
  const quarters = eqMd ? parseQuarterlyMargins(eqMd) : [];

  let marginTrend: TrendSignal = 'unknown';
  let marginChangePp: number | null = null;
  const marginSeries = quarters.map((q) => q.marginPct).filter((v): v is number => v != null);
  if (marginSeries.length >= 2) {
    marginChangePp = Math.round((marginSeries[marginSeries.length - 1] - marginSeries[0]) * 10) / 10;
    marginTrend = trendFromChange(marginChangePp);
  }

  const partD = {
    title: 'Part D — Quarterly margin trend',
    quarters,
    trend: marginTrend,
    trendLabel: trendLabel(marginTrend),
    changePp: marginChangePp,
  };

  const warnings = detectWarnings(partA, partB, quarters);
  const overallVerdict = combineVerdict(partA, partB, partC, warnings);

  const externalRiskNote =
    externalRisk.topRisks.length > 0
      ? `External: ${externalRisk.level} — ${externalRisk.topRisks[0]}`
      : null;

  const summaryLines = [
    partB.primaryDeltaPp != null
      ? `EBITDA vs 10Y: ${partB.primaryDeltaPp > 0 ? '+' : ''}${partB.primaryDeltaPp} pp`
      : 'EBITDA vs 10Y — add PARAMETERS',
    partA.avgEbitdaPct != null ? `5Y avg EBITDA ${partA.avgEbitdaPct}%` : '',
    partD.quarters.length > 0 ? `Quarterly margin ${partD.trendLabel}` : '',
  ].filter(Boolean);

  return {
    ticker: resolved.ticker,
    stockName,
    sector,
    cmp,
    cmpSource,
    analyzedAt: new Date().toISOString(),
    coreQuestion:
      'Are operating margins structurally healthy, improving with scale, and defensible vs history?',
    dataSource: marginFile
      ? marginFile.filename
      : parameters?.filename
        ? `${parameters.filename} (partial — add MARGIN_${resolved.ticker}.md)`
        : 'No margin file',
    marginFile: marginFile?.filename ?? null,
    parametersFile: parameters?.filename ?? null,
    stockbookUrl: stockbookPath(sector, stockName, 'parameters'),
    partA,
    partB,
    partC,
    partD,
    warnings,
    overallVerdict,
    overallTone: toneFromVerdict(overallVerdict),
    summaryLines,
    externalRiskNote,
  };
}
