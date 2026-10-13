/**
 * Dynamic internal / external risk overlay when StockBook risk files are missing (e.g. serverless deploy)
 * or registers parse empty. Sector templates + quality/EQ signals — framework logic stays server-side.
 */

import {
  parseRiskFactor,
  type FrameworkQualityMetrics,
  type RiskFactorResult,
} from './stock-calculator-framework';

export interface DynamicRiskContext {
  sector: string;
  ticker: string;
  stockName: string;
  quality: FrameworkQualityMetrics;
  eqWarning?: string | null;
  overallEqTone?: 'good' | 'mixed' | 'bad';
}

type RiskSide = 'internal' | 'external';

interface TemplateRow {
  name: string;
  level: RiskFactorResult['level'];
  haircutMidPp: number;
  range: string;
}

function sectorKey(sector: string): string {
  const s = sector.toLowerCase();
  if (s.includes('auto')) return 'auto';
  if (s.includes('oil') || s.includes('gas') || s.includes('omc')) return 'oil';
  if (s.includes('bank') || s.includes('finance') || s.includes('insurance') || s.includes('nbfc'))
    return 'finance';
  if (s.includes('it') || s.includes('software')) return 'it';
  if (s.includes('pharma') || s.includes('health')) return 'pharma';
  if (s.includes('fmcg') || s.includes('consumer')) return 'fmcg';
  if (s.includes('telecom')) return 'telecom';
  if (s.includes('infra') || s.includes('construction')) return 'infra';
  return 'generic';
}

function internalTemplates(key: string): TemplateRow[] {
  switch (key) {
    case 'auto':
      return [
        { name: 'Margin vs volume / cost pass-through', level: 'L1-L2', haircutMidPp: 3.5, range: '2–5 pp' },
        { name: 'Competitive share & product mix', level: 'L1-L2', haircutMidPp: 2.5, range: '1–4 pp' },
      ];
    case 'oil':
      return [
        { name: 'Marketing margin & inventory losses', level: 'L1-L2', haircutMidPp: 4, range: '3–7 pp' },
        { name: 'Regulatory / subsidy timing', level: 'L1-L2', haircutMidPp: 3, range: '2–5 pp' },
      ];
    case 'finance':
      return [
        { name: 'Asset quality / credit costs', level: 'L1-L2', haircutMidPp: 4, range: '3–7 pp' },
        { name: 'Governance & conduct (live news)', level: 'L2', haircutMidPp: 5, range: '3–7 pp' },
      ];
    case 'it':
      return [
        { name: 'Deal pipeline & pricing pressure', level: 'L1-L2', haircutMidPp: 4, range: '3–7 pp' },
        { name: 'AI / structural demand shift', level: 'L2-L3', haircutMidPp: 6, range: '5–8 pp' },
      ];
    case 'pharma':
      return [
        { name: 'US pricing / regulatory filings', level: 'L1-L2', haircutMidPp: 3.5, range: '2–5 pp' },
        { name: 'R&D / pipeline execution', level: 'L1-L2', haircutMidPp: 2.5, range: '1–4 pp' },
      ];
    case 'fmcg':
      return [
        { name: 'Volume vs premium mix', level: 'L1', haircutMidPp: 2, range: '0–2 pp' },
        { name: 'Input inflation / margin', level: 'L1-L2', haircutMidPp: 3, range: '2–5 pp' },
      ];
    default:
      return [
        { name: 'Execution vs guidance', level: 'L1-L2', haircutMidPp: 3, range: '2–5 pp' },
        { name: 'Balance sheet / cash conversion', level: 'L1', haircutMidPp: 1.5, range: '0–2 pp' },
      ];
  }
}

function externalTemplates(key: string): TemplateRow[] {
  switch (key) {
    case 'auto':
      return [
        { name: 'Input costs & commodity inflation', level: 'L1-L2', haircutMidPp: 3.5, range: '2–5 pp' },
        { name: 'Industry volumes (monthly sales trend)', level: 'L1-L2', haircutMidPp: 3, range: '2–4 pp' },
        { name: 'Fuel prices & EV / policy mix', level: 'L1', haircutMidPp: 1.5, range: '0–2 pp' },
      ];
    case 'oil':
      return [
        { name: 'Crude price & crack spreads', level: 'L1-L2', haircutMidPp: 5, range: '3–7 pp' },
        { name: 'Government pricing / duty policy', level: 'L1-L2', haircutMidPp: 4, range: '2–5 pp' },
      ];
    case 'finance':
      return [
        { name: 'RBI rates & liquidity', level: 'L1-L2', haircutMidPp: 3, range: '2–5 pp' },
        { name: 'Macro credit cycle', level: 'L1-L2', haircutMidPp: 3.5, range: '2–5 pp' },
      ];
    case 'it':
      return [
        { name: 'Client spend / macro IT budget', level: 'L1-L2', haircutMidPp: 4, range: '3–7 pp' },
        { name: 'Visa / geo policy on services', level: 'L1', haircutMidPp: 2, range: '0–2 pp' },
      ];
    case 'pharma':
      return [
        { name: 'US FDA / import policy', level: 'L1-L2', haircutMidPp: 3, range: '2–5 pp' },
        { name: 'Currency & export demand', level: 'L1', haircutMidPp: 2, range: '0–2 pp' },
      ];
    case 'fmcg':
      return [
        { name: 'Rural demand & monsoon', level: 'L1-L2', haircutMidPp: 2.5, range: '1–4 pp' },
        { name: 'Commodity / packaging costs', level: 'L1', haircutMidPp: 2, range: '0–2 pp' },
      ];
    default:
      return [
        { name: 'Macro growth & rates', level: 'L1', haircutMidPp: 2, range: '0–2 pp' },
        { name: 'Sector regulation & competition', level: 'L1-L2', haircutMidPp: 3, range: '2–5 pp' },
      ];
  }
}

