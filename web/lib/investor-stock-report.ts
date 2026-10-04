/**
 * Shared investor-facing stock report sections (Ask Agent + Stock Analysis Basic).
 */

import type { HoldingRow } from './holdings';
import type { StockCalculatorFullResult } from './stock-calculator-full';
import type { DisciplineRule } from './investor-discipline-web';

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

  const patterns: RegExp[] = [
    /\*\*PCCL anchor\*\*[^|]*\|\s*[^|]*\|\s*[^|]*\|\s*\*\*₹([\d,]+)\*\*/i,
    /Rational PCCL[^₹|\n]*₹([\d,]+)\s*[–-]\s*₹?\s*([\d,]+)/i,
    /PCCL anchor[^₹|\n]*₹([\d,]+)\s*[–-]\s*₹?\s*([\d,]+)/i,
    /PCCL[^₹|\n]{0,40}₹([\d,]+)\s*[–-]\s*₹?\s*([\d,]+)/i,
    /\|\s*₹([\d,]+)\s*[–-]\s*([\d,]+)/,
  ];

  for (const re of patterns) {
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
    return 'WATCHLIST — cheap vs pessimistic anchor; confirm core problem before starter size';
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
}

export function buildInvestorStockReportMarkdown(parts: InvestorReportParts): string {
  const {
    analysis,
    holding,
    cmp,
    cmpSource,
    pcclBase,
    pcclApplied,
    premiumPccl,
    discipline,
    oneLine,
    faq,
    summaryMd,
    declineSection,
  } = parts;

  const c = analysis.cagr;
  const pe = analysis.peParameters;
  const bq = analysis.businessQuality;
  const risk = analysis.riskDecision;
  const date = analysis.analyzedAt.slice(0, 10);

  const positionBlock = holding
    ? `| Qty | Avg cost | Cost basis | Unrealized vs CMP |
|----:|---------:|-----------:|-------------------|
| ${holding.qty} | ${formatInr(holding.avgCost)} | ${formatInr(holding.costBasis)} | ${cmp != null ? (cmp >= holding.avgCost ? 'Gain' : '**Loss (Applied PCCL floor may apply)**') : 'UNVERIFIED CMP'} |`
    : `| Qty | Avg cost | Lens |
|----:|---------:|------|
| **0** | — | **Fresh entry only** — no legacy holder, YoC, or averaging rules |`;

  const pcclLabel = holding ? '**Applied PCCL** (loss-book floor)' : '**PCCL anchor (fresh buyer)**';
  const pcclRef = pcclApplied ?? pcclBase;

  const valuationRowLines = [
    pcclBase != null ? `| Rational / pessimistic PCCL anchor | ${formatInr(pcclBase)} (mid of StockBook range) |` : null,
    pcclRef != null ? `| ${pcclLabel.replace(/\|/g, '')} | **${formatInr(pcclRef)}** |` : null,
    cmp != null ? `| CMP (${cmpSource}) | ${formatInr(cmp)} |` : null,
    premiumPccl != null && pcclRef != null
      ? `| Premium to ${holding ? 'Applied' : 'Rational'} PCCL | **${formatPct(premiumPccl)}** |`
      : null,
    pe.ttmPe != null ? `| TTM P/E @ CMP | **${pe.ttmPe.toFixed(1)}×** |` : null,
    pe.avg10yPe != null ? `| 10Y avg P/E (Part 1) | **${pe.avg10yPe.toFixed(1)}×** |` : null,
  ].filter(Boolean) as string[];

  const valuationBlock =
    valuationRowLines.length > 0
      ? `| Metric | Value |\n|--------|------:|\n${valuationRowLines.join('\n')}`
      : `| Metric | Value |\n|--------|------:|\n| CMP | ${cmp != null ? formatInr(cmp) : '—'} |\n| PCCL | *Refresh StockBook / PARAMETERS for this ticker* |`;

  const overallRisk = displayOverallRiskView(holding, discipline, risk.investmentVerdict);
  const businessReading = enrichBusinessQualityReading(
    bq.verdict,
    bq.businessQualityScore10,
    faq,
    summaryMd
  );
  const scorecardRisk = holding
    ? analysis.overview.riskVerdict
    : discipline?.surplusPct === 0
      ? 'WATCHLIST / WAIT (0% fresh surplus)'
      : analysis.overview.riskVerdict;

  const freshAction = discipline
    ? !holding
      ? discipline.freshSurplusAction ?? discipline.surplusAction
      : discipline.surplusAction
    : risk.notScreamingBuy
      ? '**WAIT / WATCHLIST** — confirm PCCL and sector rank vs peers'
      : '**STAGED STARTER OK** — ≤1% book, 3–5 shares until proof';

  const nextReview =
    extractNextReviewFromStockbook(faq, summaryMd) ?? risk.thesis.nextReview ?? 'After quarterly results and material news';

  const legacyAction = holding
    ? discipline
      ? discipline.legacyAction
      : '**HOLD** — no trim for valuation alone per long-term mandate'
    : '**Not in your portfolio** — fresh-capital lens only';

  const disciplineNote =
    discipline && !holding
      ? `\n*Fresh capital note:* ${discipline.reason} Surplus rank **${discipline.surplusPct}%** for this name.\n`
      : discipline && holding
        ? `\n| Personal rules | |
|---|---|
| Surplus rank | **${discipline.surplusPct}%** |
| Note | ${discipline.reason} |
`
        : '';

  const declineBlock = declineSection
    ? `\n---\n\n${declineSection.replace(/^## Q\d+\.[^\n]*\n?/i, '## Why the stock fell\n\n')}\n`
    : risk.narrativeSummary
      ? `\n---\n\n## Why cheap / core problem\n\n${clip(risk.narrativeSummary, 900)}\n\n**Watch:** ${risk.thesisBreakers.slice(0, 3).map((t) => t.text).join(' · ') || '—'}\n`
      : '';

  const quotes = pickInvestorQuotes(holding != null, discipline != null, c.cagrGap.gapTone);

  return `# ${analysis.stockName} (${analysis.ticker}) — Investment view

**Assumption:** ${holding ? 'Your imported portfolio' : '**0 shares** (fresh capital only)'} · **Date checked:** ${date}  
**CMP:** ${cmp != null ? formatInr(cmp) : '—'} (${cmpSource})

> **One-line:** ${oneLine}

---

## Your position

${positionBlock}

---

## Business quality vs risks

| Area | Reading |
|------|---------|
| Business quality | ${businessReading} |
| Earnings quality | ${analysis.earningsQuality.overallVerdict} |
| Margin trend | ${analysis.margin.overallVerdict} |
| Overall risk view | ${overallRisk} |

${risk.concerns.length ? `**Key concerns:** ${risk.concerns.slice(0, 4).join(' · ')}` : ''}

${holding && risk.thesis.whyOwn ? `**Why own (if held):** ${clip(risk.thesis.whyOwn, 400)}` : ''}
${!holding ? extractFreshCapitalFraming(summaryMd, discipline) : ''}
${risk.thesis.whyNotAggressive ? `\n**Why not add aggressively:** ${clip(risk.thesis.whyNotAggressive, 400)}` : ''}

${extractCoreProblemBlurb(faq)}

---

## Valuation & PCCL

${valuationBlock}

**Growth vs your ${analysis.inputs.expectedCagrPct}% CAGR assumption:** ${formatCagrGapPp(c.cagrGap.cagrGapPp)} — ${c.frameworkVerdict ?? c.impliedVerdict}

${!holding && pcclBase != null && premiumPccl != null && premiumPccl < 0 ? `*Fresh-buy read:* CMP is **below** the pessimistic PCCL anchor — run the core-problem test (policy, regulation, earnings path) before sizing; cheap vs **history** ≠ automatic buy.\n` : ''}

---

## What to do

| Capital | Action |
|---------|--------|
| Legacy holder | ${legacyAction} |
| Fresh / surplus | ${freshAction} |
${disciplineNote}

---

## Scorecard

| Check | Verdict |
|-------|---------|
| CAGR | ${analysis.overview.cagrVerdict} |
| P/E | ${analysis.overview.peVerdict} |
| Earnings | ${analysis.overview.earningsQualityVerdict} |
| Margin | ${analysis.overview.marginVerdict} |
| Business quality | ${analysis.overview.businessQualityVerdict} |
| Risk | ${scorecardRisk} |

${declineBlock}

---

## Quotes

${quotes.join('\n\n')}

---

## Triggers

**Next review:** ${nextReview}

*Not investment advice.*
`;
}

