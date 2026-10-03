/**
 * PEG Evaluation — Stock Calculator tab
 * StockBook/PEG-FRAMEWORK.md
 */

import fs from 'fs/promises';
import path from 'path';
import { readStockTabContent } from './content';
import { getRepoRoot } from './framework-paths';
import { getStockbookByTicker } from './stockbook-index';
import { resolveStock } from './stock-search';
import { fetchLiveNseCmp } from './nse-cmp';
import { stockbookPath } from './navigation';
import { parseParametersMetrics } from './stock-calculator-engine';
import { parseFrameworkQualityMetrics } from './stock-calculator-framework';
import { runEarningsQualityAnalysis } from './earnings-quality';
import { getBundledParametersMd, getBundledPegMd } from './load-bundled-stockbook';

export type PegZone = '🟢' | '🟡' | '🟠' | '🔴' | '—';
export type QualityTone = 'good' | 'neutral' | 'warn' | 'bad';
export type EvidenceType = 'FACT' | 'MANAGEMENT CLAIM' | 'HYPOTHESIS' | 'OUR ASSUMPTION' | 'UNVERIFIED';

export interface PegScorecardRow {
  id: string;
  parameter: string;
  value: string;
  zone: PegZone;
  indicates: string;
  evidence: EvidenceType;
}

export interface PegSensitivityRow {
  epsGrowthPct: number;
  peAtPeg1: number;
  peAtPeg15: number;
  peAtPeg2: number;
  peAtPeg25: number;
}

export interface PegPointsBlock {
  id: string;
  label: string;
  maxPoints: number;
  earnedPoints: number;
  zone: PegZone;
  note?: string;
}

export interface PegComboCheck {
  label: string;
  passed: boolean;
  detail: string;
}

export interface PegEvaluationResult {
  ticker: string;
  stockName: string;
  sector: string;
  cmp: number | null;
  cmpSource: string;
  analyzedAt: string;
  coreQuestion: string;
  dataSource: string;
  pegFile: string | null;
  parametersFile: string | null;
  stockbookUrl: string;
  ttmPe: number | null;
  epsGrowthPct: number | null;
  pegRatio: number | null;
  pegZone: PegZone;
  scorecard: PegScorecardRow[];
  areaScores: {
    businessQuality: number | null;
    growth: number | null;
    roce: number | null;
    balanceSheet: number | null;
    cashGeneration: number | null;
    valuation: number | null;
    peg: number | null;
    overall10: number | null;
  };
  pointsBreakdown: PegPointsBlock[];
  totalScore100: number;
  sensitivity: PegSensitivityRow[];
  comboChecks: PegComboCheck[];
  maxPeAtTargetPeg: { peg: number; maxPe: number | null }[];
  warnings: { id: string; title: string; detail: string }[];
  overallVerdict: string;
  overallTone: QualityTone;
  opportunityType: string;
  summaryLines: string[];
  fcfIndustryMode: 'consumer' | 'infra' | 'financial' | 'unknown';
}

export interface RunPegEvaluationInput {
  ticker: string;
  tenantId: string;
}

interface PegOverrides {
  ttmPe?: number | null;
  epsGrowthPct?: number | null;
  revenueGrowthPct?: number | null;
  patGrowthPct?: number | null;
  rocePct?: number | null;
  debtEquity?: number | null;
  netCashCr?: number | null;
  fcfCr?: number | null;
  fcfMarginPct?: number | null;
  dividendYieldPct?: number | null;
  fcfIndustryMode?: string | null;
  businessQualityScore10?: number | null;
  fcfSustainabilityNote?: string | null;
}