function levelScore(level: RiskFactorResult['level']): number {
  if (level === 'L3') return 3;
  if (level === 'L2-L3') return 2.5;
  if (level === 'L2') return 2;
  if (level === 'L1-L2') return 1.5;
  if (level === 'L1') return 1;
  return 0;
}

function applyQualityAdjustments(
  side: RiskSide,
  rows: TemplateRow[],
  ctx: DynamicRiskContext
): TemplateRow[] {
  const out = [...rows];
  const q = ctx.quality;

  if (side === 'internal') {
    if (q.roePct != null && q.roePct < 12) {
      out.push({
        name: 'Return on equity below quality hurdle',
        level: 'L1-L2',
        haircutMidPp: 2.5,
        range: '1–4 pp',
      });
    }
    if (q.debtRatio != null && q.debtRatio > 2) {
      out.push({
        name: 'Leverage elevated vs comfort band',
        level: 'L2',
        haircutMidPp: 5,
        range: '3–7 pp',
      });
    }
    if (ctx.eqWarning || ctx.overallEqTone === 'bad') {
      out.push({
        name: 'Earnings quality warning (cash vs profit)',
        level: 'L1-L2',
        haircutMidPp: 3.5,
        range: '2–5 pp',
      });
    }
  }

  return out;
}

function worstOf(rows: TemplateRow[]): TemplateRow {
  let w = rows[0];
  for (const r of rows) {
    if (levelScore(r.level) >= levelScore(w.level) && r.haircutMidPp >= w.haircutMidPp) {
      w = r;
    }
  }
  return w;
}

export function synthesizeDynamicRiskFactor(
  side: RiskSide,
  ctx: DynamicRiskContext
): RiskFactorResult {
  const key = sectorKey(ctx.sector);
  const base = side === 'internal' ? internalTemplates(key) : externalTemplates(key);
  const rows = applyQualityAdjustments(side, base, ctx);
  const worst = worstOf(rows);
  const topRisks = rows.slice(0, 3).map((r) => `${r.name} (${r.level})`);
  const label = side === 'internal' ? 'Company' : 'Macro / sector';

  return {
    level: worst.level,
    score: levelScore(worst.level),
    haircutMidPp: worst.haircutMidPp,
    haircutRange: worst.range,
    activeRiskCount: rows.length,
    topRisks,
    summary: `${label} overlay (estimated): ${worst.name} — trim ~${worst.haircutMidPp.toFixed(1)} pp`,
    source: 'dynamic-synthesis',
  };
}

/** Prefer StockBook register; else sector + quality dynamic overlay. */
export function resolveRiskFactor(
  riskMd: string | null,
  source: 'internal-negative-risk.md' | 'external-negative-risk.md',
  ctx: DynamicRiskContext
): RiskFactorResult {
  const parsed = parseRiskFactor(riskMd, source);
  if (parsed.activeRiskCount > 0) return parsed;
  const side = source === 'internal-negative-risk.md' ? 'internal' : 'external';
  return synthesizeDynamicRiskFactor(side, ctx);
}

/** Short label for Part B table columns (no StockBook / evidence tags). */
export function investorRiskFactorShort(risk: RiskFactorResult): string {
  if (risk.topRisks[0]) {
    return risk.topRisks[0].replace(/\s*\([^)]+\)\s*$/, '').trim();
  }
  if (risk.source === 'dynamic-synthesis') {
    return risk.summary.replace(/^[^:]+:\s*/, '').split('—')[0]?.trim() || 'Sector monitoring';
  }
  return 'Routine monitoring';
}

export function investorForwardYearNote(
  yearIndex: number,
  internal: RiskFactorResult,
  external: RiskFactorResult
): string {
  const ext = investorRiskFactorShort(external);
  const int = investorRiskFactorShort(internal);
  if (yearIndex === 0) {
    return `Near term: ${ext} and ${int.toLowerCase()} matter most for this year’s EPS path.`;
  }
  return `Outer years: macro trims usually fade if risks stay temporary; still track ${int.toLowerCase()}.`;
}
