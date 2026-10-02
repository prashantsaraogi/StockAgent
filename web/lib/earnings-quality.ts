/**
 * Earnings Quality — Stock Calculator Tab 3
 * StockBook/EARNINGS-QUALITY-FRAMEWORK.md
 */

import fs from 'fs/promises';
import path from 'path';
import { readStockTabContent } from './content';
import { getRepoRoot } from './framework-paths';
import { getStockbookByTicker } from './stockbook-index';
import { resolveStock } from './stock-search';
import { fetchLiveNseCmp } from './nse-cmp';
import { stockbookPath } from './navigation';
import { buildPartA, buildPartB } from './earnings-quality-parts';
import { enrichForwardYearContext } from './earnings-quality-context';
import {
  parseFrameworkQualityMetrics,
  parseRiskFactor,
  type FrameworkQualityMetrics,
} from './stock-calculator-framework';

export type EvidenceType = 'FACT' | 'MANAGEMENT CLAIM' | 'HYPOTHESIS' | 'OUR ASSUMPTION' | 'UNVERIFIED';
export type TrendSignal = 'improving' | 'stable' | 'deteriorating' | 'unknown';
export type QualityTone = 'good' | 'neutral' | 'warn' | 'bad';

export interface EarningsQualityMetric {
  id: string;
  label: string;
  value: string;
  numeric: number | null;
  unit: 'pct' | 'inr_cr' | 'days' | 'ratio' | 'text';
  evidence: EvidenceType;
  note?: string;
}

export interface QuarterlyRow {
  quarter: string;
  revenue: number | null;
  ebitda: number | null;
  marginPct: number | null;
  pat: number | null;
  eps: number | null;
  cfo: number | null;
}

export interface QuarterlyTrendRow {
  metric: string;
  values: (number | null)[];
  quarterLabels: string[];
  trend: TrendSignal;
  trendLabel: string;
  changePct: number | null;
}

export interface EarningsQualityWarning {
  id: string;
  severity: 'warn' | 'bad';
  title: string;
  detail: string;
}

export interface EarningsQualityResult {
  ticker: string;
  stockName: string;
  sector: string;
  cmp: number | null;
  cmpSource: string;
  analyzedAt: string;
  coreQuestion: string;
  dataSource: string;
  earningsQualityFile: string | null;
  parametersFile: string | null;
  stockbookUrl: string;
  /** Part A — 5Y historical EPS / growth quality */
  partA?: import('./earnings-quality-parts').EarningsQualityPartA;
  /** Part B — 5Y forward risk-adjusted EPS path */
  partB?: import('./earnings-quality-parts').EarningsQualityPartB;
  growth: EarningsQualityMetric[];
  profitability: EarningsQualityMetric[];
  cashQuality: EarningsQualityMetric[];
  quarterly: QuarterlyRow[];
  quarterlyTrends: QuarterlyTrendRow[];
  annualSignals: { label: string; signal: '🟢' | '🟡' | '🔴' | '—' }[];
  warnings: EarningsQualityWarning[];
  overallVerdict: string;
  overallTone: QualityTone;
  summaryLines: string[];
}

export interface RunEarningsQualityInput {
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
  if (s.includes('UNVERIFIED')) return 'UNVERIFIED';
  return 'UNVERIFIED';
}

function trendFromChange(pct: number | null): TrendSignal {
  if (pct == null || !Number.isFinite(pct)) return 'unknown';
  if (pct > 3) return 'improving';
  if (pct < -3) return 'deteriorating';
  return 'stable';
}

function trendLabel(t: TrendSignal): string {
  if (t === 'improving') return '↑ Improving';
  if (t === 'deteriorating') return '↓ Deteriorating';
  if (t === 'stable') return '→ Stable';
  return '— Unknown';
}

function toneFromVerdict(v: string): QualityTone {
  if (v.startsWith('🟢')) return 'good';
  if (v.startsWith('🔴')) return 'bad';
  return 'warn';
}