function enrichBusinessQualityReading(
  moduleVerdict: string,
  score: number,
  faq: string | null,
  summary: string | null
): string {
  const sector = summary?.match(/\*\*Sector:\*\*\s*([^\n]+)/)?.[1]?.trim();
  const opsSnap =
    summary?.match(/PAT \+[\d.]+%;\s*cig \+[\d.]+%/i)?.[0] ??
    faq?.match(/cig rev \+[\d.]+% YoY/i)?.[0];
  if (sector && opsSnap) {
    return `${sector} · Ops check: ${opsSnap} — ${moduleVerdict.split('(')[0]?.trim() ?? moduleVerdict} (score ${score}/10)`;
  }
  const freshRow = summary?.match(/\|\s*\*\*Fresh capital\*\*[^\|]*\|\s*([^|]+)\|/i)?.[1]?.trim();
  if (freshRow && score <= 7) {
    return `${moduleVerdict.split('—')[0]?.trim() ?? moduleVerdict} — StockBook fresh lens: ${freshRow} (score ${score}/10)`;
  }
  return `${moduleVerdict} (score ${score}/10)`;
}

function extractFreshCapitalFraming(
  summary: string | null,
  discipline: DisciplineRule | null
): string {
  const freshRow = summary?.match(/\|\s*\*\*Fresh capital\*\*[^\|]*\|\s*([^|]+)\|/i)?.[1]?.trim();
  if (freshRow) {
    return `\n**Fresh-capital lens:** ${freshRow}\n`;
  }
  if (discipline && discipline.surplusPct === 0) {
    return `\n**Fresh-capital lens:** **0% surplus rank** — ${discipline.reason}\n`;
  }
  return '';
}