function parseNum(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const s = raw.replace(/,/g, '').replace(/[₹Rs.%cr×x\s]/gi, '').trim();
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

function zonePe(pe: number | null): PegZone {
  if (pe == null) return '—';
  if (pe < 20) return '🟢';
  if (pe < 30) return '🟡';
  if (pe < 50) return '🟠';
  return '🔴';
}

function zonePeg(peg: number | null): PegZone {
  if (peg == null) return '—';
  if (peg < 1) return '🟢';
  if (peg < 1.5) return '🟡';
  if (peg < 2.5) return '🟠';
  return '🔴';
}

function zoneRoce(pct: number | null): PegZone {
  if (pct == null) return '—';
  if (pct > 20) return '🟢';
  if (pct >= 15) return '🟡';
  if (pct >= 10) return '🟠';
  return '🔴';
}

function zoneGrowth(pct: number | null): PegZone {
  if (pct == null) return '—';
  if (pct > 15) return '🟢';
  if (pct >= 10) return '🟡';
  if (pct >= 5) return '🟠';
  return '🔴';
}

function zoneDebt(ratio: number | null, netCash: boolean): PegZone {
  if (netCash) return '🟢';
  if (ratio == null) return '—';
  if (ratio < 0.3) return '🟢';
  if (ratio < 0.7) return '🟡';
  if (ratio < 1.5) return '🟠';
  return '🔴';
}

function zoneToPoints(zone: PegZone, max: number): number {
  if (zone === '🟢') return max;
  if (zone === '🟡') return Math.round(max * 0.75);
  if (zone === '🟠') return Math.round(max * 0.45);
  if (zone === '🔴') return Math.round(max * 0.2);
  return Math.round(max * 0.5);
}

function toneFromScore100(s: number): QualityTone {
  if (s >= 80) return 'good';
  if (s >= 65) return 'neutral';
  if (s >= 50) return 'warn';
  return 'bad';
}

function parseEpsCagrBaseFromParameters(md: string): number | null {
  const m = md.match(
    /\|\s*\*\*EPS CAGR \(5Y\)\*\*[\s\S]*?\|\s*[\d.]+\s*%\s*\|\s*\*\*([\d.]+)\s*%\*\*/i
  );
  if (m) return parseNum(m[1]);
  const m2 = md.match(
    /\|\s*\*\*EPS CAGR \(5Y\)\*\*[\s\S]*?\|\s*[\d.]+\s*%\s*\|\s*\*\*([\d.]+)\s*%\*\*\s*\|\s*[\d.]+\s*%\s*\|\s*[\d.]+\s*%\s*\|/i
  );
  if (m2) return parseNum(m2[1]);
  const row = md.match(/\|\s*\*\*EPS CAGR \(5Y\)\*\*[^\n]+\n/i);
  if (row) {
    const cells = row[0].split('|').map((c) => c.trim());
    for (const c of cells) {
      const n = parseNum(c);
      if (n != null && n > 0 && n < 80) return n;
    }
  }
  return null;
}

function parseOverridesFromPegMd(md: string): PegOverrides {
  const out: PegOverrides = {};
  const section = md.match(/## FY26 overrides[\s\S]*?(?=\n## |\n---\n|$)/i)?.[0] ?? md;
  for (const line of section.split('\n')) {
    if (!line.includes('|')) continue;
    const cells = line.split('|').map((c) => c.replace(/\*\*/g, '').trim()).filter(Boolean);
    if (cells.length < 2) continue;
    const key = cells[0].toLowerCase();
    const val = parseNum(cells[1]) ?? cells[1];
    if (key.includes('ttmpe') || key === 'pe') out.ttmPe = typeof val === 'number' ? val : parseNum(String(val));
    if (key.includes('epsgrowth')) out.epsGrowthPct = typeof val === 'number' ? val : parseNum(String(val));
    if (key.includes('revenuegrowth')) out.revenueGrowthPct = typeof val === 'number' ? val : parseNum(String(val));
    if (key.includes('patgrowth')) out.patGrowthPct = typeof val === 'number' ? val : parseNum(String(val));
    if (key.includes('roce')) out.rocePct = typeof val === 'number' ? val : parseNum(String(val));
    if (key.includes('debtequity') || key.includes('debt')) {
      out.debtEquity = typeof val === 'number' ? val : parseNum(String(val));
    }
    if (key.includes('netcash')) out.netCashCr = typeof val === 'number' ? val : parseNum(String(val));
    if (key.includes('fcfcr') || key === 'fcf') out.fcfCr = typeof val === 'number' ? val : parseNum(String(val));
    if (key.includes('fcfmargin')) out.fcfMarginPct = typeof val === 'number' ? val : parseNum(String(val));
    if (key.includes('dividend')) out.dividendYieldPct = typeof val === 'number' ? val : parseNum(String(val));
    if (key.includes('fcfindustrymode')) out.fcfIndustryMode = String(cells[1]);
    if (key.includes('businessquality')) out.businessQualityScore10 = typeof val === 'number' ? val : parseNum(String(val));
    if (key.includes('fcfsustainability')) out.fcfSustainabilityNote = cells[1];
  }
  return out;
}

async function readPegFile(
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
        files.find((f) => f.toUpperCase() === `PEG_${ticker.toUpperCase()}.md`) ??
        files.find((f) => f.startsWith('PEG_') && f.endsWith('.md'));
      if (hit) {
        const content = await fs.readFile(path.join(dir, hit), 'utf8');
        return { content, filename: hit };
      }
    } catch {
      /* next */
    }
  }
  const bundled = getBundledPegMd(ticker);
  if (bundled) return { content: bundled, filename: `PEG_${ticker.toUpperCase()}.md` };
  return null;
}