async function readEarningsQualityFile(
  sector: string,
  stock: string,
  ticker: string,
  tenantId: string
): Promise<{ content: string; filename: string } | null> {
  const dirs = [
    path.join(getRepoRoot(), 'StockBook', sector, stock),
  ];
  const { getUserPaths } = await import('./tenant');
  dirs.unshift(path.join(getUserPaths(tenantId).stockbookDir, sector, stock));

  for (const dir of dirs) {
    try {
      const files = await fs.readdir(dir);
      const hit =
        files.find((f) => f.toUpperCase() === `EARNINGS_QUALITY_${ticker.toUpperCase()}.md`) ??
        files.find((f) => f.startsWith('EARNINGS_QUALITY_') && f.endsWith('.md'));
      if (hit) {
        const content = await fs.readFile(path.join(dir, hit), 'utf8');
        return { content, filename: hit };
      }
    } catch {
      /* next dir */
    }
  }
  return null;
}

function parseSectionTable(
  md: string,
  sectionLetter: 'A' | 'B' | 'C'
): Map<string, { value: string; evidence: EvidenceType; note?: string }> {
  const out = new Map<string, { value: string; evidence: EvidenceType; note?: string }>();
  const sectionRe = new RegExp(
    `## ${sectionLetter}\\.[^\\n]+\\n([\\s\\S]*?)(?=\\n## [A-D]\\.|\\n---|$)`,
    'i'
  );
  const section = md.match(sectionRe)?.[1];
  if (!section) return out;

  for (const line of section.split('\n')) {
    if (!line.trim().startsWith('|') || line.includes('Metric') || line.includes('---')) continue;
    const cells = line
      .split('|')
      .map((c) => c.trim())
      .filter(Boolean);
    if (cells.length < 2) continue;
    const label = cells[0].replace(/\*\*/g, '').trim();
    const value = cells[1].replace(/\*\*/g, '').trim();
    const evidence = parseEvidence(cells[cells.length - 1]);
    const note = cells.length > 3 ? cells.slice(2, -1).join(' · ') : cells[2];
    out.set(label.toLowerCase(), { value, evidence, note });
  }
  return out;
}

function parseQuarterlySection(md: string): QuarterlyRow[] {
  const sectionRe = /## D\.[^\n]+\n([\s\S]*?)(?=\n## |\n\*\*Notes|\n---|$)/i;
  const section = md.match(sectionRe)?.[1];
  if (!section) return [];

  const rows: QuarterlyRow[] = [];
  for (const line of section.split('\n')) {
    if (!line.trim().startsWith('|') || /Quarter|Metric|---/i.test(line)) continue;
    const cells = line
      .split('|')
      .map((c) => c.trim())
      .filter(Boolean);
    if (cells.length < 2 || !/^Q\d/i.test(cells[0])) continue;

    rows.push({
      quarter: cells[0],
      revenue: parseNum(cells[1]),
      ebitda: parseNum(cells[2]),
      marginPct: parseNum(cells[3]),
      pat: parseNum(cells[4]),
      eps: parseNum(cells[5]),
      cfo: cells[6] ? parseNum(cells[6]) : null,
    });
  }
  return rows.slice(-8);
}

function metricFromMap(
  map: Map<string, { value: string; evidence: EvidenceType; note?: string }>,
  patterns: string[],
  id: string,
  label: string,
  unit: EarningsQualityMetric['unit']
): EarningsQualityMetric {
  for (const p of patterns) {
    for (const [key, val] of map) {
      if (key.includes(p)) {
        return {
          id,
          label,
          value: val.value,
          numeric: parseNum(val.value),
          unit,
          evidence: val.evidence,
          note: val.note,
        };
      }
    }
  }
  return { id, label, value: '—', numeric: null, unit, evidence: 'UNVERIFIED' };
}

