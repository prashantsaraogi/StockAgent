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
import { parseFrameworkQualityMetrics } from './stock-calculator-framework';
import { stockbookPath } from './navigation';

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
  return null;
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

function buildFallbackPillars(parametersMd: string | null, summaryMd: string | null): MoatPillar[] {
  return PILLAR_DEFS.map((def) => ({
    id: def.id,
    number: def.number,
    title: def.title,
    score10: null,
    signal: '—' as MoatSignal,
    headline: 'Add BUSINESS_QUALITY file for full scorecard',
    factors: [],
  }));
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
  const summary = await readStockTabContent(sector, stockName, 'summary', input.tenantId);

  const bqMd = bqFile?.content ?? '';
  const parametersMd = parameters?.content ?? null;
  const quality = parseFrameworkQualityMetrics(parametersMd, detail?.content ?? null);

  let pillars = bqMd ? buildPillarsFromFile(bqMd) : buildFallbackPillars(parametersMd, summary?.content ?? null);
  enrichFromParameters(pillars, parametersMd, quality);

  // Recompute pillar scores from factors if missing
  pillars = pillars.map((p) => {
    if (p.score10 != null) return p;
    const scores = p.factors.map((f) => signalToScore(f.signal));
    if (scores.length === 0) return p;
    const score10 = Math.round(avg(scores) * 10) / 10;
    return { ...p, score10, signal: scoreToSignal(score10) };
  });

  const fileScore = bqMd ? parseOverallScore(bqMd) : null;
  const businessQualityScore10 = computeScore(pillars, fileScore);
  const ceilingNote = bqMd ? parseCeilingNote(bqMd) : null;
  const fileVerdict = bqMd ? parseVerdict(bqMd) : null;
  const highlights = bqMd ? parseHighlights(bqMd) : [];
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
