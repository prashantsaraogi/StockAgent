/**
 * Risk & Decision — Stock Calculator Tab 5 (Final Decision Engine)
 * StockBook/RISK-DECISION-FRAMEWORK.md
 */

import fs from 'fs/promises';
import path from 'path';
import { readStockTabContent } from './content';
import { getRepoRoot } from './framework-paths';
import { getStockbookByTicker } from './stockbook-index';
import { resolveStock } from './stock-search';
import { fetchLiveNseCmp } from './nse-cmp';
import { loadPeEvaluation } from './pe-evaluation';
import { runEarningsQualityAnalysis } from './earnings-quality';
import { runBusinessQualityAnalysis } from './business-quality-moat';
import {
  parseFrameworkQualityMetrics,
  parseRiskFactor,
} from './stock-calculator-framework';
import { parseForwardGrowthTab } from './stock-calculator-tabs';
import { stockbookPath } from './navigation';

export type RiskSignal = '🟢' | '🟡' | '🔴' | '—';
export type VerdictTone = 'strong-buy' | 'selective-add' | 'wait' | 'reduce' | 'avoid';

export interface RiskFactorRow {
  id: string;
  bucket: string;
  factor: string;
  assessment: string;
  level: string;
  signal: RiskSignal;
}

export interface CatalystRow {
  catalyst: string;
  direction: string;
  probability: string;
  evidence: string;
}

export interface ThesisBreaker {
  text: string;
  severity: 'critical' | 'warn';
}

export interface ComponentScore {
  id: string;
  label: string;
  weightPct: number;
  score10: number;
  weightedContribution: number;
  source: string;
}

export interface InvestmentThesis {
  status: string;
  score100: number;
  valuationLabel: string;
  businessLabel: string;
  earningsLabel: string;
  riskLabel: string;
  whyOwn: string;
  whyNotAggressive: string;
  changeMind: string;
  nextReview: string;
}

export interface RiskDecisionResult {
  ticker: string;
  stockName: string;
  sector: string;
  cmp: number | null;
  cmpSource: string;
  analyzedAt: string;
  dataSource: string;
  riskDecisionFile: string | null;
  stockbookUrl: string;
  thesis: InvestmentThesis;
  riskFactors: RiskFactorRow[];
  riskBuckets: { bucket: string; signal: RiskSignal; factorCount: number }[];
  catalysts: CatalystRow[];
  thesisBreakers: ThesisBreaker[];
  components: ComponentScore[];
  quantitativeScore100: number;
  investmentVerdict: string;
  verdictTone: VerdictTone;
  verdictEmoji: string;
  positives: string[];
  concerns: string[];
  nextQuarterWatch: string[];
  narrativeSummary: string;
  notScreamingBuy: boolean;
}

export interface RunRiskDecisionInput {
  ticker: string;
  tenantId: string;
}

const WEIGHTS = {
  valuation: 25,
  earningsQuality: 25,
  businessQuality: 25,
  growth: 15,
  risk: 10,
} as const;

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function parseSignal(raw: string): RiskSignal {
  if (raw.includes('🟢')) return '🟢';
  if (raw.includes('🔴')) return '🔴';
  if (raw.includes('🟡')) return '🟡';
  if (/strong|low|safe|good|dominant/i.test(raw)) return '🟢';
  if (/high|critical|weak|fail/i.test(raw)) return '🔴';
  if (/moderate|medium|monitor|fair|stretch/i.test(raw)) return '🟡';
  return '—';
}

async function readRiskDecisionFile(
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
        files.find((f) => f.toUpperCase() === `RISK_DECISION_${ticker.toUpperCase()}.md`) ??
        files.find((f) => f.startsWith('RISK_DECISION_') && f.endsWith('.md'));
      if (hit) {
        return { content: await fs.readFile(path.join(dir, hit), 'utf8'), filename: hit };
      }
    } catch {
      /* next */
    }
  }
  return null;
}