function buildQuarterlyTrends(quarters: QuarterlyRow[]): QuarterlyTrendRow[] {
  if (quarters.length < 2) return [];

  const labels = quarters.map((q) => q.quarter);
  const specs: { metric: string; key: keyof QuarterlyRow }[] = [
    { metric: 'Revenue', key: 'revenue' },
    { metric: 'EBITDA', key: 'ebitda' },
    { metric: 'Margin', key: 'marginPct' },
    { metric: 'PAT', key: 'pat' },
    { metric: 'EPS', key: 'eps' },
    { metric: 'CFO', key: 'cfo' },
  ];

  return specs.map(({ metric, key }) => {
    const values = quarters.map((q) => q[key] as number | null);
    const valid = values.filter((v): v is number => v != null);
    let changePct: number | null = null;

    if (valid.length >= 2) {
      const latest = values[values.length - 1];
      const prior = values[values.length - 2];
      if (latest != null && prior != null && prior !== 0) {
        changePct = ((latest - prior) / Math.abs(prior)) * 100;
      } else if (valid.length >= 4) {
        const first = valid[0];
        const last = valid[valid.length - 1];
        if (first !== 0) changePct = ((last - first) / Math.abs(first)) * 100;
      }
    }

    // YoY: compare latest vs 4 quarters back when available
    if (values.length >= 5) {
      const latest = values[values.length - 1];
      const yoy = values[values.length - 5];
      if (latest != null && yoy != null && yoy !== 0) {
        changePct = ((latest - yoy) / Math.abs(yoy)) * 100;
      }
    }

    const trend = trendFromChange(changePct);
    return {
      metric,
      values,
      quarterLabels: labels,
      trend,
      trendLabel: trendLabel(trend),
      changePct,
    };
  });
}

function detectWarnings(
  quarters: QuarterlyRow[],
  trends: QuarterlyTrendRow[]
): EarningsQualityWarning[] {
  const warnings: EarningsQualityWarning[] = [];
  if (quarters.length < 2) return warnings;

  const latest = quarters[quarters.length - 1];
  const yoyQuarter = quarters.length >= 5 ? quarters[quarters.length - 5] : null;

  if (latest.revenue != null && latest.pat != null && yoyQuarter?.revenue != null && yoyQuarter.pat != null) {
    const revYoY = ((latest.revenue - yoyQuarter.revenue) / yoyQuarter.revenue) * 100;
    const patYoY = ((latest.pat - yoyQuarter.pat) / yoyQuarter.pat) * 100;

    if (revYoY > 5 && patYoY < 0) {
      warnings.push({
        id: 'rev-up-pat-down',
        severity: 'warn',
        title: '⚠️ Earnings quality warning',
        detail: `Growth is currently not translating into profit growth. ${latest.quarter}: revenue ${revYoY > 0 ? '+' : ''}${revYoY.toFixed(1)}% YoY but PAT ${patYoY.toFixed(1)}% YoY.`,
      });
    }
  }

  const revTrend = trends.find((t) => t.metric === 'Revenue');
  const patTrend = trends.find((t) => t.metric === 'PAT');
  if (
    revTrend?.trend === 'improving' &&
    patTrend?.trend === 'deteriorating' &&
    !warnings.some((w) => w.id === 'rev-up-pat-down')
  ) {
    warnings.push({
      id: 'rev-trend-pat-div',
      severity: 'warn',
      title: '⚠️ Revenue–profit divergence',
      detail: 'Revenue trend improving while PAT trend deteriorating — check margin and cost pass-through.',
    });
  }

  const marginTrend = trends.find((t) => t.metric === 'Margin');
  if (marginTrend?.trend === 'deteriorating' && revTrend?.trend === 'improving') {
    warnings.push({
      id: 'margin-compression',
      severity: 'warn',
      title: 'Margin compression with volume/revenue up',
      detail: 'Input costs or mix may be absorbing top-line gains — verify if temporary (commodity/FX) or structural.',
    });
  }

  const patUp = patTrend?.trend === 'improving';
  const cfoTrend = trends.find((t) => t.metric === 'CFO');
  if (patUp && cfoTrend?.trend === 'deteriorating' && cfoTrend.values.some((v) => v != null)) {
    warnings.push({
      id: 'pat-cfo-gap',
      severity: 'warn',
      title: 'PAT up but CFO weak',
      detail: 'Reported profit may be accrual-heavy — verify working capital and cash conversion.',
    });
  }

  return warnings;
}

