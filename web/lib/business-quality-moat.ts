/**
 * Business Quality & Moat — Stock Calculator Tab 4
 * StockBook/BUSINESS-QUALITY-MOAT-FRAMEWORK.md
 */

import fs from 'fs/promises';
import path from 'path';
import { readStockTabContent } from './content';
import { getRepoRoot } from './framework-paths';
import { getStockbookByTicker } from './stockbook-index';
import { resolveStock } from './stock-search';
import { fetchLiveNseCmp } from './nse-cmp';
import {
  extractParametersMasterCells,
  parseFrameworkQualityMetrics,
  type FrameworkQualityMetrics,
} from './stock-calculator-framework';
import { stockbookPath } from './navigation';
import {
  getBundledBusinessQualityMd,
  getBundledParametersMd,
  getBundledPegMd,
} from './load-bundled-stockbook';

export type EvidenceType = 'FACT' | 'MANAGEMENT CLAIM' | 'HYPOTHESIS' | 'OUR ASSUMPTION' | 'UNVERIFIED';
export type MoatSignal = '🟢' | '🟡' | '🔴' | '—';
export type QualityTone = 'good' | 'neutral' | 'warn' | 'bad';

export interface MoatFactor {
  id: string;
  label: string;
  assessment: string;
  signal: MoatSignal;
  evidence: EvidenceType;
  note?: string;
}

export interface MoatPillar {
  id: string;
  number: number;
  title: string;
  score10: number | null;
  signal: MoatSignal;
  headline: string;
  factors: MoatFactor[];
}

export interface MoatHighlight {
  factor: string;
  assessment: string;
  signal: MoatSignal;
}

export interface BusinessQualityResult {
  ticker: string;
  stockName: string;
  sector: string;
  cmp: number | null;
  cmpSource: string;
  analyzedAt: string;
  coreQuestion: string;
  dataSource: string;
  businessQualityFile: string | null;
  parametersFile: string | null;
  stockbookUrl: string;
  businessQualityScore10: number;
  verdict: string;
  ceilingNote: string | null;
  pillars: MoatPillar[];
  highlights: MoatHighlight[];
  overallTone: QualityTone;
  summaryLines: string[];
  notTenReasons: string[];
}

export interface RunBusinessQualityInput {
  ticker: string;
  tenantId: string;
}

