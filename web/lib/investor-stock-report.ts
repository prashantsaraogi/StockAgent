/**
 * Shared investor-facing stock report sections (Ask Agent + Stock Analysis Basic).
 */

import type { HoldingRow } from './holdings';
import type { StockCalculatorFullResult } from './stock-calculator-full';
import type { DisciplineRule } from './investor-discipline-web';
import { buildInvestmentAnalysisReport } from './investment-analysis-report';

export function extractFaqSection(faq: string | null, headingPrefix: string): string | null {
  if (!faq) return null;
  const re = new RegExp(
    `(## ${headingPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^\\n]*[\\s\\S]*?)(?=\\n## |\\n---\\s*\\n|$)`,
    'i'
  );
  const m = faq.match(re);
  return m?.[1]?.trim() ?? null;
}

/** Midpoint of a PCCL range like ₹300–340 (en-dash or hyphen, one or two ₹ signs). */
function parsePcclRangeLoHi(loRaw: string, hiRaw: string): number {
  const lo = parseFloat(loRaw.replace(/,/g, ''));
  const hi = parseFloat(hiRaw.replace(/,/g, ''));
  return Math.round((lo + hi) / 2);
}

export function extractPcclAnchor(md: string | null): number | null {
  if (!md) return null;

  /** Prefer explicit pessimistic / PCCL labels — avoid fair-P/E implied price tables (e.g. 28×–30× rows). */
  const labeledPatterns: RegExp[] = [
    /PCCL anchor\s*\(\s*pessimistic\s*\)[^|\n]*\|\s*₹([\d,]+)\s*[–-]\s*₹?\s*([\d,]+)/i,
    /Pessimistic anchor[^|\n]*\|\s*₹([\d,]+)\s*[–-]\s*₹?\s*([\d,]+)/i,
    /Rational PCCL[^₹|\n]*₹([\d,]+)\s*[–-]\s*₹?\s*([\d,]+)/i,
    /PCCL anchor[^₹|\n]*₹([\d,]+)\s*[–-]\s*₹?\s*([\d,]+)/i,
    /\*\*PCCL anchor\*\*[^|]*\|\s*[^|]*\|\s*[^|]*\|\s*\*\*₹([\d,]+)\*\*/i,
    /PCCL[^₹|\n]{0,40}₹([\d,]+)\s*[–-]\s*₹?\s*([\d,]+)/i,
  ];

  for (const re of labeledPatterns) {
    const m = md.match(re);
    if (m && m[2]) return parsePcclRangeLoHi(m[1], m[2]);
  }

  const single = md.match(/\*\*PCCL[^*]*\*\*[^₹]*₹([\d,]+)/i);
  if (single) return parseFloat(single[1].replace(/,/g, ''));

  return null;
}

export function formatCagrGapPp(gap: number | null): string {
  if (gap == null) return 'n/a';
  const rounded = Math.round(gap * 10) / 10;
  if (Math.abs(rounded) < 0.05) return '0 pp (aligned)';
  const sign = rounded >= 0 ? '+' : '';
  return `${sign}${rounded.toFixed(1)} pp`;
}

export function displayOverallRiskView(
  holding: HoldingRow | null,
  discipline: DisciplineRule | null,
  moduleVerdict: string
): string {
  if (!holding) {
    if (discipline && discipline.surplusPct === 0) {
      return `WATCHLIST / WAIT for fresh capital — ${discipline.reason.split('(')[0]?.trim() ?? discipline.reason}`;
    }
    if (moduleVerdict.toUpperCase().includes('AVOID')) return moduleVerdict;
    return 'WATCHLIST / WAIT — confirm PCCL, sector rank, and core-problem before starter size';
  }
  return moduleVerdict;
}

export function appliedPccl(
  base: number | null,
  cmp: number | null,
  holding: HoldingRow | null
): number | null {
  if (base == null) return null;
  if (!holding || cmp == null) return base;
  if (cmp < holding.avgCost) return cmp;
  return base;
}

export function premiumToPcclPct(cmp: number | null, pccl: number | null): number | null {
  if (cmp == null || pccl == null || pccl <= 0) return null;
  return Math.round(((cmp - pccl) / pccl) * 1000) / 10;
}

export function formatInr(n: number): string {
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

export function formatPct(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}

export function clip(text: string, max = 1200): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + '\n\n… [truncated]';
}

export function deriveInvestorOneLine(
  analysis: StockCalculatorFullResult,
  discipline: DisciplineRule | null,
  holding: HoldingRow | null,
  premiumPccl: number | null
): string {
  if (analysis.riskDecision.verdictTone === 'avoid') {
    return `AVOID fresh capital — ${analysis.riskDecision.thesis.riskLabel}`;
  }

  if (discipline && discipline.surplusPct === 0) {
    const reason = discipline.reason.split('(')[0]?.trim() ?? discipline.reason;
    if (!holding) {
      return `WATCHLIST / WAIT for fresh capital — ${reason}`;
    }
    return `HOLD legacy · PAUSE surplus adds (0% rank) — ${reason}`;
  }

  if (!holding && premiumPccl != null && premiumPccl > 25) {
    return 'WAIT / WATCHLIST — premium to PCCL elevated for fresh entry';
  }

  if (!holding && premiumPccl != null && premiumPccl < -5) {
    if (!analysis.riskDecision.notScreamingBuy) {
      return 'STEADY SIP / STAGED STARTER OK — below Rational PCCL; size-capped (tier 4–5), not lump sum';
    }
    return 'WATCHLIST — cheap vs pessimistic anchor; confirm core problem before starter size';
  }

  if (holding && premiumPccl != null && premiumPccl <= 0) {
    return 'HOLD legacy · STEADY / ACCELERATE SIP (tier 4–5) — at or below Rational PCCL if core-problem clear';
  }

  if (holding && premiumPccl != null && premiumPccl > 15) {
    return 'HOLD legacy · token / size-capped adds only above Applied PCCL';
  }

  if (analysis.cagr.frameworkVerdict?.includes('WAIT')) {
    return analysis.cagr.frameworkVerdict.replace(/framework/gi, 'discipline').slice(0, 140);
  }

  if (!holding) {
    return analysis.riskDecision.notScreamingBuy
      ? 'WATCHLIST / WAIT — confirm sector rank and PCCL before starter size'
      : 'STAGED STARTER OK — small size until thesis proof';
  }

  const risk = analysis.riskDecision.investmentVerdict;
  return risk.replace(/^[^\w]+/, '').slice(0, 140) || 'HOLD — review quarterly before adding';
}

export interface InvestorReportParts {
  analysis: StockCalculatorFullResult;
  holding: HoldingRow | null;
  cmp: number | null;
  cmpSource: string;
  pcclBase: number | null;
  pcclApplied: number | null;
  premiumPccl: number | null;
  discipline: DisciplineRule | null;
  oneLine: string;
  faq: string | null;
  summaryMd: string | null;
  declineSection: string | null;
  fiftyTwoWeekHigh?: number | null;
  fiftyTwoWeekLow?: number | null;
}

export function buildInvestorStockReportMarkdown(parts: InvestorReportParts): string {
  return buildInvestmentAnalysisReport(parts);
}