function buildAnnualSignals(
  growth: EarningsQualityMetric[],
  profitability: EarningsQualityMetric[],
  trends: QuarterlyTrendRow[]
): { label: string; signal: '🟢' | '🟡' | '🔴' | '—' }[] {
  const revCagr = growth.find((g) => g.id === 'rev_cagr_3y')?.numeric;
  const vol = growth.find((g) => g.id === 'volume_growth')?.numeric;
  const patCagr = growth.find((g) => g.id === 'pat_cagr')?.numeric;
  const roe = profitability.find((p) => p.id === 'roe')?.numeric;

  const sig = (n: number | null | undefined, good: number, warn: number): '🟢' | '🟡' | '🔴' | '—' => {
    if (n == null) return '—';
    if (n >= good) return '🟢';
    if (n >= warn) return '🟡';
    return '🔴';
  };

  return [
    { label: 'Revenue', signal: sig(revCagr, 10, 5) },
    { label: 'Volume', signal: sig(vol, 5, 0) },
    { label: 'Profit', signal: sig(patCagr, 10, 0) },
    { label: 'Scale', signal: sig(revCagr, 15, 8) },
    {
      label: 'Returns (ROE)',
      signal: roe != null ? (roe >= 15 ? '🟢' : roe >= 12 ? '🟡' : '🔴') : '—',
    },
    {
      label: 'Quarterly PAT',
      signal:
        trends.find((t) => t.metric === 'PAT')?.trend === 'improving'
          ? '🟢'
          : trends.find((t) => t.metric === 'PAT')?.trend === 'deteriorating'
            ? '🔴'
            : '🟡',
    },
  ];
}

function combineOverallVerdict(
  quarterlyVerdict: string,
  partAVerdict: string,
  partBVerdict: string
): string {
  if (
    quarterlyVerdict.startsWith('🔴') ||
    partAVerdict.startsWith('🔴') ||
    partBVerdict.startsWith('🔴')
  ) {
    return '🔴 Warning — rear-view, forward risk path, or quarterly cross-check flagged';
  }
  if (
    quarterlyVerdict.startsWith('🟡') ||
    partAVerdict.startsWith('🟡') ||
    partBVerdict.startsWith('🟡')
  ) {
    return '🟡 Mixed — monitor 5Y history vs risk-adjusted forward EPS';
  }
  return '🟢 Healthy — historical EPS quality and forward path aligned';
}

function overallVerdict(
  warnings: EarningsQualityWarning[],
  trends: QuarterlyTrendRow[]
): string {
  if (warnings.some((w) => w.severity === 'bad')) return '🔴 Warning — material earnings quality issues';
  if (warnings.length > 0) return '🟡 Mixed — cross-check warnings active; quarterly ≠ annual picture';
  const deteriorating = trends.filter((t) => t.trend === 'deteriorating').length;
  if (deteriorating >= 2) return '🟡 Mixed — multiple quarterly metrics deteriorating';
  const improving = trends.filter((t) => t.trend === 'improving').length;
  if (improving >= 3 && deteriorating === 0) return '🟢 Healthy — growth, profit, and trends aligned';
  return '🟡 Mixed — monitor quarterly translation of top-line growth';
}

function enrichFromParameters(
  growth: EarningsQualityMetric[],
  profitability: EarningsQualityMetric[],
  cashQuality: EarningsQualityMetric[],
  quality: FrameworkQualityMetrics,
  parametersMd: string | null
): void {
  const fill = (
    arr: EarningsQualityMetric[],
    id: string,
    value: string,
    numeric: number | null,
    evidence: EvidenceType = 'FACT'
  ) => {
    const row = arr.find((m) => m.id === id);
    if (row && row.value === '—') {
      row.value = value;
      row.numeric = numeric;
      row.evidence = evidence;
    }
  };

  if (quality.baseEpsCagrPct != null) {
    fill(growth, 'eps_cagr', quality.baseEpsCagrRange ?? `${quality.baseEpsCagrPct}%`, quality.baseEpsCagrPct);
  }
  if (quality.ebitdaMarginPct != null) {
    fill(profitability, 'ebitda_margin', quality.ebitdaDisplay, quality.ebitdaMarginPct);
  }
  if (quality.roePct != null) {
    fill(profitability, 'roe', quality.roeDisplay, quality.roePct);
  }
  if (quality.cashFlowDisplay !== '—') {
    fill(cashQuality, 'cfo', quality.cashFlowDisplay, null);
  }

  if (parametersMd) {
    const volMatch = parametersMd.match(/\|\s*\*\*Volume CAGR[^|]*\*\*[\s\S]*?\|\s*[^|]+\|\s*\*\*([^|*]+)\*\*/i);
    if (volMatch) {
      fill(growth, 'volume_growth', volMatch[1].trim(), parseNum(volMatch[1]));
    }
  }
}