const PILLAR_DEFS: { id: string; number: number; title: string; sectionRe: RegExp }[] = [
  { id: 'market_position', number: 1, title: 'Market position', sectionRe: /## 1\. Market position/i },
  { id: 'competitive_advantage', number: 2, title: 'Competitive advantage', sectionRe: /## 2\. Competitive advantage/i },
  { id: 'pricing_power', number: 3, title: 'Pricing power', sectionRe: /## 3\. Pricing power/i },
  { id: 'industry_runway', number: 4, title: 'Industry runway', sectionRe: /## 4\. Industry runway/i },
  { id: 'capital_efficiency', number: 5, title: 'Capital efficiency', sectionRe: /## 5\. Capital efficiency/i },
  { id: 'management_quality', number: 6, title: 'Management quality', sectionRe: /## 6\. Management quality/i },
  { id: 'reinvestment_runway', number: 7, title: 'Reinvestment runway', sectionRe: /## 7\. Reinvestment runway/i },
];

function parseSignal(raw: string | undefined): MoatSignal {
  const s = raw ?? '';
  if (s.includes('🟢') || /strong|dominant|very good|excellent/i.test(s)) return '🟢';
  if (s.includes('🔴') || /weak|poor|eroding|fail/i.test(s)) return '🔴';
  if (s.includes('🟡') || /moderate|monitor|borderline|mixed/i.test(s)) return '🟡';
  return '—';
}

function parseEvidence(cell: string | undefined): EvidenceType {
  const s = (cell ?? '').toUpperCase();
  if (s.includes('FACT')) return 'FACT';
  if (s.includes('MANAGEMENT')) return 'MANAGEMENT CLAIM';
  if (s.includes('HYPOTHESIS')) return 'HYPOTHESIS';
  if (s.includes('ASSUMPTION')) return 'OUR ASSUMPTION';
  return 'UNVERIFIED';
}

function signalToScore(signal: MoatSignal): number {
  if (signal === '🟢') return 9;
  if (signal === '🟡') return 6;
  if (signal === '🔴') return 3;
  return 5;
}

function scoreToSignal(score: number): MoatSignal {
  if (score >= 8) return '🟢';
  if (score >= 5) return '🟡';
  return '🔴';
}

function scoreToTone(score: number): QualityTone {
  if (score >= 8) return 'good';
  if (score >= 6) return 'neutral';
  if (score >= 4) return 'warn';
  return 'bad';
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 5;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

async function readBusinessQualityFile(
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
        files.find((f) => f.toUpperCase() === `BUSINESS_QUALITY_${ticker.toUpperCase()}.md`) ??
        files.find((f) => f.startsWith('BUSINESS_QUALITY_') && f.endsWith('.md'));
      if (hit) {
        return { content: await fs.readFile(path.join(dir, hit), 'utf8'), filename: hit };
      }
    } catch {
      /* next */
    }
  }
  const bundled = getBundledBusinessQualityMd(ticker);
  if (bundled) {
    return { content: bundled, filename: `BUSINESS_QUALITY_${ticker.toUpperCase()}.md` };
  }
  return null;
}

function ratingToSignal(rating: string): MoatSignal {
  if (/very strong|strong|excellent|dominant|#1/i.test(rating)) return '🟢';
  if (/weak|poor|fail/i.test(rating)) return '🔴';
  if (/moderate|monitor|mixed|catching/i.test(rating)) return '🟡';
  return '🟡';
}

function parseDetailMoatTable(detailMd: string | null): MoatFactor[] {
  if (!detailMd) return [];
  const section =
    detailMd.match(/## 2\.[^\n]*Business quality[\s\S]*?(?=\n## \d+\.|\n---\n|$)/i)?.[0] ??
    detailMd.match(/## 2\.[^\n]*moat[\s\S]*?(?=\n## \d+\.|\n---\n|$)/i)?.[0] ??
    '';
  const factors: MoatFactor[] = [];
  for (const line of section.split('\n')) {
    if (!line.trim().startsWith('|') || /Moat source|Rating|---/i.test(line)) continue;
    const cells = line
      .split('|')
      .map((c) => c.trim())
      .filter(Boolean);
    if (cells.length < 3) continue;
    const label = cells[0].replace(/\*\*/g, '').trim();
    const assessment = cells[1].replace(/\*\*/g, '').trim();
    const rating = cells[2].replace(/\*\*/g, '').trim();
    factors.push({
      id: `detail_${label.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
      label,
      assessment: assessment || rating,
      signal: ratingToSignal(rating),
      evidence: 'FACT',
    });
  }
  return factors;
}

function parsePegBusinessQualityScore10(ticker: string): number | null {
  const peg = getBundledPegMd(ticker);
  if (!peg) return null;
  const m = peg.match(/\|\s*\*\*businessQualityScore10\*\*\s*\|\s*(\d+(?:\.\d+)?)/i);
  return m ? parseFloat(m[1]) : null;
}

function pillarHeadlineFromFactors(factors: MoatFactor[], explicit?: string): string {
  if (explicit && !/^partial\s*—/i.test(explicit) && explicit !== '—') return explicit;
  const parts = factors.map((f) => f.assessment).filter((a) => a && a !== '—');
  if (parts.length > 0) return parts.join(' · ').slice(0, 160);
  return 'Derived from PARAMETERS / sector baseline (OUR ASSUMPTION) — deepen in BUSINESS_QUALITY file';
}

function pillarFromFactors(
  def: (typeof PILLAR_DEFS)[number],
  factors: MoatFactor[],
  headline?: string
): MoatPillar {
  const scores = factors.map((f) => signalToScore(f.signal));
  const score10 =
    scores.length > 0 ? Math.round(avg(scores) * 10) / 10 : null;
  const hl = pillarHeadlineFromFactors(factors, headline);
  return {
    id: def.id,
    number: def.number,
    title: def.title,
    score10,
    signal: score10 != null ? scoreToSignal(score10) : '—',
    headline: hl,
    factors,
  };
}

function clampScore(n: number): number {
  return Math.min(10, Math.max(3, Math.round(n * 10) / 10));
}

function tryMasterParam(
  params: string,
  labels: string[]
): { avg10y: string | null; today: string | null; read: string | null; label: string } | null {
  for (const label of labels) {
    const cells = extractParametersMasterCells(params, label);
    if (cells.today && !/unverified|pending|\*pending/i.test(cells.today)) {
      return { ...cells, label };
    }
  }
  return null;
}

interface PegMoatFields {
  businessQualityScore10: number | null;
  revenueGrowthPct: number | null;
  rocePct: number | null;
  debtEquity: number | null;
}

function parsePegMoatFields(ticker: string): PegMoatFields {
  const peg = getBundledPegMd(ticker);
  if (!peg) {
    return { businessQualityScore10: null, revenueGrowthPct: null, rocePct: null, debtEquity: null };
  }
  const num = (key: string) => {
    const m = peg.match(new RegExp(`\\|\\s*\\*\\*${key}\\*\\*\\s*\\|\\s*([\\d.]+)`, 'i'));
    return m ? parseFloat(m[1]) : null;
  };
  return {
    businessQualityScore10: parsePegBusinessQualityScore10(ticker),
    revenueGrowthPct: num('revenueGrowthPct'),
    rocePct: num('rocePct'),
    debtEquity: num('debtEquity'),
  };
}

/** Pillar score offset vs overall businessQualityScore10 when only PEG anchor exists. */
const PILLAR_SCORE_DELTA: Record<string, number> = {
  market_position: 0,
  competitive_advantage: 0,
  pricing_power: -1,
  industry_runway: -0.5,
  capital_efficiency: 0.5,
  management_quality: 0,
  reinvestment_runway: -0.5,
};

function sectorPillarBaselines(sector: string): Partial<Record<string, { score10: number; headline: string }>> {
  const s = sector.toLowerCase();
  if (/oil|gas|omc|energy/.test(s)) {
    return {
      market_position: { score10: 7, headline: 'Large E&P / O&G franchise — scale + reserves (OUR ASSUMPTION)' },
      competitive_advantage: { score10: 6, headline: 'Cost curve + PSU scale; weak pricing moat (OUR ASSUMPTION)' },
      pricing_power: { score10: 4, headline: 'Commodity / regulated pricing — taker not maker (OUR ASSUMPTION)' },
      industry_runway: { score10: 5, headline: 'Energy transition + cyclical capex — monitor (OUR ASSUMPTION)' },
      management_quality: { score10: 6, headline: 'PSU governance — search filings on refresh (OUR ASSUMPTION)' },
      reinvestment_runway: { score10: 5, headline: 'Capex-heavy E&P; returns tied to oil cycle (OUR ASSUMPTION)' },
    };
  }
  if (/bank|finance|nbfc|insurance|amc/.test(s)) {
    return {
      market_position: { score10: 7, headline: 'Deposit / AUM scale — sector rank from peer table (OUR ASSUMPTION)' },
      competitive_advantage: { score10: 7, headline: 'Branch / trust / regulation — verify vs peers (OUR ASSUMPTION)' },
      pricing_power: { score10: 6, headline: 'NIM / fee power — RBI cycle sensitive (OUR ASSUMPTION)' },
      industry_runway: { score10: 7, headline: 'Credit / financialisation tailwind India (OUR ASSUMPTION)' },
      management_quality: { score10: 6, headline: 'Governance search mandatory for banks (OUR ASSUMPTION)' },
      reinvestment_runway: { score10: 6, headline: 'Organic book growth reinvestment (OUR ASSUMPTION)' },
    };
  }
  if (/auto|mobility|2w|4w/.test(s)) {
    return {
      industry_runway: { score10: 7, headline: 'Under-penetration + replacement — EV transition risk (OUR ASSUMPTION)' },
      pricing_power: { score10: 6, headline: 'Competitive PV / 2W pricing — margin discipline (OUR ASSUMPTION)' },
    };
  }
  if (/pharma|healthcare|hospital/.test(s)) {
    return {
      industry_runway: { score10: 8, headline: 'Healthcare demand + export / bed growth (OUR ASSUMPTION)' },
      competitive_advantage: { score10: 7, headline: 'R&D / compliance / brand — fill from detail §2 (OUR ASSUMPTION)' },
    };
  }
  if (/it |technology|software/.test(s)) {
    return {
      competitive_advantage: { score10: 6, headline: 'Talent scale; AI structural threat — §19 (OUR ASSUMPTION)' },
      industry_runway: { score10: 6, headline: 'Digital spend vs AI disruption — dynamic (OUR ASSUMPTION)' },
    };
  }
  return {};
}

function mergePillars(primary: MoatPillar[], derived: MoatPillar[]): MoatPillar[] {
  return PILLAR_DEFS.map((def) => {
    const p = primary.find((x) => x.id === def.id)!;
    const d = derived.find((x) => x.id === def.id)!;
    const pWeak =
      p.score10 == null ||
      /^partial\s*—/i.test(p.headline) ||
      p.headline.includes('add BUSINESS_QUALITY');
    if (!pWeak && p.score10 != null) {
      return {
        ...p,
        factors: p.factors.length > 0 ? p.factors : d.factors,
      };
    }
    if (d.score10 != null || d.factors.length > 0) {
      return {
        ...d,
        score10: d.score10 ?? p.score10,
        signal: d.score10 != null ? scoreToSignal(d.score10) : p.signal,
        headline: d.headline !== p.headline && !/^partial/i.test(d.headline) ? d.headline : p.headline,
        factors: d.factors.length > 0 ? d.factors : p.factors,
      };
    }
    return p;
  });
}

function ensureEveryPillarScored(
  pillars: MoatPillar[],
  anchorScore: number | null,
  sector: string
): MoatPillar[] {
  const baselines = sectorPillarBaselines(sector);
  return pillars.map((p) => {
    if (p.score10 != null) {
      return {
        ...p,
        signal: p.signal === '—' ? scoreToSignal(p.score10) : p.signal,
      };
    }
    const fromFactors = p.factors.map((f) => signalToScore(f.signal));
    if (fromFactors.length > 0) {
      const score10 = clampScore(avg(fromFactors));
      return {
        ...p,
        score10,
        signal: scoreToSignal(score10),
        headline: pillarHeadlineFromFactors(p.factors, p.headline),
      };
    }
    const base = baselines[p.id];
    let score10 = base?.score10 ?? 5.5;
    if (anchorScore != null) {
      score10 = clampScore(anchorScore + (PILLAR_SCORE_DELTA[p.id] ?? 0));
    }
    const headline =
      base?.headline ??
      `Framework proxy ${score10}/10 vs anchor ${anchorScore ?? '—'} — add BUSINESS_QUALITY file for pillar detail`;
    return {
      ...p,
      score10,
      signal: scoreToSignal(score10),
      headline,
      factors:
        p.factors.length > 0
          ? p.factors
          : [
              {
                id: `${p.id}_baseline`,
                label: 'PARAMETERS / sector baseline',
                assessment: headline,
                signal: scoreToSignal(score10),
                evidence: 'OUR ASSUMPTION' as EvidenceType,
              },
            ],
    };
  });
}

function extractSection(md: string, re: RegExp): string {
  const idx = md.search(re);
  if (idx < 0) return '';
  const rest = md.slice(idx);
  const next = rest.slice(1).search(/\n## /);
  return next >= 0 ? rest.slice(0, next + 1) : rest;
}

function parseFactorTable(sectionMd: string, pillarId: string): MoatFactor[] {
  const factors: MoatFactor[] = [];
  for (const line of sectionMd.split('\n')) {
    if (!line.trim().startsWith('|') || /Factor|Metric|---/i.test(line)) continue;
    const cells = line
      .split('|')
      .map((c) => c.trim())
      .filter(Boolean);
    if (cells.length < 3) continue;
    const label = cells[0].replace(/\*\*/g, '').trim();
    if (/^factor$|^pillar$/i.test(label)) continue;

    factors.push({
      id: `${pillarId}_${label.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
      label,
      assessment: cells[1].replace(/\*\*/g, '').trim(),
      signal: parseSignal(cells[2]),
      evidence: parseEvidence(cells[cells.length - 1]),
      note: cells.length > 4 ? cells[3] : undefined,
    });
  }
  return factors;
}

function parseScorecardSummary(md: string): Map<number, { score10: number; signal: MoatSignal; headline: string }> {
  const map = new Map<number, { score10: number; signal: MoatSignal; headline: string }>();
  const section = extractSection(md, /## Scorecard summary/i);
  for (const line of section.split('\n')) {
    if (!line.trim().startsWith('|') || /Pillar|---/i.test(line)) continue;
    const cells = line
      .split('|')
      .map((c) => c.trim())
      .filter(Boolean);
    if (cells.length < 3) continue;
    const numMatch = cells[0].match(/^(\d)/);
    if (!numMatch) continue;
    const num = parseInt(numMatch[1], 10);
    const scoreMatch = cells[1].match(/([\d.]+)/);
    map.set(num, {
      score10: scoreMatch ? parseFloat(scoreMatch[1]) : signalToScore(parseSignal(cells[2])),
      signal: parseSignal(cells[2]),
      headline: cells[3]?.replace(/\*\*/g, '').trim() ?? '',
    });
  }
  return map;
}

function parseHighlights(md: string): MoatHighlight[] {
  const section = extractSection(md, /## Factor highlights/i);
  const out: MoatHighlight[] = [];
  for (const line of section.split('\n')) {
    if (!line.trim().startsWith('|') || /Factor|---/i.test(line)) continue;
    const cells = line
      .split('|')
      .map((c) => c.trim())
      .filter(Boolean);
    if (cells.length < 3) continue;
    out.push({
      factor: cells[0],
      assessment: cells[1],
      signal: parseSignal(cells[2]),
    });
  }
  return out;
}

function parseOverallScore(md: string): number | null {
  const m =
    md.match(/\*\*Business Quality Score\*\*\s*\|\s*\*\*(\d+(?:\.\d+)?)\s*\/\s*10\*\*/i) ??
    md.match(/Business Quality Score[:\s]*\*\*(\d+(?:\.\d+)?)\s*\/\s*10\*\*/i) ??
    md.match(/Business Quality[:\s]*(\d+(?:\.\d+)?)\s*\/\s*10/i);
  return m ? parseFloat(m[1]) : null;
}

function parseCeilingNote(md: string): string | null {
  const m = md.match(/\*\*Ceiling note\*\*\s*\|\s*([^|\n]+)/i);
  return m ? m[1].trim() : null;
}

function parseVerdict(md: string): string | null {
  const m = md.match(/\*\*Verdict\*\*\s*\|\s*([^|\n]+)/i);
  return m ? m[1].trim() : null;
}

function buildPillarsFromFile(md: string): MoatPillar[] {
  const summary = parseScorecardSummary(md);
  return PILLAR_DEFS.map((def) => {
    const section = extractSection(md, def.sectionRe);
    const factors = parseFactorTable(section, def.id);
    const sumRow = summary.get(def.number);
    const factorScores = factors.map((f) => signalToScore(f.signal)).filter((s) => s > 0);
    const score10 =
      sumRow?.score10 ??
      (factorScores.length > 0 ? Math.round(avg(factorScores) * 10) / 10 : null);
    const signal = sumRow?.signal ?? (score10 != null ? scoreToSignal(score10) : '—');

    return {
      id: def.id,
      number: def.number,
      title: def.title,
      score10,
      signal,
      headline: sumRow?.headline ?? (factors[0]?.assessment ?? '—'),
      factors,
    };
  });
}

function enrichFromParameters(pillars: MoatPillar[], parametersMd: string | null, quality: ReturnType<typeof parseFrameworkQualityMetrics>): void {
  if (!parametersMd) return;

  const marketShare = parametersMd.match(/\|\s*\*\*Market share[^|]*\*\*[\s\S]*?\|\s*[^|]+\|\s*[^|]+\|\s*\*\*([^|*]+)\*\*/i);
  if (marketShare) {
    const p = pillars.find((x) => x.id === 'market_position');
    const f = p?.factors.find((x) => /market share/i.test(x.label));
    if (f && f.assessment === '—') {
      f.assessment = marketShare[1].trim();
      f.signal = '🟢';
      f.evidence = 'FACT';
    }
  }

  if (quality.roePct != null) {
    const p = pillars.find((x) => x.id === 'capital_efficiency');
    const roe = p?.factors.find((x) => /roe/i.test(x.label));
    if (roe && roe.assessment === '—') {
      roe.assessment = quality.roeDisplay;
      roe.signal = quality.roePct >= 15 ? '🟢' : quality.roePct >= 12 ? '🟡' : '🔴';
      roe.evidence = 'FACT';
    }
  }
}

function buildParameterDerivedPillars(
  parametersMd: string | null,
  detailMd: string | null,
  quality: FrameworkQualityMetrics,
  ticker: string,
  sector: string
): MoatPillar[] {
  const moatRows = parseDetailMoatTable(detailMd);
  const params = parametersMd ?? '';
  const peg = parsePegMoatFields(ticker);

  const volRow = tryMasterParam(params, [
    'Volume growth (2W)',
    'Volume growth',
    'Revenue growth',
    'Market share',
  ]);
  const volToday = volRow?.today ?? volRow?.avg10y ?? null;
  const ebitdaRow = tryMasterParam(params, ['EBITDA margin', 'Operating margin', 'Net margin']);
  const roeRow = tryMasterParam(params, ['ROE', 'ROE (cycle)', 'ROCE']);

  const marketFactors: MoatFactor[] = [];
  if (volRow) {
    marketFactors.push({
      id: 'param_market_pulse',
      label: volRow.label,
      assessment: `${volRow.today}${volRow.read ? ` — ${volRow.read}` : ''}`,
      signal: /2\d%|1[5-9]%|strong|above|leader|#1/i.test(`${volRow.today} ${volRow.read ?? ''}`)
        ? '🟢'
        : '🟡',
      evidence: 'FACT',
    });
  }
  if (peg.revenueGrowthPct != null) {
    marketFactors.push({
      id: 'peg_rev_growth',
      label: 'Revenue growth (PEG)',
      assessment: `${peg.revenueGrowthPct}% YoY proxy`,
      signal: peg.revenueGrowthPct >= 12 ? '🟢' : peg.revenueGrowthPct >= 6 ? '🟡' : '🔴',
      evidence: 'FACT',
    });
  }
  const leader = moatRows.find((f) => /#1|volume|leader|share/i.test(f.label));
  if (leader) marketFactors.push(leader);

  const moatFactors = moatRows.filter(
    (f) => !/#1|volume|leader|share/i.test(f.label) && !/EV|VIDA|Premium|Harley/i.test(f.label)
  );

  const pricingFactors: MoatFactor[] = [];
  if (ebitdaRow?.today || quality.ebitdaDisplay !== '—') {
    const today = ebitdaRow?.today ?? quality.ebitdaDisplay;
    const read = ebitdaRow?.read ?? quality.ebitdaRead ?? '';
    pricingFactors.push({
      id: 'param_ebitda',
      label: 'EBITDA margin vs 10Y',
      assessment: `${today} vs avg ${ebitdaRow?.avg10y ?? '—'}${read ? ` — ${read}` : ''}`.trim(),
      signal:
        quality.ebitdaMarginPct != null && quality.ebitdaMarginPct >= 15
          ? '🟢'
          : /weak|compress|watch/i.test(read)
            ? '🟡'
            : quality.ebitdaMarginPct != null
              ? '🟡'
              : '🟡',
      evidence: 'FACT',
    });
  }

  const runwayFactors: MoatFactor[] = [];
  const evRow = moatRows.find((f) => /EV|VIDA/i.test(f.label));
  if (evRow) runwayFactors.push(evRow);
  if (volToday) {
    runwayFactors.push({
      id: 'industry_volume',
      label: 'Industry / company volume pulse',
      assessment: volToday,
      signal: '🟢',
      evidence: 'FACT',
    });
  }
  if (quality.baseEpsCagrPct != null) {
    runwayFactors.push({
      id: 'param_eps_cagr',
      label: 'Forward EPS CAGR (base)',
      assessment: `${quality.baseEpsCagrPct}% — PARAMETERS Part 2`,
      signal: quality.baseEpsCagrPct >= 10 ? '🟢' : quality.baseEpsCagrPct >= 5 ? '🟡' : '🔴',
      evidence: 'OUR ASSUMPTION',
    });
  } else if (quality.impliedPriceCagrPct != null) {
    runwayFactors.push({
      id: 'param_implied_cagr_runway',
      label: 'Implied 5Y price CAGR (base)',
      assessment: `${quality.impliedPriceCagrPct}% — PARAMETERS Part 2`,
      signal: quality.impliedPriceCagrPct >= 12 ? '🟢' : '🟡',
      evidence: 'OUR ASSUMPTION',
    });
  }

  const capitalFactors: MoatFactor[] = [];
  if (quality.roePct != null) {
    capitalFactors.push({
      id: 'param_roe',
      label: 'ROE',
      assessment: quality.roeDisplay,
      signal: quality.roePct >= 15 ? '🟢' : quality.roePct >= 12 ? '🟡' : '🔴',
      evidence: 'FACT',
    });
  } else if (roeRow?.today) {
    capitalFactors.push({
      id: 'param_roe_row',
      label: roeRow.label,
      assessment: `${roeRow.today}${roeRow.read ? ` — ${roeRow.read}` : ''}`,
      signal: /strong|pass|2\d%|1[5-9]/i.test(`${roeRow.today} ${roeRow.read ?? ''}`) ? '🟢' : '🟡',
      evidence: 'FACT',
    });
  }
  if (peg.rocePct != null) {
    capitalFactors.push({
      id: 'peg_roce',
      label: 'ROCE (PEG)',
      assessment: `${peg.rocePct}%`,
      signal: peg.rocePct >= 18 ? '🟢' : peg.rocePct >= 12 ? '🟡' : '🔴',
      evidence: 'FACT',
    });
  }
  if (quality.cashFlowDisplay && quality.cashFlowDisplay !== '—') {
    capitalFactors.push({
      id: 'param_balance_sheet',
      label: 'Balance sheet / cash',
      assessment: quality.cashFlowDisplay,
      signal: /net cash|fortress|positive/i.test(quality.cashFlowDisplay)
        ? '🟢'
        : /debt|lever/i.test(quality.cashFlowDisplay)
          ? '🔴'
          : '🟡',
      evidence: 'FACT',
    });
  } else if (peg.debtEquity != null) {
    capitalFactors.push({
      id: 'peg_de',
      label: 'Debt / equity (PEG)',
      assessment: `${peg.debtEquity}×`,
      signal: peg.debtEquity <= 0.3 ? '🟢' : peg.debtEquity <= 1 ? '🟡' : '🔴',
      evidence: 'FACT',
    });
  }

  const mgmtSection =
    detailMd?.match(/## 5\.[^\n]*Management[\s\S]*?(?=\n## \d+\.|\n---\n|$)/i)?.[0] ??
    detailMd?.match(/## 5\.[^\n]*Governance[\s\S]*?(?=\n## \d+\.|\n---\n|$)/i)?.[0] ??
    '';
  const mgmtText = mgmtSection.replace(/^#+\s[^\n]+\n?/m, '').trim().slice(0, 220);
  const franchiseNote =
    detailMd?.match(/## 1\.[^\n]*Business snapshot[\s\S]*?\|[^\n]*Franchise[^\n]+\|[^\n]+\|([^|\n]+)/i)?.[1]?.trim() ??
    '';
  const managementFactors: MoatFactor[] = [];
  if (mgmtText) {
    managementFactors.push({
      id: 'detail_management',
      label: 'Management & governance',
      assessment: mgmtText,
      signal: /no fraud|moderate\+|strong|clean/i.test(mgmtText) ? '🟢' : '🟡',
      evidence: 'FACT',
    });
  } else if (franchiseNote && !/assess moat|refresh|search/i.test(franchiseNote)) {
    managementFactors.push({
      id: 'detail_franchise',
      label: 'Franchise note',
      assessment: franchiseNote,
      signal: '🟡',
      evidence: 'FACT',
    });
  }

  const reinvestFactors: MoatFactor[] = moatRows
    .filter((f) => /EV|VIDA|Premium|Harley/i.test(f.label))
    .map((f) => ({ ...f, id: `reinv_${f.id}` }));

  const impliedCagr = params.match(/\*\*Implied 5Y price CAGR\*\*[^\n]+\|[^\n]+\|[^\n]+\|[^\n]+\|\s*\*\*\+?([\d.]+)\s*%\*\*/i)?.[1];
  if (impliedCagr) {
    reinvestFactors.push({
      id: 'param_implied_cagr',
      label: 'Forward 5Y implied CAGR (base)',
      assessment: `+${impliedCagr}% — PARAMETERS Part 2`,
      signal: parseFloat(impliedCagr) >= 12 ? '🟢' : '🟡',
      evidence: 'OUR ASSUMPTION',
    });
  }

  const pegScore = peg.businessQualityScore10;
  const byId: Record<string, MoatFactor[]> = {
    market_position: marketFactors,
    competitive_advantage: moatFactors.length ? moatFactors : moatRows.length ? moatRows.slice(0, 3) : marketFactors.slice(0, 2),
    pricing_power: pricingFactors,
    industry_runway: runwayFactors,
    capital_efficiency: capitalFactors,
    management_quality: managementFactors,
    reinvestment_runway: reinvestFactors,
  };

  const baselines = sectorPillarBaselines(sector);
  return PILLAR_DEFS.map((def) => {
    const factors = byId[def.id] ?? [];
    if (factors.length === 0 && pegScore != null) {
      const proxy = clampScore(pegScore + (PILLAR_SCORE_DELTA[def.id] ?? 0));
      return {
        id: def.id,
        number: def.number,
        title: def.title,
        score10: proxy,
        signal: scoreToSignal(proxy),
        headline: `PEG anchor ${pegScore}/10 → pillar ${proxy}/10 — add BUSINESS_QUALITY file for factor rows`,
        factors: [
          {
            id: `${def.id}_peg_proxy`,
            label: 'PEG businessQualityScore10',
            assessment: `Pillar proxy from bundled PEG (${pegScore}/10 overall)`,
            signal: scoreToSignal(proxy),
            evidence: 'OUR ASSUMPTION',
          },
        ],
      };
    }
    if (factors.length === 0 && baselines[def.id]) {
      const b = baselines[def.id]!;
      return {
        id: def.id,
        number: def.number,
        title: def.title,
        score10: b.score10,
        signal: scoreToSignal(b.score10),
        headline: b.headline,
        factors: [
          {
            id: `${def.id}_sector_baseline`,
            label: 'Sector baseline',
            assessment: b.headline,
            signal: scoreToSignal(b.score10),
            evidence: 'OUR ASSUMPTION',
          },
        ],
      };
    }
    return pillarFromFactors(def, factors);
  });
}

function computeScore(pillars: MoatPillar[], fileScore: number | null): number {
  if (fileScore != null) return Math.round(fileScore * 10) / 10;
  const scores = pillars.map((p) => p.score10).filter((s): s is number => s != null);
  if (scores.length === 0) return 5;
  return Math.round(avg(scores) * 10) / 10;
}

function buildNotTenReasons(pillars: MoatPillar[], ceilingNote: string | null): string[] {
  const reasons: string[] = [];
  if (ceilingNote) reasons.push(ceilingNote);

  for (const p of pillars) {
    if (p.signal === '🟡' || p.signal === '🔴') {
      const weak = p.factors.filter((f) => f.signal === '🟡' || f.signal === '🔴');
      for (const f of weak.slice(0, 2)) {
        reasons.push(`${f.label}: ${f.assessment}`);
      }
    }
  }
  return [...new Set(reasons)].slice(0, 5);
}

function buildVerdict(score: number, fileVerdict: string | null): string {
  if (fileVerdict) return fileVerdict;
  if (score >= 8) return 'Great business — franchise quality supports premium valuation discipline';
  if (score >= 6) return 'Good business — moat present but not unassailable';
  if (score >= 4) return 'Average — cheap price may reflect weak franchise';
  return 'Weak business quality — price alone is insufficient';
}

export async function runBusinessQualityAnalysis(
  input: RunBusinessQualityInput
): Promise<BusinessQualityResult | null> {
  const resolved = await resolveStock(input.ticker.trim());
  if (!resolved) return null;

  const loc = await getStockbookByTicker(resolved.ticker);
  const sector = loc?.sector ?? resolved.sector;
  const stockName = loc?.stock ?? resolved.company;

  const bqFile = await readBusinessQualityFile(sector, stockName, resolved.ticker, input.tenantId);
  const parameters = await readStockTabContent(sector, stockName, 'parameters', input.tenantId);
  const detail = await readStockTabContent(sector, stockName, 'detail', input.tenantId);

  const bqMd = bqFile?.content ?? '';
  const parametersMd = parameters?.content ?? getBundledParametersMd(resolved.ticker);
  const detailMd = detail?.content ?? null;
  const quality = parseFrameworkQualityMetrics(parametersMd, detailMd);

  const derived = buildParameterDerivedPillars(
    parametersMd,
    detailMd,
    quality,
    resolved.ticker,
    sector
  );
  let pillars = bqMd ? mergePillars(buildPillarsFromFile(bqMd), derived) : derived;
  enrichFromParameters(pillars, parametersMd, quality);

  const fileScore = bqMd ? parseOverallScore(bqMd) : null;
  const pegScore = parsePegBusinessQualityScore10(resolved.ticker);
  const anchorScore = fileScore ?? pegScore ?? computeScore(derived, null);
  pillars = ensureEveryPillarScored(pillars, anchorScore, sector);

  const businessQualityScore10 =
    fileScore != null ? Math.round(fileScore * 10) / 10 : computeScore(pillars, null);
  const ceilingNote = bqMd ? parseCeilingNote(bqMd) : null;
  const fileVerdict = bqMd ? parseVerdict(bqMd) : null;
  const highlights = bqMd
    ? parseHighlights(bqMd)
    : parseDetailMoatTable(detailMd).slice(0, 6).map((f) => ({
        factor: f.label,
        assessment: f.assessment,
        signal: f.signal,
      }));
  const notTenReasons = buildNotTenReasons(pillars, ceilingNote);

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

  const summaryLines: string[] = [
    `Business Quality ${businessQualityScore10}/10`,
    businessQualityScore10 < 10 && notTenReasons.length > 0
      ? `Not 10/10: ${notTenReasons[0]}`
      : businessQualityScore10 >= 9
        ? 'Near-top tier franchise'
        : 'Moat score reflects industry and transition risks',
  ];

  return {
    ticker: resolved.ticker,
    stockName,
    sector,
    cmp,
    cmpSource,
    analyzedAt: new Date().toISOString(),
    coreQuestion: 'Is this a great business or merely a cheap stock?',
    dataSource: bqFile
      ? bqFile.filename
      : parameters?.filename
        ? `${parameters.filename} (partial — add BUSINESS_QUALITY_${resolved.ticker}.md)`
        : 'No business quality file',
    businessQualityFile: bqFile?.filename ?? null,
    parametersFile: parameters?.filename ?? null,
    stockbookUrl: stockbookPath(sector, stockName, 'summary'),
    businessQualityScore10,
    verdict: buildVerdict(businessQualityScore10, fileVerdict),
    ceilingNote,
    pillars,
    highlights,
    overallTone: scoreToTone(businessQualityScore10),
    summaryLines,
    notTenReasons,
  };
}