function inferFcfZone(
  fcfCr: number | null,
  fcfDisplay: string,
  mode: PegEvaluationResult['fcfIndustryMode']
): PegZone {
  if (mode === 'infra') {
    if (/negative|volatile|weak/i.test(fcfDisplay)) return '🟠';
    if (fcfCr != null && fcfCr < 0) return '🟠';
    return '🟡';
  }
  if (fcfCr != null) {
    if (fcfCr > 0) return '🟢';
    return '🔴';
  }
  if (/strong|rising|excellent|healthy/i.test(fcfDisplay)) return '🟢';
  if (/positive|uneven|monitor/i.test(fcfDisplay)) return '🟡';
  if (/weak|negative|volatile/i.test(fcfDisplay)) return '🔴';
  return '—';
}

function opportunityLabel(pe: PegZone, peg: PegZone, growth: PegZone): string {
  if (pe === '🟢' && peg !== '🔴' && growth !== '🔴') return 'Growth + value';
  if (pe === '🟢' && peg === '🟠') return 'Value + cash flow + dividend';
  if (pe === '🟠' && peg === '🟢') return 'Infrastructure / order-book growth';
  if (pe === '🔴' && peg === '🔴') return 'Excellent business — valuation demanding';
  if (pe === '🟢') return 'Value-oriented';
  return 'Balanced quality vs price';
}