export async function runEarningsQualityAnalysis(
  input: RunEarningsQualityInput
): Promise<EarningsQualityResult | null> {
  const resolved = await resolveStock(input.ticker.trim());
  if (!resolved) return null;

  const loc = await getStockbookByTicker(resolved.ticker);
  const sector = loc?.sector ?? resolved.sector;
  const stockName = loc?.stock ?? resolved.company;

  const eqFile = await readEarningsQualityFile(sector, stockName, resolved.ticker, input.tenantId);
  const parameters = await readStockTabContent(sector, stockName, 'parameters', input.tenantId);
  const detail = await readStockTabContent(sector, stockName, 'detail', input.tenantId);

  const eqMd = eqFile?.content ?? '';
  const parametersMd = parameters?.content ?? null;
  const internal = await readStockTabContent(sector, stockName, 'internal-risk', input.tenantId);
  const external = await readStockTabContent(sector, stockName, 'external-risk', input.tenantId);
  const quality = parseFrameworkQualityMetrics(parametersMd, detail?.content ?? null);
  const internalRisk = parseRiskFactor(internal?.content ?? null, 'internal-negative-risk.md');
  const externalRisk = parseRiskFactor(external?.content ?? null, 'external-negative-risk.md');

  const growthMap = parseSectionTable(eqMd, 'A');
  const profitMap = parseSectionTable(eqMd, 'B');
  const cashMap = parseSectionTable(eqMd, 'C');

  const growth: EarningsQualityMetric[] = [
    metricFromMap(growthMap, ['revenue cagr (3y)', 'revenue cagr 3'], 'rev_cagr_3y', 'Revenue CAGR (3Y)', 'pct'),
    metricFromMap(growthMap, ['revenue cagr (5y)', 'revenue cagr 5'], 'rev_cagr_5y', 'Revenue CAGR (5Y)', 'pct'),
    metricFromMap(growthMap, ['ebitda cagr'], 'ebitda_cagr', 'EBITDA CAGR', 'pct'),
    metricFromMap(growthMap, ['pat cagr'], 'pat_cagr', 'PAT CAGR', 'pct'),
    metricFromMap(growthMap, ['eps cagr'], 'eps_cagr', 'EPS CAGR', 'pct'),
    metricFromMap(growthMap, ['volume growth'], 'volume_growth', 'Volume growth', 'pct'),
  ];

  const profitability: EarningsQualityMetric[] = [
    metricFromMap(profitMap, ['gross margin'], 'gross_margin', 'Gross margin', 'pct'),
    metricFromMap(profitMap, ['ebitda margin'], 'ebitda_margin', 'EBITDA margin', 'pct'),
    metricFromMap(profitMap, ['ebit margin'], 'ebit_margin', 'EBIT margin', 'pct'),
    metricFromMap(profitMap, ['net margin'], 'net_margin', 'Net margin', 'pct'),
    metricFromMap(profitMap, ['roe'], 'roe', 'ROE', 'pct'),
    metricFromMap(profitMap, ['roce'], 'roce', 'ROCE', 'pct'),
  ];

  const cashQuality: EarningsQualityMetric[] = [
    metricFromMap(cashMap, ['cfo'], 'cfo', 'CFO', 'inr_cr'),
    metricFromMap(cashMap, ['fcf'], 'fcf', 'FCF', 'inr_cr'),
    metricFromMap(cashMap, ['cfo / pat', 'cfo/pat'], 'cfo_pat', 'CFO / PAT', 'ratio'),
    metricFromMap(cashMap, ['fcf / pat', 'fcf/pat'], 'fcf_pat', 'FCF / PAT', 'ratio'),
    metricFromMap(cashMap, ['working capital'], 'working_capital', 'Working capital', 'text'),
    metricFromMap(cashMap, ['receivables days', 'receivable'], 'receivable_days', 'Receivables days', 'days'),
    metricFromMap(cashMap, ['inventory days', 'inventory'], 'inventory_days', 'Inventory days', 'days'),
  ];

  enrichFromParameters(growth, profitability, cashQuality, quality, parametersMd);

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

  const quarterly = parseQuarterlySection(eqMd);
  const quarterlyTrends = buildQuarterlyTrends(quarterly);
  const warnings = detectWarnings(quarterly, quarterlyTrends);
  const annualSignals = buildAnnualSignals(growth, profitability, quarterlyTrends);

  const cfoPatMetric = cashQuality.find((c) => c.id === 'cfo_pat');

  let latestEps: number | null = null;
  if (quarterly.length > 0 && quarterly[quarterly.length - 1].eps != null) {
    latestEps = quarterly[quarterly.length - 1].eps;
  }
  if (latestEps == null && parametersMd && cmp != null) {
    const peMatch = parametersMd.match(/\|\s*\*\*P\/E\*\*[^\n]+\|\s*\*\*([\d.]+)x\*\*/i);
    if (peMatch) {
      const pe = parseFloat(peMatch[1]);
      if (pe > 0) latestEps = cmp / pe;
    }
  }

  const partA = buildPartA({
    eqMd,
    latestEps,
    epsCagr5y: growth.find((g) => g.id === 'eps_cagr')?.numeric ?? quality.baseEpsCagrPct,
    patCagr5y: growth.find((g) => g.id === 'pat_cagr')?.numeric ?? null,
    revCagr5y: growth.find((g) => g.id === 'rev_cagr_5y')?.numeric ?? null,
    cfoPatRatio: cfoPatMetric?.numeric ?? null,
  });

  const startingEps =
    latestEps ??
    (partA.years.length > 0 ? partA.years[partA.years.length - 1].eps : null) ??
    1;

  const currentMonth = new Date().getMonth();
  const startFyNum =
    currentMonth >= 3 ? new Date().getFullYear() + 1 : new Date().getFullYear();
  const fiscalYears = Array.from({ length: 5 }, (_, i) =>
    `FY${String(startFyNum + i).slice(-2)}`
  );

  const { notes: aiYearNotes, aiEnriched } = await enrichForwardYearContext({
    ticker: resolved.ticker,
    stockName,
    sector,
    internalRisk,
    externalRisk,
    fiscalYears,
  });

  const partB = buildPartB({
    startingEps,
    quality,
    internalRisk,
    externalRisk,
    aiYearNotes,
  });
  partB.aiEnriched = aiEnriched;

  const verdict = combineOverallVerdict(
    overallVerdict(warnings, quarterlyTrends),
    partA.verdict,
    partB.verdict
  );

  const summaryLines: string[] = [
    partA.epsCagr5y != null ? `5Y EPS CAGR ${partA.epsCagr5y}%` : '5Y EPS — add Part A table',
    partB.years.length > 0
      ? `Forward FY27 adj growth ${partB.years[0].adjustedEpsGrowthPct}% → EPS ₹${partB.years[0].projectedEps}`
      : '',
    `Annual: ${annualSignals.map((s) => `${s.label} ${s.signal}`).join(' · ')}`,
  ].filter(Boolean);
  if (warnings.length > 0) {
    summaryLines.push(warnings[0].detail);
  } else if (quarterly.length >= 4) {
    summaryLines.push(
      `Latest quarter ${quarterly[quarterly.length - 1].quarter}: revenue and PAT trends ${quarterlyTrends.find((t) => t.metric === 'PAT')?.trendLabel ?? '—'}.`
    );
  }

  return {
    ticker: resolved.ticker,
    stockName,
    sector,
    cmp,
    cmpSource,
    analyzedAt: new Date().toISOString(),
    coreQuestion:
      'Are the company\'s sales, profits, cash flow and returns improving in a healthy way?',
    dataSource: eqFile
      ? eqFile.filename
      : parameters?.filename
        ? `${parameters.filename} (partial — add EARNINGS_QUALITY_${resolved.ticker}.md)`
        : 'No earnings quality file',
    earningsQualityFile: eqFile?.filename ?? null,
    parametersFile: parameters?.filename ?? null,
    stockbookUrl: stockbookPath(sector, stockName, 'parameters'),
    partA,
    partB,
    growth,
    profitability,
    cashQuality,
    quarterly,
    quarterlyTrends,
    annualSignals,
    warnings,
    overallVerdict: verdict,
    overallTone: toneFromVerdict(verdict),
    summaryLines,
  };
}