function extractSection(md: string, headingRe: RegExp): string {
  const idx = md.search(headingRe);
  if (idx < 0) return '';
  const rest = md.slice(idx);
  const next = rest.slice(1).search(/\n## /);
  return next >= 0 ? rest.slice(0, next + 1) : rest;
}

function parseRiskBucketTables(md: string): RiskFactorRow[] {
  const section = extractSection(md, /## A\. Risk/i);
  const buckets = [
    'Business risk',
    'Financial risk',
    'Valuation risk',
    'Governance risk',
    'External risk',
  ];
  const rows: RiskFactorRow[] = [];

  for (const bucket of buckets) {
    const bucketSection = extractSection(section, new RegExp(`### ${bucket.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i'));
    for (const line of bucketSection.split('\n')) {
      if (!line.trim().startsWith('|') || /Factor|---/i.test(line)) continue;
      const cells = line.split('|').map((c) => c.trim()).filter(Boolean);
      if (cells.length < 3) continue;
      rows.push({
        id: `${bucket}_${cells[0]}`.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        bucket,
        factor: cells[0],
        assessment: cells[1],
        level: cells[2] ?? '—',
        signal: parseSignal(cells[3] ?? cells[2] ?? ''),
      });
    }
  }
  return rows;
}

function parseCatalysts(md: string): CatalystRow[] {
  const section = extractSection(md, /## B\. Catalysts/i);
  const rows: CatalystRow[] = [];
  for (const line of section.split('\n')) {
    if (!line.trim().startsWith('|') || /Catalyst|---/i.test(line)) continue;
    const cells = line.split('|').map((c) => c.trim()).filter(Boolean);
    if (cells.length < 3) continue;
    rows.push({
      catalyst: cells[0],
      direction: cells[1],
      probability: cells[2],
      evidence: cells[3] ?? '—',
    });
  }
  return rows;
}

function parseThesisBreakers(md: string): ThesisBreaker[] {
  const section = extractSection(md, /## C\. Thesis breakers/i);
  const rows: ThesisBreaker[] = [];
  for (const line of section.split('\n')) {
    if (!line.trim().startsWith('|') || /Breaker|---/i.test(line)) continue;
    const cells = line.split('|').map((c) => c.trim()).filter(Boolean);
    if (cells.length < 1) continue;
    const text = cells[0];
    if (/^breaker$/i.test(text)) continue;
    rows.push({
      text: cells.length > 1 && cells[0].length < 4 ? cells[1] : text,
      severity: (cells[1] ?? cells[0]).includes('🔴') ? 'critical' : 'warn',
    });
  }
  // Also parse list-style breakers
  for (const line of section.split('\n')) {
    if (line.includes('🔴') && !line.trim().startsWith('|')) {
      const text = line.replace(/^[-*|\s🔴]+/, '').trim();
      if (text && !rows.some((r) => r.text === text)) {
        rows.push({ text, severity: 'critical' });
      }
    }
  }
  return rows;
}

function parseThesis(md: string): Partial<InvestmentThesis> {
  const section = extractSection(md, /## Investment Thesis/i);
  const get = (key: string): string => {
    const re = new RegExp(`\\*\\*${key}\\*\\*\\s*\\|\\s*([^|\\n]+)`, 'i');
    return section.match(re)?.[1]?.trim() ?? '';
  };
  const scoreMatch = get('Score').match(/(\d+)/);
  return {
    status: get('Status') || 'HOLD',
    score100: scoreMatch ? parseInt(scoreMatch[1], 10) : 0,
    valuationLabel: get('Valuation'),
    businessLabel: get('Business'),
    earningsLabel: get('Earnings'),
    riskLabel: get('Risk'),
    whyOwn: get('Why own'),
    whyNotAggressive: get('Why not buy aggressively'),
    changeMind: get('What would change my mind'),
    nextReview: get('Next review'),
  };
}

function parseComponentOverrides(md: string): Partial<Record<string, number>> {
  const section = extractSection(md, /## Component overrides/i);
  const out: Partial<Record<string, number>> = {};
  for (const line of section.split('\n')) {
    if (!line.trim().startsWith('|') || /Component|---/i.test(line)) continue;
    const cells = line.split('|').map((c) => c.trim()).filter(Boolean);
    if (cells.length < 2) continue;
    const key = cells[0].toLowerCase();
    const n = parseFloat(cells[1]);
    if (!Number.isFinite(n)) continue;
    if (key.includes('valuation')) out.valuation = n;
    else if (key.includes('earnings')) out.earningsQuality = n;
    else if (key.includes('business')) out.businessQuality = n;
    else if (key.includes('growth')) out.growth = n;
    else if (key.includes('risk')) out.risk = n;
  }
  return out;
}

function deriveValuationScore10(
  peEval: Awaited<ReturnType<typeof loadPeEvaluation>>
): number {
  if (!peEval) return 5;
  let score = 5.5;
  const prem = peEval.premiumTo10yPct;
  if (prem != null) {
    if (prem <= -10) score = 9;
    else if (prem <= -3) score = 8;
    else if (prem <= 6) score = 7;
    else if (prem <= 15) score = 6;
    else if (prem <= 25) score = 5;
    else score = 4;
  }
  if (peEval.forward.forwardPremiumIv) {
    const m = peEval.forward.forwardPremiumIv.match(/(-?\d+(?:\.\d+)?)/);
    if (m) {
      const fwdPrem = parseFloat(m[1]);
      if (fwdPrem > 12) score -= 0.5;
      if (fwdPrem < 0) score += 0.5;
    }
  }
  return round1(clamp(score, 0, 10));
}

function deriveEarningsQualityScore10(
  eq: Awaited<ReturnType<typeof runEarningsQualityAnalysis>>
): number {
  if (!eq) return 5;
  let score = 7;
  if (eq.overallTone === 'good') score = 8;
  else if (eq.overallTone === 'bad') score = 4;
  else score = 6.5;
  score -= eq.warnings.length * 0.75;
  const patTrend = eq.quarterlyTrends.find((t) => t.metric === 'PAT');
  if (patTrend?.trend === 'deteriorating') score -= 0.5;
  if (patTrend?.trend === 'improving') score += 0.5;
  return round1(clamp(score, 0, 10));
}

function deriveGrowthScore10(
  quality: ReturnType<typeof parseFrameworkQualityMetrics>,
  forward: ReturnType<typeof parseForwardGrowthTab>
): number {
  const eps = quality.baseEpsCagrPct;
  let score = 5.5;
  if (eps != null) {
    if (eps >= 15) score = 8.5;
    else if (eps >= 12) score = 7.5;
    else if (eps >= 10) score = 7;
    else if (eps >= 7) score = 6;
    else if (eps >= 4) score = 5;
    else score = 4;
  }
  const vol = forward.volumeCagr;
  if (vol) {
    const m = vol.match(/([\d.]+)/);
    if (m && parseFloat(m[1]) >= 10) score += 0.5;
  }
  return round1(clamp(score, 0, 10));
}

function deriveRiskScore10(
  riskFactors: RiskFactorRow[],
  internal: ReturnType<typeof parseRiskFactor>,
  external: ReturnType<typeof parseRiskFactor>
): number {
  if (riskFactors.length > 0) {
    const signals = riskFactors.map((r) => r.signal);
    const green = signals.filter((s) => s === '🟢').length;
    const red = signals.filter((s) => s === '🔴').length;
    const yellow = signals.filter((s) => s === '🟡').length;
    const total = signals.filter((s) => s !== '—').length || 1;
    let score = 5 + (green / total) * 4 - (red / total) * 3 - (yellow / total) * 0.5;
    return round1(clamp(score, 0, 10));
  }
  const worst = Math.max(internal.score, external.score);
  if (worst >= 3) return 4;
  if (worst >= 2) return 6;
  if (worst >= 1) return 7;
  return 8;
}

function computeScore100(components: ComponentScore[]): number {
  const total = components.reduce((s, c) => s + c.weightedContribution, 0);
  return Math.round(total);
}

function scoreToVerdict(score100: number): { verdict: string; tone: VerdictTone; emoji: string } {
  if (score100 >= 80) return { verdict: 'STRONG BUY / ADD', tone: 'strong-buy', emoji: '🟢' };
  if (score100 >= 65) return { verdict: 'HOLD / SELECTIVE ADD', tone: 'selective-add', emoji: '🟢' };
  if (score100 >= 50) return { verdict: 'HOLD / WAIT', tone: 'wait', emoji: '🟡' };
  if (score100 >= 35) return { verdict: 'REDUCE', tone: 'reduce', emoji: '🟠' };
  return { verdict: 'SELL / AVOID', tone: 'avoid', emoji: '🔴' };
}

function buildPositivesAndConcerns(input: {
  components: ComponentScore[];
  eq: Awaited<ReturnType<typeof runEarningsQualityAnalysis>>;
  bq: Awaited<ReturnType<typeof runBusinessQualityAnalysis>>;
  thesis: Partial<InvestmentThesis>;
  warnings: string[];
}): { positives: string[]; concerns: string[] } {
  const positives: string[] = [];
  const concerns: string[] = [];

  const bq = input.components.find((c) => c.id === 'businessQuality');
  const val = input.components.find((c) => c.id === 'valuation');
  const eqC = input.components.find((c) => c.id === 'earningsQuality');
  const growth = input.components.find((c) => c.id === 'growth');
  const risk = input.components.find((c) => c.id === 'risk');

  if (bq && bq.score10 >= 7) positives.push('Strong business quality and franchise moat');
  if (growth && growth.score10 >= 6.5) positives.push('Solid long-term earnings growth path');
  if (risk && risk.score10 >= 6.5) positives.push('Healthy balance sheet / manageable risk profile');
  if (input.thesis.whyOwn) positives.push(input.thesis.whyOwn);

  if (val && val.score10 < 7.5) concerns.push('Current valuation is not cheap vs history or forward fair value');
  if (input.eq?.warnings.length) {
    concerns.push(
      input.eq.warnings[0]?.detail ??
        'Latest quarter shows earnings quality warning'
    );
  }
  if (eqC && eqC.score10 < 7.5 && !input.eq?.warnings.length) {
    concerns.push('Earnings quality mixed — monitor quarterly translation');
  }
  if (input.thesis.whyNotAggressive) concerns.push(input.thesis.whyNotAggressive);

  return {
    positives: [...new Set(positives)].slice(0, 3),
    concerns: [...new Set(concerns)].slice(0, 3),
  };
}

function buildRiskBuckets(factors: RiskFactorRow[]): { bucket: string; signal: RiskSignal; factorCount: number }[] {
  const buckets = ['Business risk', 'Financial risk', 'Valuation risk', 'Governance risk', 'External risk'];
  return buckets.map((bucket) => {
    const bf = factors.filter((f) => f.bucket === bucket);
    const reds = bf.filter((f) => f.signal === '🔴').length;
    const yellows = bf.filter((f) => f.signal === '🟡').length;
    let signal: RiskSignal = '🟢';
    if (reds > 0) signal = '🔴';
    else if (yellows >= 2) signal = '🟡';
    else if (yellows === 1) signal = '🟡';
    return { bucket, signal, factorCount: bf.length };
  });
}

export async function runRiskDecisionAnalysis(
  input: RunRiskDecisionInput
): Promise<RiskDecisionResult | null> {
  const resolved = await resolveStock(input.ticker.trim());
  if (!resolved) return null;

  const loc = await getStockbookByTicker(resolved.ticker);
  const sector = loc?.sector ?? resolved.sector;
  const stockName = loc?.stock ?? resolved.company;

  const rdFile = await readRiskDecisionFile(sector, stockName, resolved.ticker, input.tenantId);
  const rdMd = rdFile?.content ?? '';

  const [peEval, eq, bq] = await Promise.all([
    loadPeEvaluation(resolved.ticker, input.tenantId),
    runEarningsQualityAnalysis({ ticker: resolved.ticker, tenantId: input.tenantId }),
    runBusinessQualityAnalysis({ ticker: resolved.ticker, tenantId: input.tenantId }),
  ]);

  const parameters = await readStockTabContent(sector, stockName, 'parameters', input.tenantId);
  const internal = await readStockTabContent(sector, stockName, 'internal-risk', input.tenantId);
  const external = await readStockTabContent(sector, stockName, 'external-risk', input.tenantId);

  const parametersMd = parameters?.content ?? null;
  const quality = parseFrameworkQualityMetrics(parametersMd, null);
  const forward = parseForwardGrowthTab(parametersMd);
  const internalRisk = parseRiskFactor(internal?.content ?? null, 'internal-negative-risk.md');
  const externalRisk = parseRiskFactor(external?.content ?? null, 'external-negative-risk.md');

  const overrides = parseComponentOverrides(rdMd);
  const riskFactors = parseRiskBucketTables(rdMd);
  const catalysts = parseCatalysts(rdMd);
  const thesisBreakers = parseThesisBreakers(rdMd);
  const parsedThesis = parseThesis(rdMd);

  const valuation10 = overrides.valuation ?? deriveValuationScore10(peEval);
  const earnings10 = overrides.earningsQuality ?? deriveEarningsQualityScore10(eq);
  const business10 = overrides.businessQuality ?? bq?.businessQualityScore10 ?? 5;
  const growth10 = overrides.growth ?? deriveGrowthScore10(quality, forward);
  const risk10 = overrides.risk ?? deriveRiskScore10(riskFactors, internalRisk, externalRisk);

  const components: ComponentScore[] = [
    {
      id: 'valuation',
      label: 'Valuation',
      weightPct: WEIGHTS.valuation,
      score10: valuation10,
      weightedContribution: (valuation10 / 10) * WEIGHTS.valuation,
      source: 'PE Evaluation / PARAMETERS',
    },
    {
      id: 'earningsQuality',
      label: 'Earnings Quality',
      weightPct: WEIGHTS.earningsQuality,
      score10: earnings10,
      weightedContribution: (earnings10 / 10) * WEIGHTS.earningsQuality,
      source: 'Tab 3 — earnings quality engine',
    },
    {
      id: 'businessQuality',
      label: 'Business Quality',
      weightPct: WEIGHTS.businessQuality,
      score10: business10,
      weightedContribution: (business10 / 10) * WEIGHTS.businessQuality,
      source: 'Tab 4 — business quality engine',
    },
    {
      id: 'growth',
      label: 'Growth / CAGR',
      weightPct: WEIGHTS.growth,
      score10: growth10,
      weightedContribution: (growth10 / 10) * WEIGHTS.growth,
      source: 'PARAMETERS forward EPS / volume',
    },
    {
      id: 'risk',
      label: 'Risk',
      weightPct: WEIGHTS.risk,
      score10: risk10,
      weightedContribution: (risk10 / 10) * WEIGHTS.risk,
      source: 'Section A + risk registers',
    },
  ];

  const quantitativeScore100 = computeScore100(components);
  const { verdict, tone, emoji } = scoreToVerdict(quantitativeScore100);

  const { positives, concerns } = buildPositivesAndConcerns({
    components,
    eq,
    bq,
    thesis: parsedThesis,
    warnings: eq?.warnings.map((w) => w.detail) ?? [],
  });

  const nextQuarterWatch = [
    'Revenue growth',
    'Operating margin',
    'EPS vs prior year',
  ];

  let cmp: number | null = peEval?.cmp ?? eq?.cmp ?? bq?.cmp ?? null;
  let cmpSource = peEval?.cmpSource ?? eq?.cmpSource ?? bq?.cmpSource ?? 'Unavailable';
  if (cmp == null) {
    try {
      const live = await fetchLiveNseCmp(resolved.ticker);
      if (live?.price) {
        cmp = live.price;
        cmpSource = live.source;
      }
    } catch {
      /* ok */
    }
  }

  const thesis: InvestmentThesis = {
    status: parsedThesis.status || verdict.split('/')[0]?.trim() || 'HOLD',
    score100: quantitativeScore100,
    valuationLabel: parsedThesis.valuationLabel || (valuation10 >= 7 ? 'Fair' : valuation10 >= 5 ? 'Stretched' : 'Expensive'),
    businessLabel: parsedThesis.businessLabel || (business10 >= 7 ? 'Strong' : 'Average'),
    earningsLabel:
      parsedThesis.earningsLabel ||
      (eq?.warnings.length ? 'Healthy long-term / recent warning' : earnings10 >= 7 ? 'Healthy' : 'Mixed'),
    riskLabel: parsedThesis.riskLabel || (risk10 >= 7 ? 'Low-Medium' : risk10 >= 5 ? 'Medium' : 'Elevated'),
    whyOwn: parsedThesis.whyOwn || positives[0] || 'Quality franchise — see Business Quality tab',
    whyNotAggressive:
      parsedThesis.whyNotAggressive || concerns[0] || 'Valuation and near-term earnings trajectory',
    changeMind:
      parsedThesis.changeMind ||
      thesisBreakers[0]?.text ||
      'Sustained EPS deterioration or material moat erosion',
    nextReview: parsedThesis.nextReview || 'Next quarterly results',
  };

  const investmentVerdict =
    parsedThesis.status && quantitativeScore100 >= 65 && quantitativeScore100 < 80
      ? `${parsedThesis.status} / SELECTIVE ADD`
      : `${emoji} ${verdict}`;

  return {
    ticker: resolved.ticker,
    stockName,
    sector,
    cmp,
    cmpSource,
    analyzedAt: new Date().toISOString(),
    dataSource: rdFile?.filename ?? 'Live tab synthesis + StockBook risk registers',
    riskDecisionFile: rdFile?.filename ?? null,
    stockbookUrl: stockbookPath(sector, stockName, 'summary'),
    thesis,
    riskFactors,
    riskBuckets: buildRiskBuckets(riskFactors),
    catalysts,
    thesisBreakers,
    components,
    quantitativeScore100,
    investmentVerdict,
    verdictTone: tone,
    verdictEmoji: emoji,
    positives: positives.length >= 3 ? positives : [...positives, 'Strong franchise and scale', 'Long-term sector tailwind'].slice(0, 3),
    concerns: concerns.length >= 3 ? concerns : [...concerns, 'Monitor next quarter margins', 'Valuation not at deep discount'].slice(0, 3),
    nextQuarterWatch,
    narrativeSummary: (quantitativeScore100 < 80 || valuation10 < 7.5 || (eq?.warnings.length ?? 0) > 0)
      ? 'Not a screaming BUY — excellent business qualities with valuation and/or near-term earnings caveats.'
      : 'Strong composite score — business, earnings, and valuation align for aggressive add consideration.',
    notScreamingBuy: quantitativeScore100 < 80 || valuation10 < 7.5 || (eq?.warnings.length ?? 0) > 0,
  };
}