function extractNextReviewFromStockbook(faq: string | null, summary: string | null): string | null {
  const fromFaq =
    faq?.match(/\*\*Next refresh:\*\*([^\n]+)/i)?.[1]?.trim() ??
    faq?.match(/\*\*Refresh:\*\*([^\n]+)/i)?.[1]?.trim();
  if (fromFaq) return fromFaq;
  const fromSummary = summary?.match(/\*\*Refresh:\*\*([^\n]+)/i)?.[1]?.trim();
  return fromSummary ?? null;
}

function extractCoreProblemBlurb(faq: string | null): string {
  const core = extractFaqSection(faq, 'Q3');
  if (!core) return '';
  const para = core.match(/\*\*Core-problem:\*\*([^\n]+)/i);
  if (para) return `\n**Core-problem (summary):** ${para[1].trim()}\n`;
  return '';
}

function pickInvestorQuotes(hasPosition: boolean, hasDiscipline: boolean, gapTone: string): string[] {
  const out: string[] = [];
  out.push(
    '> *"There is almost always a good reason a stock is cheap."*  \n> — **Howard Marks**'
  );
  out.push('> *"Price is what you pay; value is what you get."*  \n> — **Warren Buffett**');
  if (hasDiscipline && hasPosition) {
    out.push(
      '> *"You don\'t have to make money back the same way you lost it."*  \n> — **Howard Marks**'
    );
  } else if (!hasPosition) {
    out.push('> *"Doing nothing is often the right thing to do."*  \n> — **Charlie Munger**');
  } else if (gapTone === 'negative') {
    out.push(
      '> *"There is always something to do. You just need a higher standard before you act."*  \n> — **Charlie Munger** *(attributed)*'
    );
  } else {
    out.push(
      '> *"The stock market is a device for transferring money from the impatient to the patient."*  \n> — **Warren Buffett**'
    );
  }
  return out.slice(0, 4);
}
