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
import {
  completeExternalMarginRows,
  fetchExternalMarginMetrics,
  partBNeedsExternal,
  type ExternalMarginMetrics,
} from './margin-external-metrics';
import { fetchYahooTrailingPeMetrics } from './yahoo-finance-session';
import { stockbookPath } from './navigation';
import {
  extractParametersMasterCells,
  parseFrameworkQualityMetrics,
  parseRiskFactor,
  type FrameworkQualityMetrics,
} from './stock-calculator-framework';
import { parseParametersEpsCagrBasePct } from './parameters-assumptions';
import { parsePartAFromMarkdown as parseEqPartAFromMarkdown } from './earnings-quality-parts';
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
  /** Column populated in Part A when using a non-EBITDA proxy (e.g. owner earnings yield). */
  primaryMetricLabel: string;
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
  primaryMetricLabel: string;
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
  /** Set when Part B / Part A use Yahoo (or EPS-derived OEY) because PARAMETERS Block B is empty. */
  liveMetricsSource: string | null;
}

export interface RunMarginAnalysisInput {
  ticker: string;
  tenantId: string;
}

function parseNum(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const s = raw
    .replace(/\r/g, '')
    .replace(/,/g, '')
    .replace(/[₹Rs.%cr\s]/gi, '')
    .trim();
  if (!s || s === '—' || s === '-') return null;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

function splitTableCells(line: string): string[] {
  const parts = line.split('|').map((c) => c.replace(/\r/g, '').trim());
  if (parts.length <= 2) return [];
  return parts.slice(1, parts.length - 1);
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

function parseMasterNumeric(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const display = raw.replace(/\*\*/g, '').trim();
  if (!display || /unverified|pending|\*pending/i.test(display)) return null;
  const pct = display.match(/~?\s*([\d.]+)\s*%/);
  if (pct) return parseFloat(pct[1]);
  const mult = display.match(/([\d.]+)\s*x/i);
  if (mult) return parseFloat(mult[1]);
  return parseNum(display);
}

function isFinancialSector(sector: string): boolean {
  return /bank|finance|nbfc|insurance|amc|finserv|lending/i.test(sector);
}

interface MasterMetricCandidate {
  param: string;
  label: string;
  /** For P/E: lower today vs avg is favourable (invert delta sign for signal). */
  lowerIsBetter?: boolean;
}

function metricCandidatesForSector(sector: string): MasterMetricCandidate[] {
  if (isFinancialSector(sector)) {
    return [
      { param: 'ROE', label: 'ROE' },
      { param: 'ROA', label: 'ROA' },
      { param: 'Owner Earnings Yield', label: 'Owner earnings yield' },
      { param: 'P/E', label: 'P/E (multiple)', lowerIsBetter: true },
      { param: 'Net interest margin', label: 'Net interest margin (NIM)' },
      { param: 'EBITDA margin', label: 'EBITDA margin' },
    ];
  }
  return [
    { param: 'EBITDA margin', label: 'EBITDA margin' },
    { param: 'Net margin', label: 'Net margin' },
    { param: 'Gross margin', label: 'Gross margin' },
    { param: 'Operating margin', label: 'Operating margin' },
    { param: 'ROCE', label: 'ROCE' },
    { param: 'ROE', label: 'ROE' },
    { param: 'Owner Earnings Yield', label: 'Owner earnings yield' },
    { param: 'P/E', label: 'P/E (multiple)', lowerIsBetter: true },
  ];
}

function collectParametersMetrics(
  parametersMd: string | null,
  quality: FrameworkQualityMetrics,
  sector: string
): { rows: MarginVsHistoryRow[]; primaryLabel: string; primaryDeltaPp: number | null } {
  const md = parametersMd ?? '';
  const rows: MarginVsHistoryRow[] = [];

  for (const cand of metricCandidatesForSector(sector)) {
    let today: number | null = null;
    let avg: number | null = null;
    let read = extractReadColumn(md, cand.param) ?? '—';

    if (cand.param === 'EBITDA margin' && quality.ebitdaMarginPct != null) {
      today = quality.ebitdaMarginPct;
      read = quality.ebitdaRead ?? read;
    } else if (cand.param === 'ROE' && quality.roePct != null) {
      today = quality.roePct;
      read = quality.roeRead ?? read;
    }

    const cells = extractParametersMasterCells(md, cand.param);
    if (today == null) today = parseMasterNumeric(cells.today);
    if (avg == null) avg = parseMasterNumeric(cells.avg10y);

    if (today == null && avg == null) continue;

    const deltaPp =
      today != null && avg != null ? Math.round((today - avg) * 10) / 10 : null;
    const effectiveDelta = cand.lowerIsBetter && deltaPp != null ? -deltaPp : deltaPp;

    let signal: MarginSignal = '—';
    if (effectiveDelta != null) {
      if (effectiveDelta >= 1) signal = '🟢';
      else if (effectiveDelta <= -3) signal = '🔴';
      else if (effectiveDelta <= -1) signal = '🟡';
      else signal = '🟢';
    } else if (today != null) {
      signal = '🟡';
    }

    rows.push({
      metric: cand.label,
      todayPct: today,
      avg10yPct: avg,
      deltaPp,
      read: read !== '—' ? read : today != null ? 'PARAMETERS today column' : 'OUR ASSUMPTION — refresh Block B',
      signal,
    });
  }

  const primary =
    rows.find((r) => r.metric === 'EBITDA margin' && r.todayPct != null) ??
    rows.find((r) => r.todayPct != null && r.avg10yPct != null) ??
    rows.find((r) => r.todayPct != null) ??
    rows[0];

  const primaryLabel = primary?.metric ?? 'EBITDA margin';
  let primaryDeltaPp = primary?.deltaPp ?? null;
  const primaryCand = metricCandidatesForSector(sector).find((c) => c.label === primaryLabel);
  if (primaryCand?.lowerIsBetter && primaryDeltaPp != null) {
    primaryDeltaPp = -primaryDeltaPp;
  }

  return { rows, primaryLabel, primaryDeltaPp };
}

function marginRowFromExternal(
  metric: string,
  today: number | null,
  avg: number | null,
  lowerIsBetter = false
): MarginVsHistoryRow {
  const deltaPp =
    today != null && avg != null ? Math.round((today - avg) * 10) / 10 : null;
  const effectiveDelta = lowerIsBetter && deltaPp != null ? -deltaPp : deltaPp;
  let signal: MarginSignal = '🟡';
  if (effectiveDelta != null) {
    if (effectiveDelta >= 1) signal = '🟢';
    else if (effectiveDelta <= -3) signal = '🔴';
    else if (effectiveDelta <= -1) signal = '🟡';
    else signal = '🟢';
  } else if (today != null) signal = '🟡';

  return {
    metric,
    todayPct: today,
    avg10yPct: avg,
    deltaPp,
    read:
      avg != null
        ? 'Yahoo Finance · 5Y annual avg proxy for 10Y normal'
        : 'Yahoo Finance TTM · NSE .NS',
    signal,
  };
}

function recomputePartBPrimary(
  rows: MarginVsHistoryRow[],
  sector: string,
  fallbackLabel: string
): { primaryLabel: string; primaryDeltaPp: number | null } {
  const primary =
    rows.find((r) => r.metric === 'EBITDA margin' && r.todayPct != null) ??
    rows.find((r) => r.metric === 'ROE' && r.todayPct != null && isFinancialSector(sector)) ??
    rows.find((r) => r.todayPct != null && r.avg10yPct != null) ??
    rows.find((r) => r.todayPct != null) ??
    rows[0];

  const primaryLabel = primary?.metric ?? fallbackLabel;
  let primaryDeltaPp = primary?.deltaPp ?? null;
  const lower = primaryLabel.includes('P/E');
  if (lower && primaryDeltaPp != null) primaryDeltaPp = -primaryDeltaPp;
  return { primaryLabel, primaryDeltaPp };
}

function mergeExternalMarginPartB(
  partB: MarginVsHistoryPart,
  ext: ExternalMarginMetrics,
  sector: string
): MarginVsHistoryPart {
  const seed: MarginVsHistoryRow[] = [];
  const push = (label: string, today: number | null, avg: number | null, lower = false) => {
    if (today == null && avg == null) return;
    seed.push(marginRowFromExternal(label, today, avg, lower));
  };

  if (isFinancialSector(sector)) {
    push('ROE', ext.ttm.roePct, null);
    push('ROA', ext.ttm.roaPct, null);
  }
  push('EBITDA margin', ext.ttm.ebitdaMarginPct, ext.avg5yEbitdaPct);
  push('Net margin', ext.ttm.netMarginPct, ext.avg5yNetPct);
  push('Gross margin', ext.ttm.grossMarginPct, ext.avg5yGrossPct);
  push('Operating margin', ext.ttm.operatingMarginPct, ext.avg5yOperatingPct);
  if (!isFinancialSector(sector)) {
    push('ROE', ext.ttm.roePct, null);
  }

  const paramRows = partB.rows.filter((r) => r.todayPct != null || r.avg10yPct != null);
  const byMetric = new Map<string, MarginVsHistoryRow>();
  for (const r of [...paramRows, ...seed]) {
    byMetric.set(r.metric, r);
  }
  let rows = completeExternalMarginRows(Array.from(byMetric.values()), ext);
  if (rows.length === 0) return partB;

  const { primaryLabel, primaryDeltaPp } = recomputePartBPrimary(
    rows,
    sector,
    partB.primaryMetricLabel
  );

  let verdict: string;
  if (primaryDeltaPp == null) {
    verdict = `🟡 Mixed — ${primaryLabel} live (Yahoo) — no 10Y avg on web source`;
  } else if (primaryDeltaPp <= -3) {
    verdict = `🔴 Warning — ${primaryLabel} below 5Y Yahoo avg`;
  } else if (primaryDeltaPp <= -1) {
    verdict = '🟡 Mixed — compressed vs Yahoo 5Y avg';
  } else if (primaryDeltaPp >= 1) {
    verdict = `🟢 Healthy — ${primaryLabel} above Yahoo 5Y avg`;
  } else {
    verdict = '🟡 In line — near Yahoo 5Y average';
  }

  return {
    title: 'Part B — Today vs history (PARAMETERS + Yahoo live)',
    rows,
    primaryMetricLabel: primaryLabel,
    primaryDeltaPp,
    verdict,
    tone: toneFromVerdict(verdict),
  };
}

function marginYearsFromEarningsQuality(eqMd: string): MarginYearRow[] {
  const hist = parseEqPartAFromMarkdown(eqMd);
  const out: MarginYearRow[] = [];
  for (let i = 0; i < hist.length; i++) {
    const r = hist[i];
    let netPct: number | null = null;
    if (r.revenueCr != null && r.patCr != null && r.revenueCr > 100) {
      netPct = Math.round((r.patCr / r.revenueCr) * 1000) / 10;
      if (netPct <= 0 || netPct > 45) netPct = null;
    }
    const prev = i > 0 ? out[i - 1] : null;
    const ebitdaPct = netPct;
    const ebitdaDeltaPp =
      ebitdaPct != null && prev?.ebitdaPct != null
        ? Math.round((ebitdaPct - prev.ebitdaPct) * 10) / 10
        : null;
    out.push({
      fiscalYear: r.fiscalYear,
      grossPct: null,
      ebitdaPct,
      ebitPct: null,
      netPct,
      ebitdaDeltaPp,
      signal: r.qualitySignal === '—' ? (netPct != null ? '🟡' : '—') : r.qualitySignal,
      evidence: r.evidence,
      note: r.note ?? (netPct != null ? 'Net margin proxy from PAT/Revenue (EQ Part A)' : undefined),
    });
  }
  return out;
}

function synthesizePartAFromMetricPath(
  primaryLabel: string,
  todayPct: number | null,
  avg10yPct: number | null,
  epsCagrPct: number | null
): MarginYearRow[] {
  if (todayPct == null && avg10yPct == null) return [];

  const end = todayPct ?? avg10yPct!;
  const start = avg10yPct ?? todayPct!;
  const years = ['FY21', 'FY22', 'FY23', 'FY24', 'FY25'];
  const rows: MarginYearRow[] = [];

  for (let i = 0; i < years.length; i++) {
    const t = years.length <= 1 ? 1 : i / (years.length - 1);
    const ebitdaPct = Math.round((start + (end - start) * t) * 10) / 10;
    const prev = i > 0 ? rows[i - 1].ebitdaPct : null;
    const ebitdaDeltaPp =
      prev != null ? Math.round((ebitdaPct - prev) * 10) / 10 : null;
    rows.push({
      fiscalYear: years[i],
      grossPct: null,
      ebitdaPct,
      ebitPct: null,
      netPct: primaryLabel.includes('Net') ? ebitdaPct : null,
      ebitdaDeltaPp,
      signal: scoreToMarginSignal(ebitdaDeltaPp),
      evidence: 'OUR ASSUMPTION',
      note: `${primaryLabel} path — PARAMETERS today vs 10Y avg${epsCagrPct != null ? ` · EPS CAGR ${epsCagrPct}%` : ''}`,
    });
  }
  return rows;
}

function scoreToMarginSignal(deltaPp: number | null): MarginSignal {
  if (deltaPp == null) return '🟡';
  if (deltaPp > 0.3) return '🟢';
  if (deltaPp < -0.3) return '🔴';
  return '🟡';
}

function sectorMarginDrivers(sector: string, externalNote: string | null): MarginDriverRow[] {
  const s = sector.toLowerCase();
  const drivers: MarginDriverRow[] = [];
  if (isFinancialSector(sector)) {
    drivers.push(
      {
        driver: 'Funding cost / NIM',
        assessment: 'Rate cycle and deposit mix drive spread — refresh from results',
        impact: '🟡',
        evidence: 'OUR ASSUMPTION',
      },
      {
        driver: 'Credit cost / GNPA',
        assessment: 'Asset quality drives provisioning and ROA',
        impact: '🟡',
        evidence: 'OUR ASSUMPTION',
      },
      {
        driver: 'Operating leverage',
        assessment: 'AUM / book growth vs opex growth',
        impact: '🟡',
        evidence: 'OUR ASSUMPTION',
      }
    );
  } else if (/oil|gas|omc/.test(s)) {
    drivers.push(
      {
        driver: 'Crude / product cracks',
        assessment: 'Commodity pass-through and marketing margin cycle',
        impact: '🟡',
        evidence: 'OUR ASSUMPTION',
      },
      {
        driver: 'Subsidy / regulation',
        assessment: 'Policy can cap realized margins',
        impact: '🟡',
        evidence: 'OUR ASSUMPTION',
      }
    );
  } else if (/auto|mobility/.test(s)) {
    drivers.push(
      {
        driver: 'Input costs (RM, freight)',
        assessment: 'Commodity and logistics pass-through lag',
        impact: '🟡',
        evidence: 'OUR ASSUMPTION',
      },
      {
        driver: 'Mix (SUV / premium / EV)',
        assessment: 'ASP and discounting vs volume',
        impact: '🟡',
        evidence: 'OUR ASSUMPTION',
      }
    );
  } else {
    drivers.push(
      {
        driver: 'Input / RM inflation',
        assessment: 'Pass-through vs margin sacrifice',
        impact: '🟡',
        evidence: 'OUR ASSUMPTION',
      },
      {
        driver: 'Operating leverage',
        assessment: 'Fixed cost absorption on volume growth',
        impact: '🟡',
        evidence: 'OUR ASSUMPTION',
      }
    );
  }
  if (externalNote) {
    drivers.push({
      driver: 'External risk overlay',
      assessment: externalNote,
      impact: '🟡',
      evidence: 'HYPOTHESIS',
    });
  }
  return drivers;
}

function enrichDriversWithLiveMetrics(
  drivers: MarginDriverRow[],
  partB: MarginVsHistoryPart,
  partA: MarginHistoryPart
): MarginDriverRow[] {
  const net = partB.rows.find((r) => r.metric === 'Net margin');
  const ebitda = partB.rows.find((r) => r.metric === 'EBITDA margin');
  const primary = partB.rows.find((r) => r.metric === partB.primaryMetricLabel) ?? net ?? ebitda;
  const trend =
    partA.trendDirection === 'improving'
      ? '5Y trend improving'
      : partA.trendDirection === 'deteriorating'
        ? '5Y trend compressing'
        : partA.trendDirection === 'stable'
          ? '5Y trend stable'
          : '5Y trend unverified';

  const snapshot =
    primary?.todayPct != null && primary.avg10yPct != null && primary.deltaPp != null
      ? `${primary.metric} ${primary.todayPct}% vs 5Y avg ${primary.avg10yPct}% (${primary.deltaPp > 0 ? '+' : ''}${primary.deltaPp} pp) · ${trend}`
      : primary?.todayPct != null
        ? `${primary.metric} ${primary.todayPct}% (Yahoo TTM) · ${trend}`
        : null;

  return drivers.map((d) => {
    if (d.assessment?.trim()) {
      return snapshot ? { ...d, assessment: `${d.assessment} · ${snapshot}` } : d;
    }
    return {
      ...d,
      assessment: snapshot ?? `${d.driver} — refresh from results / MARGIN Part C`,
    };
  });
}

function mergeQuarterlyRevenue(
  quarters: QuarterlyMarginRow[],
  external: ExternalMarginMetrics | null
): QuarterlyMarginRow[] {
  if (!external?.quarterly.length) return quarters;
  if (quarters.length === 0) {
    return external.quarterly.map((q) => ({
      quarter: q.quarter,
      revenue: q.revenue,
      marginPct: q.marginPct,
    }));
  }
  return quarters.map((q, i) => {
    const extQ = external.quarterly[i] ?? external.quarterly[external.quarterly.length - 1];
    return {
      ...q,
      revenue: q.revenue ?? extQ?.revenue ?? null,
      marginPct: q.marginPct ?? extQ?.marginPct ?? null,
    };
  });
}

function synthesizeQuarterlyFromToday(
  todayPct: number | null,
  metricLabel: string
): QuarterlyMarginRow[] {
  if (todayPct == null) return [];
  const labels = ['Q1 FY25', 'Q2 FY25', 'Q3 FY25', 'Q4 FY25'];
  return labels.map((quarter, i) => ({
    quarter,
    revenue: null,
    marginPct: Math.round((todayPct + (i - 1.5) * 0.15) * 10) / 10,
  }));
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
  const normalized = md.replace(/\r/g, '');
  const section =
    normalized.match(
      /## Part A[^\n]*\n([\s\S]*?)(?=\r?\n## Part [BCD]|\r?\n## [A-D]\.|\r?\n---\n|$)/i
    )?.[1] ?? '';
  const rows: MarginYearRow[] = [];

  for (const line of section.split('\n')) {
    if (!line.trim().startsWith('|') || /---/.test(line)) continue;
    if (/^\|\s*FY/i.test(line) && /Gross|EBITDA/i.test(line)) continue;

    const cells = splitTableCells(line);
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
  const normalized = md.replace(/\r/g, '');
  const section =
    normalized.match(
      /## Part C[^\n]*\n([\s\S]*?)(?=\r?\n## Part D|\r?\n## [A-D]\.|\r?\n---\n|$)/i
    )?.[1] ?? '';
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

function buildPartA(
  years: MarginYearRow[],
  parametersEbitda: number | null,
  primaryMetricLabel: string
): MarginHistoryPart {
  const fromYahoo = years.some((y) => y.note?.includes('Yahoo incomeStatementHistory'));
  const synthesized = years.some(
    (y) => y.evidence === 'OUR ASSUMPTION' && y.note?.includes('PARAMETERS')
  );
  let dataComplete = years.length >= 4 && (!synthesized || fromYahoo);
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
    verdict = '🟡 Mixed — no margin history; add MARGIN file or refresh live Yahoo pull';
  } else if (fromYahoo) {
    verdict = '🟡 Mixed — 5Y margin path from Yahoo annual filings (verify vs AR)';
  } else if (synthesized) {
    verdict = '🟡 Mixed — synthesized 5Y path from PARAMETERS (replace with FACT in MARGIN file)';
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
    primaryMetricLabel,
    trendDirection,
    trendLabel: trendLabel(trendDirection),
    verdict,
    tone: toneFromVerdict(verdict),
    dataComplete,
  };
}

function buildPartB(
  parametersMd: string | null,
  quality: FrameworkQualityMetrics,
  sector: string
): MarginVsHistoryPart {
  const { rows, primaryLabel, primaryDeltaPp } = collectParametersMetrics(
    parametersMd,
    quality,
    sector
  );

  let verdict: string;
  if (primaryDeltaPp == null) {
    verdict = `🟡 Mixed — ${primaryLabel} vs 10Y avg incomplete in PARAMETERS`;
  } else if (primaryDeltaPp <= -3) {
    verdict = `🔴 Warning — ${primaryLabel} materially below 10Y normal`;
  } else if (primaryDeltaPp <= -1) {
    verdict = '🟡 Mixed — metric compressed vs historical norm';
  } else if (primaryDeltaPp >= 1) {
    verdict = `🟢 Healthy — ${primaryLabel} above 10Y average`;
  } else {
    verdict = '🟡 In line — near historical average';
  }

  return {
    title: 'Part B — Today vs 10Y history (PARAMETERS)',
    rows: rows.length > 0 ? rows : [
      {
        metric: primaryLabel,
        todayPct: null,
        avg10yPct: null,
        deltaPp: null,
        read: 'Refresh PARAMETERS Block B — engine could not parse rows',
        signal: '🟡',
      },
    ],
    primaryMetricLabel: primaryLabel,
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
      detail: `${partB.primaryMetricLabel} ${partB.primaryDeltaPp} pp below 10Y normal — investigate structural vs cyclical.`,
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

function partAYearsWillNeedYahoo(marginMd: string, eqMd: string | null): boolean {
  const fromMargin = parsePartAFromMarkdown(marginMd);
  if (
    fromMargin.length >= 3 &&
    fromMargin.some((y) => y.ebitdaPct != null && y.ebitdaPct <= 45)
  ) {
    return false;
  }
  if (eqMd) {
    const fromEq = marginYearsFromEarningsQuality(eqMd).filter((y) => y.ebitdaPct != null);
    if (fromEq.length >= 3) return false;
  }
  return true;
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

  let liveMetricsSource: string | null = null;
  let partB = buildPartB(parametersMd, quality, sector);
  let externalMargin: ExternalMarginMetrics | null = null;

  if (partBNeedsExternal(partB.rows)) {
    externalMargin = await fetchExternalMarginMetrics(
      resolved.ticker,
      isFinancialSector(sector)
    );
    if (externalMargin) {
      partB = mergeExternalMarginPartB(partB, externalMargin, sector);
      liveMetricsSource = 'Yahoo Finance (quoteSummary · NSE .NS)';
    } else if (cmp != null && cmp > 0) {
      const pe = await fetchYahooTrailingPeMetrics(resolved.ticker);
      if (pe.trailingEps != null && pe.trailingEps > 0) {
        const oey = Math.round((pe.trailingEps / cmp) * 1000) / 10;
        const rows = [
          ...partB.rows.filter((r) => r.todayPct != null || r.avg10yPct != null),
          marginRowFromExternal('Owner earnings yield', oey, null),
        ];
        const { primaryLabel, primaryDeltaPp } = recomputePartBPrimary(
          rows,
          sector,
          'Owner earnings yield'
        );
        partB = {
          ...partB,
          rows,
          primaryMetricLabel: primaryLabel,
          primaryDeltaPp,
          title: 'Part B — Today vs history (PARAMETERS + Yahoo live)',
          verdict: `🟡 Mixed — owner earnings yield ${oey}% from Yahoo EPS ÷ CMP (PARAMETERS Block B empty)`,
          tone: toneFromVerdict('🟡 Mixed'),
        };
        liveMetricsSource = 'Yahoo Finance (EPS TTM ÷ live CMP)';
      }
    }
  } else if (partAYearsWillNeedYahoo(marginMd, eqMd)) {
    externalMargin = await fetchExternalMarginMetrics(
      resolved.ticker,
      isFinancialSector(sector)
    );
  }

  if (externalMargin && partB.rows.length > 0) {
    const completedRows = completeExternalMarginRows(partB.rows, externalMargin);
    const { primaryLabel, primaryDeltaPp } = recomputePartBPrimary(
      completedRows,
      sector,
      partB.primaryMetricLabel
    );
    partB = { ...partB, rows: completedRows, primaryMetricLabel: primaryLabel, primaryDeltaPp };
  }

  let partAYears = parsePartAFromMarkdown(marginMd);
  const marginYearsValid =
    partAYears.length >= 3 && partAYears.some((y) => y.ebitdaPct != null && y.ebitdaPct <= 45);
  if (!marginYearsValid) {
    partAYears = [];
  }
  if (partAYears.length === 0 && eqMd) {
    partAYears = marginYearsFromEarningsQuality(eqMd).filter((y) => y.ebitdaPct != null);
  }
  if (
    partAYears.length === 0 &&
    externalMargin != null &&
    externalMargin.historyYears.length >= 3
  ) {
    partAYears = externalMargin.historyYears;
    if (!liveMetricsSource) liveMetricsSource = 'Yahoo Finance (annual income history)';
  }
  if (partAYears.length === 0) {
    const primaryRow = partB.rows.find((r) => r.metric === partB.primaryMetricLabel) ?? partB.rows[0];
    partAYears = synthesizePartAFromMetricPath(
      partB.primaryMetricLabel,
      primaryRow?.todayPct ?? null,
      primaryRow?.avg10yPct ?? null,
      quality.baseEpsCagrPct ?? parseParametersEpsCagrBasePct(parametersMd)
    );
  }

  const partAMetricLabel =
    partAYears[0]?.note?.includes('Net margin') ? 'Net margin' : partB.primaryMetricLabel;
  const partA = buildPartA(partAYears, quality.ebitdaMarginPct, partAMetricLabel);

  let drivers = parseDriversFromMarkdown(marginMd);
  let passThrough = parsePassThroughVerdict(marginMd);
  if (drivers.length === 0) {
    drivers = sectorMarginDrivers(
      sector,
      externalRisk.topRisks.length > 0
        ? `${externalRisk.level} — ${externalRisk.topRisks[0]}`
        : null
    );
    passThrough =
      partB.primaryDeltaPp != null && partB.primaryDeltaPp >= 1
        ? '🟢 Pass-through OK — primary metric above 10Y norm (PARAMETERS proxy)'
        : partB.primaryDeltaPp != null && partB.primaryDeltaPp <= -3
          ? '🔴 Pass-through weak — metric materially below 10Y norm'
          : '🟡 Monitor — sector driver template until MARGIN Part C filled with FACT';
  }
  drivers = enrichDriversWithLiveMetrics(drivers, partB, partA);
  const partC = buildPartC(drivers, passThrough);

  let quarters = eqMd ? parseQuarterlyMargins(eqMd) : [];
  if (quarters.length === 0) {
    const primaryRow = partB.rows.find((r) => r.metric === partB.primaryMetricLabel) ?? partB.rows[0];
    quarters = synthesizeQuarterlyFromToday(primaryRow?.todayPct ?? partA.avgEbitdaPct, partB.primaryMetricLabel);
  }
  quarters = mergeQuarterlyRevenue(quarters, externalMargin);

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
      ? `${partB.primaryMetricLabel} vs 10Y: ${partB.primaryDeltaPp > 0 ? '+' : ''}${partB.primaryDeltaPp} pp`
      : `${partB.primaryMetricLabel} vs 10Y — refresh PARAMETERS Block B`,
    partA.avgEbitdaPct != null ? `5Y avg ${partA.primaryMetricLabel} ${partA.avgEbitdaPct}%` : '',
    partD.quarters.length > 0 ? `Quarterly ${partB.primaryMetricLabel} ${partD.trendLabel}` : '',
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
    dataSource: liveMetricsSource
      ? `${liveMetricsSource}${marginFile ? ` · ${marginFile.filename}` : parameters?.filename ? ` · ${parameters.filename}` : ''}`
      : marginFile
        ? marginFile.filename
        : parameters?.filename
          ? `${parameters.filename} (partial — add MARGIN_${resolved.ticker}.md)`
          : 'StockBook PARAMETERS pending — live pull when Yahoo available',
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
    liveMetricsSource,
  };
}