export async function runPegEvaluation(
  input: RunPegEvaluationInput
): Promise<PegEvaluationResult | null> {
  const resolved = await resolveStock(input.ticker.trim());
  if (!resolved) return null;

  const loc = await getStockbookByTicker(resolved.ticker);
  const ticker = resolved.ticker;
  const sector = loc?.sector ?? resolved.sector;
  const stockName = loc?.stock ?? resolved.company;

  const [cmpMeta, paramFile, pegFile, detailFile, eq] = await Promise.all([
    fetchLiveNseCmp(ticker),
    readStockTabContent(sector, stockName, 'parameters', input.tenantId),
    readPegFile(sector, stockName, ticker, input.tenantId),
    readStockTabContent(sector, stockName, 'detail', input.tenantId),
    runEarningsQualityAnalysis({ ticker, tenantId: input.tenantId }).catch(() => null),
  ]);

  const cmp = cmpMeta?.price ?? null;
  const cmpSource = cmpMeta?.source ?? 'NSE';
  const parametersMd =
    paramFile?.content ?? getBundledParametersMd(ticker) ?? null;
  const parametersFromBundle = !paramFile?.content && parametersMd != null;
  const overrides = pegFile ? parseOverridesFromPegMd(pegFile.content) : {};
  const peParsed = parametersMd ? parseParametersMetrics(parametersMd) : null;
  const quality = parseFrameworkQualityMetrics(parametersMd, detailFile?.content ?? null);

  let ttmPe = overrides.ttmPe ?? peParsed?.ttmPe ?? null;
  if (ttmPe == null && cmpMeta?.trailingPe != null && cmpMeta.trailingPe > 0) {
    ttmPe = cmpMeta.trailingPe;
  }
  if (ttmPe == null && cmp != null && cmpMeta?.trailingEps != null && cmpMeta.trailingEps > 0) {
    ttmPe = Math.round((cmp / cmpMeta.trailingEps) * 10) / 10;
  }
  if (ttmPe == null && cmp != null && peParsed?.normalizedEps) {
    ttmPe = Math.round((cmp / peParsed.normalizedEps) * 10) / 10;
  }

  let epsGrowthPct =
    overrides.epsGrowthPct ??
    overrides.patGrowthPct ??
    parseEpsCagrBaseFromParameters(parametersMd ?? '') ??
    quality.baseEpsCagrPct ??
    null;

  if (epsGrowthPct == null && eq?.partA?.epsCagr5y != null) {
    epsGrowthPct = eq.partA.epsCagr5y;
  }

  const revenueGrowthPct =
    overrides.revenueGrowthPct ??
    eq?.partA?.revenueCagr5y ??
    null;
  const patGrowthPct = overrides.patGrowthPct ?? eq?.partA?.patCagr5y ?? epsGrowthPct;

  let rocePct = overrides.rocePct ?? quality.roePct ?? null;

  const debtDisplay = quality.debtDisplay;
  const netCash =
    overrides.netCashCr != null && overrides.netCashCr > 0
      ? true
      : /net cash|fortress|almost debt-free|debt-free/i.test(debtDisplay);
  const debtEquity = overrides.debtEquity ?? quality.debtRatio ?? null;

  const fcfIndustryMode: PegEvaluationResult['fcfIndustryMode'] =
    overrides.fcfIndustryMode?.toLowerCase().includes('infra') ||
    /infra|engineering|epc|construction/i.test(sector)
      ? 'infra'
      : /bank|nbfc|financial|insurance/i.test(sector)
        ? 'financial'
        : 'consumer';

  const fcfZone = inferFcfZone(
    overrides.fcfCr ?? null,
    quality.cashFlowDisplay,
    fcfIndustryMode
  );

  const pegRatio =
    ttmPe != null && epsGrowthPct != null && epsGrowthPct > 0
      ? Math.round((ttmPe / epsGrowthPct) * 100) / 100
      : null;

  const peZone = zonePe(ttmPe);
  const pegZone = zonePeg(pegRatio);
  const roceZone = zoneRoce(rocePct);
  const revZone = zoneGrowth(revenueGrowthPct);
  const patZone = zoneGrowth(patGrowthPct);
  const debtZone = zoneDebt(debtEquity, netCash);
  const divYield = overrides.dividendYieldPct;

  const scorecard: PegScorecardRow[] = [
    {
      id: 'pe',
      parameter: 'P/E',
      value: ttmPe != null ? `${ttmPe.toFixed(1)}×` : '—',
      zone: peZone,
      indicates: peZone === '🟢' ? 'Reasonable valuation' : peZone === '🔴' ? 'Very expensive' : 'Premium vs screen',
      evidence: overrides.ttmPe != null ? 'FACT' : parametersMd ? 'FACT' : 'UNVERIFIED',
    },
    {
      id: 'peg',
      parameter: 'PEG',
      value: pegRatio != null ? `${pegRatio.toFixed(2)}×` : '—',
      zone: pegZone,
      indicates:
        pegZone === '🟢'
          ? 'Growth justifies multiple'
          : pegZone === '🔴'
            ? 'Expensive vs growth'
            : 'Reasonably valued vs growth',
      evidence: epsGrowthPct != null ? 'OUR ASSUMPTION' : 'UNVERIFIED',
    },
    {
      id: 'roce',
      parameter: 'ROCE / ROE',
      value: rocePct != null ? `${rocePct.toFixed(1)}%` : quality.roeDisplay,
      zone: roceZone,
      indicates: roceZone === '🟢' ? 'Excellent capital efficiency' : 'Capital returns need watch',
      evidence: overrides.rocePct != null ? 'FACT' : 'UNVERIFIED',
    },
    {
      id: 'debt',
      parameter: 'Debt / equity',
      value: netCash ? 'Net cash' : debtEquity != null ? `${debtEquity.toFixed(2)}×` : debtDisplay,
      zone: debtZone,
      indicates: debtZone === '🟢' ? 'Strong balance sheet' : 'Leverage watch',
      evidence: 'FACT',
    },
    {
      id: 'fcf',
      parameter: 'FCF',
      value:
        overrides.fcfCr != null
          ? `₹${Math.round(overrides.fcfCr).toLocaleString('en-IN')} cr`
          : quality.cashFlowDisplay,
      zone: fcfZone,
      indicates:
        fcfIndustryMode === 'infra'
          ? 'Infra lens — WC/capex heavy; not consumer FCF standard'
          : fcfZone === '🟢'
            ? 'Strong cash generation'
            : 'Monitor cash conversion',
      evidence: overrides.fcfCr != null ? 'FACT' : 'UNVERIFIED',
    },
    {
      id: 'rev_growth',
      parameter: 'Revenue growth',
      value: revenueGrowthPct != null ? `${revenueGrowthPct.toFixed(1)}%` : '—',
      zone: revZone,
      indicates: revZone === '🟢' ? 'Strong top-line' : 'Moderate growth',
      evidence: overrides.revenueGrowthPct != null ? 'FACT' : 'UNVERIFIED',
    },
    {
      id: 'pat_growth',
      parameter: 'PAT / EPS growth',
      value: patGrowthPct != null ? `${patGrowthPct.toFixed(1)}%` : '—',
      zone: patZone,
      indicates: 'Used as PEG growth input',
      evidence: 'OUR ASSUMPTION',
    },
  ];

  if (divYield != null) {
    scorecard.push({
      id: 'dividend',
      parameter: 'Dividend yield @ CMP',
      value: `${divYield.toFixed(1)}%`,
      zone: divYield >= 3 ? '🟢' : divYield >= 1.5 ? '🟡' : '🟠',
      indicates: divYield >= 3 ? 'Income support' : 'Low yield on CMP',
      evidence: 'UNVERIFIED',
    });
  }

  const growthZone =
    revZone === '🟢' || patZone === '🟢'
      ? '🟢'
      : revZone === '🔴' && patZone === '🔴'
        ? '🔴'
        : '🟡';

  const pointsBreakdown: PegPointsBlock[] = [
    {
      id: 'pe_pts',
      label: 'P/E',
      maxPoints: 15,
      earnedPoints: zoneToPoints(peZone, 15),
      zone: peZone,
    },
    {
      id: 'peg_pts',
      label: 'PEG',
      maxPoints: 15,
      earnedPoints: zoneToPoints(pegZone, 15),
      zone: pegZone,
    },
    {
      id: 'roce_pts',
      label: 'ROCE',
      maxPoints: 15,
      earnedPoints: zoneToPoints(roceZone, 15),
      zone: roceZone,
    },
    {
      id: 'fcf_pts',
      label: 'FCF',
      maxPoints: 20,
      earnedPoints: zoneToPoints(fcfZone, 20),
      zone: fcfZone,
    },
    {
      id: 'debt_pts',
      label: 'Debt',
      maxPoints: 10,
      earnedPoints: zoneToPoints(debtZone, 10),
      zone: debtZone,
    },
    {
      id: 'growth_pts',
      label: 'Growth',
      maxPoints: 15,
      earnedPoints: zoneToPoints(growthZone, 15),
      zone: growthZone,
    },
    {
      id: 'div_pts',
      label: 'Dividend',
      maxPoints: 5,
      earnedPoints:
        divYield == null ? 3 : divYield >= 4 ? 5 : divYield >= 2 ? 4 : 2,
      zone: divYield != null && divYield >= 3 ? '🟢' : '🟡',
    },
    {
      id: 'bq_pts',
      label: 'Business quality',
      maxPoints: 5,
      earnedPoints: Math.min(
        5,
        Math.round((overrides.businessQualityScore10 ?? 7) / 2)
      ),
      zone: '🟢',
    },
  ];

  const totalScore100 = pointsBreakdown.reduce((s, p) => s + p.earnedPoints, 0);

  const growthForTable = epsGrowthPct ?? 18;
  const sensitivity: PegSensitivityRow[] = [10, 15, 18, 20, 25, 30].map((g) => ({
    epsGrowthPct: g,
    peAtPeg1: g * 1,
    peAtPeg15: Math.round(g * 1.5),
    peAtPeg2: g * 2,
    peAtPeg25: Math.round(g * 2.5),
  }));

  const maxPeAtTargetPeg =
    epsGrowthPct != null
      ? [1, 1.5, 2, 2.5].map((peg) => ({
          peg,
          maxPe: Math.round(epsGrowthPct * peg * 10) / 10,
        }))
      : [];

  const comboChecks: PegComboCheck[] = [
    {
      label: 'ROCE > 20%',
      passed: rocePct != null && rocePct > 20,
      detail: rocePct != null ? `${rocePct.toFixed(1)}%` : 'Add ROCE in PEG file',
    },
    {
      label: 'PEG < 2',
      passed: pegRatio != null && pegRatio < 2,
      detail: pegRatio != null ? `${pegRatio.toFixed(2)}×` : 'Need P/E and growth',
    },
    {
      label: 'P/E < 25',
      passed: ttmPe != null && ttmPe < 25,
      detail: ttmPe != null ? `${ttmPe.toFixed(1)}×` : '—',
    },
    {
      label: 'Net cash / low debt',
      passed: netCash || (debtEquity != null && debtEquity < 0.3),
      detail: netCash ? 'Net cash' : debtDisplay,
    },
    {
      label: 'Strong FCF (consumer lens)',
      passed: fcfZone === '🟢' && fcfIndustryMode !== 'infra',
      detail:
        fcfIndustryMode === 'infra'
          ? 'Skipped — infra industry mode'
          : fcfZone === '🟢'
            ? 'Pass'
            : 'Monitor',
    },
  ];

  const warnings: PegEvaluationResult['warnings'] = [];
  if (pegRatio != null && pegRatio > 2.5 && peZone !== '🟢') {
    warnings.push({
      id: 'peg_expensive',
      title: 'PEG > 2.5',
      detail: 'Great business may still be a poor entry — confirm with PCCL, not PEG alone.',
    });
  }
  if (overrides.fcfSustainabilityNote) {
    warnings.push({
      id: 'fcf_sustain',
      title: 'FCF sustainability',
      detail: overrides.fcfSustainabilityNote,
    });
  } else if (fcfIndustryMode === 'infra' && fcfZone !== '🟢') {
    warnings.push({
      id: 'fcf_infra',
      title: 'Infra FCF lens',
      detail: 'Negative/volatile FCF is common in EPC — use order book + ROCE, not ITC-style FCF rules.',
    });
  }
  if (rocePct != null && ttmPe != null && ttmPe > 40 && rocePct < 15) {
    warnings.push({
      id: 'pe_roce_mismatch',
      title: 'High P/E + moderate ROCE',
      detail: 'Premium multiple without exceptional capital returns — Tata Consumer pattern.',
    });
  }

  const overall10 = Math.round((totalScore100 / 10) * 10) / 10;
  const tone = toneFromScore100(totalScore100);
  const opp = opportunityLabel(peZone, pegZone, growthZone);

  let overallVerdict = `🟢 ${overall10}/10 — ${opp}`;
  if (tone === 'warn') overallVerdict = `🟡 ${overall10}/10 — ${opp}; valuation or FCF needs discipline`;
  if (tone === 'bad') overallVerdict = `🔴 ${overall10}/10 — expensive or weak combo; wait for better price`;

  const areaScores = {
    businessQuality: overrides.businessQualityScore10 ?? null,
    growth: patGrowthPct != null ? Math.min(10, patGrowthPct / 2) : null,
    roce: rocePct != null ? Math.min(10, rocePct / 3) : null,
    balanceSheet: debtZone === '🟢' ? 9 : debtZone === '🟡' ? 7 : 5,
    cashGeneration: fcfZone === '🟢' ? 9.5 : fcfZone === '🟡' ? 7 : 5,
    valuation: peZone === '🟢' ? 8 : peZone === '🟡' ? 6 : 4,
    peg: pegZone === '🟢' ? 8 : pegZone === '🟡' ? 7 : pegZone === '🟠' ? 5 : 3,
    overall10,
  };

  return {
    ticker,
    stockName,
    sector,
    cmp,
    cmpSource,
    analyzedAt: new Date().toISOString(),
    coreQuestion:
      'Is the market premium (P/E) justified by sustainable growth (PEG), with ROCE, debt, and FCF supporting the story?',
    dataSource: pegFile
      ? `PEG_${ticker}.md + PARAMETERS`
      : parametersMd
        ? parametersFromBundle
          ? 'Bundled PARAMETERS (build) + framework parse'
          : 'PARAMETERS + framework parse'
        : loc
          ? 'StockBook — add PARAMETERS or PEG file'
          : 'NSE resolve + live CMP (StockBook folder not on server)',
    pegFile: pegFile?.filename ?? null,
    parametersFile:
      paramFile?.filename ??
      (parametersFromBundle ? `PARAMETERS_${ticker}.md (bundled)` : null),
    stockbookUrl: stockbookPath(sector, stockName, 'parameters'),
    ttmPe,
    epsGrowthPct,
    pegRatio,
    pegZone,
    scorecard,
    areaScores,
    pointsBreakdown,
    totalScore100,
    sensitivity,
    comboChecks,
    maxPeAtTargetPeg,
    warnings,
    overallVerdict,
    overallTone: tone,
    opportunityType: opp,
    summaryLines: [
      ttmPe != null ? `P/E ${ttmPe.toFixed(1)}× (${peZone})` : 'P/E — add PARAMETERS',
      pegRatio != null
        ? `PEG ${pegRatio.toFixed(2)}× @ ${epsGrowthPct?.toFixed(1)}% growth (${pegZone})`
        : 'PEG — need growth input',
      `100-pt score: ${totalScore100}/100`,
      `${comboChecks.filter((c) => c.passed).length}/${comboChecks.length} combo checks passed`,
    ],
    fcfIndustryMode,
  };
}
