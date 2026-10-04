/**
 * Basic Analysis — unified framework narrative (chat-style) for Stock Analysis tab.
 * Uses module outputs + StockBook excerpts + portfolio holdings + personal discipline.
 */

import { readStockTabContent } from './content';
import { getStockbookByTicker } from './stockbook-index';
import type { HoldingRow } from './holdings';
import type { LotPersistenceContext } from './holding-lots';
import {
  getUserHoldingForTicker,
  stripAuthorPositionFromMarkdown,
} from './portfolio-holdings';
import {
  buildStockbookReportContext,
  type StockbookReportContext,
} from './stock-calculator-report';
import { getBundledParametersMd } from './load-bundled-stockbook';
import {
  getBundledSummaryMd,
  getBundledFaqMd,
  getBundledApproachMd,
} from './load-bundled-stockbook-tabs';
import { getDisciplineRule } from './investor-discipline-web';
import { generateGeminiText } from './gemini-text';
import type { StockCalculatorFullResult } from './stock-calculator-full';
import { WISDOM_QUOTES_MARKDOWN } from './bundled/wisdom-quotes.generated';

export interface BasicFrameworkReport {
  markdown: string;
  oneLineVerdict: string;
  reportMode: 'framework-local' | 'gemini';
}

function clip(text: string, max = 1200): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + '\n\n… [truncated]';
}

function formatInr(n: number): string {
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

function formatPct(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}

function extractPcclAnchor(md: string | null): number | null {
  if (!md) return null;
  const anchor = md.match(/\*\*PCCL anchor\*\*[^|]*\|\s*[^|]*\|\s*[^|]*\|\s*\*\*₹([\d,]+)\*\*/i);
  if (anchor) return parseFloat(anchor[1].replace(/,/g, ''));
  const range = md.match(/PCCL[^₹]*₹([\d,]+)\s*[–-]\s*₹([\d,]+)/i);
  if (range) {
    const lo = parseFloat(range[1].replace(/,/g, ''));
    const hi = parseFloat(range[2].replace(/,/g, ''));
    return Math.round((lo + hi) / 2);
  }
  const single = md.match(/\*\*PCCL[^*]*\*\*[^₹]*₹([\d,]+)/i);
  if (single) return parseFloat(single[1].replace(/,/g, ''));
  return null;
}

function appliedPccl(base: number | null, cmp: number | null, holding: HoldingRow | null): number | null {
  if (base == null) return null;
  if (!holding || cmp == null) return base;
  if (cmp < holding.avgCost) return cmp;
  return base;
}

function premiumToPcclPct(cmp: number | null, pccl: number | null): number | null {
  if (cmp == null || pccl == null || pccl <= 0) return null;
  return Math.round(((cmp - pccl) / pccl) * 1000) / 10;
}

function pickQuotesForVerdict(
  disciplineQuote: string | undefined,
  gapTone: string,
  pauseAdds: boolean
): string[] {
  const out: string[] = [];

  if (disciplineQuote) {
    out.push(`> *"${disciplineQuote.split('—')[0]?.trim().replace(/^"/, '')}"*  \n> — **${disciplineQuote.split('—').pop()?.trim() ?? 'Discipline'}**`);
  }

  const wisdom = WISDOM_QUOTES_MARKDOWN;
  const snippets = [
    wisdom.match(/>\s*\*"([^"]+)"\*\s*[\s\S]*?—\s*\*\*([^*]+)\*\*/g)?.slice(0, 12) ?? [],
  ].flat();

  if (pauseAdds) {
    out.push(
      '> *"You don\'t have to make money back the same way you lost it."*  \n> — **Howard Marks**'
    );
    out.push(
      '> *"Don\'t average down on a losing position unless the thesis has improved — not because the price fell."*  \n> — **Discipline note**'
    );
  } else if (gapTone === 'negative') {
    out.push(
      '> *"Price is what you pay; value is what you get."*  \n> — **Warren Buffett**'
    );
    out.push(
      '> *"There is always something to do. You just need a higher standard before you act."*  \n> — **Charlie Munger** *(attributed)*'
    );
  } else {
    out.push(
      '> *"The stock market is a device for transferring money from the impatient to the patient."*  \n> — **Warren Buffett**'
    );
    if (snippets[0]) out.push(snippets[0]);
    else {
      out.push(
        '> *"Time is your friend; impulse is your enemy."*  \n> — **John Bogle**'
      );
    }
  }

  return out.slice(0, 3);
}

function deriveOneLineVerdict(
  analysis: StockCalculatorFullResult,
  discipline: ReturnType<typeof getDisciplineRule>,
  holding: HoldingRow | null,
  premiumPccl: number | null
): string {
  const risk = analysis.riskDecision.investmentVerdict;
  if (discipline && discipline.surplusPct === 0) {
    const leg = holding ? 'HOLD legacy · ' : '';
    return `${leg}PAUSE surplus adds (0% rank) — ${discipline.reason.split('(')[0]?.trim()}`;
  }
  if (analysis.riskDecision.verdictTone === 'avoid') {
    return `AVOID fresh capital — ${analysis.riskDecision.thesis.riskLabel}`;
  }
  if (premiumPccl != null && premiumPccl > 25 && !holding) {
    return 'WAIT / WATCHLIST — premium to PCCL elevated for fresh entry';
  }
  if (holding && premiumPccl != null && premiumPccl > 15) {
    return 'HOLD legacy · token / size-capped adds only above Applied PCCL';
  }
  if (analysis.cagr.frameworkVerdict?.includes('WAIT')) {
    return analysis.cagr.frameworkVerdict;
  }
  return risk.replace(/^[^\w]+/, '').slice(0, 120) || 'HOLD — run buy-decision-workflow before deploying surplus';
}

async function loadStockbookMd(
  ticker: string,
  sector: string,
  stockName: string,
  tenantId: string
): Promise<{
  summary: string | null;
  faq: string | null;
  approach: string | null;
  detail: string | null;
  ctx: StockbookReportContext;
}> {
  const [summaryFile, faqFile, approachFile, detailFile] = await Promise.all([
    readStockTabContent(sector, stockName, 'summary', tenantId),
    readStockTabContent(sector, stockName, 'faq', tenantId),
    readStockTabContent(sector, stockName, 'approach', tenantId),
    readStockTabContent(sector, stockName, 'detail', tenantId),
  ]);

  const rawSummary =
    summaryFile?.content ?? getBundledSummaryMd(ticker) ?? null;
  const rawFaq = faqFile?.content ?? getBundledFaqMd(ticker) ?? null;
  const rawApproach =
    approachFile?.content ?? getBundledApproachMd(ticker) ?? null;
  const rawDetail = detailFile?.content ?? null;

  const summary = rawSummary ? stripAuthorPositionFromMarkdown(rawSummary) : null;
  const faq = rawFaq ? stripAuthorPositionFromMarkdown(rawFaq) : null;
  const approach = rawApproach ? stripAuthorPositionFromMarkdown(rawApproach) : null;
  const detail = rawDetail ? stripAuthorPositionFromMarkdown(rawDetail) : null;

  const ctx = buildStockbookReportContext(summary, approach, faq);
  return { summary, faq, approach, detail, ctx };
}

function buildDeterministicMarkdown(input: {
  analysis: StockCalculatorFullResult;
  holding: HoldingRow | null;
  cmp: number | null;
  cmpSource: string;
  pcclBase: number | null;
  pcclApplied: number | null;
  premiumPccl: number | null;
  discipline: ReturnType<typeof getDisciplineRule>;
  ctx: StockbookReportContext;
  detailExcerpt: string | null;
  oneLine: string;
}): string {
  const { analysis, holding, cmp, cmpSource, pcclBase, pcclApplied, premiumPccl, discipline, ctx, detailExcerpt, oneLine } =
    input;
  const c = analysis.cagr;
  const pe = analysis.peParameters;
  const bq = analysis.businessQuality;
  const risk = analysis.riskDecision;
  const date = analysis.analyzedAt.slice(0, 10);
  const gapTone = c.cagrGap.gapTone;
  const quotes = pickQuotesForVerdict(discipline?.quote, gapTone, discipline != null);

  const positionBlock = holding
    ? `| Qty | Avg cost | Cost basis | Unrealized vs CMP |
|----:|---------:|-----------:|-------------------|
| ${holding.qty} | ${formatInr(holding.avgCost)} | ${formatInr(holding.costBasis)} | ${cmp != null ? (cmp >= holding.avgCost ? 'Gain' : '**Loss (Applied PCCL floor may apply)**') : 'UNVERIFIED CMP'} |`
    : '*No position in imported portfolio — analysis uses **fresh capital** lens.*';

  const disciplineBlock = discipline
    ? `| Surplus rank | **${discipline.surplusPct}%** |
| Legacy holder | ${discipline.legacyAction} |
| Fresh / surplus | ${discipline.surplusAction} |
| Note | ${discipline.reason} |`
    : '';

  const pcclBlock =
    pcclApplied != null
      ? `| Rational / StockBook PCCL anchor | ${pcclBase != null ? formatInr(pcclBase) : '—'} |
| **Applied PCCL** (loss-book floor) | **${formatInr(pcclApplied)}** |
| CMP (${cmpSource}) | ${cmp != null ? formatInr(cmp) : '—'} |
| Premium to Applied PCCL | ${premiumPccl != null ? `${formatPct(premiumPccl)}` : '—'} |`
      : `| CMP | ${cmp != null ? formatInr(cmp) : '—'} |
| PCCL | *Not available — refresh stock parameters* |
| TTM P/E | ${pe.ttmPe ?? '—'}× |
| 10Y avg P/E | ${pe.avg10yPe ?? '—'}× |`;

  const summaryNote = ctx.summaryExcerpt ? clip(ctx.summaryExcerpt, 600) : '';
  const disciplineTable = disciplineBlock
    ? `\n| Personal rules |\n|---|\n${disciplineBlock.split('\n').slice(1).join('\n')}\n`
    : '';

  return `# ${analysis.stockName} (${analysis.ticker}) — Investment view

**Sector:** ${analysis.sector} · **Date checked:** ${date}  
**CMP:** ${cmp != null ? formatInr(cmp) : '—'} (${cmpSource})

> **One-line:** ${oneLine}

---

## Your position

${positionBlock}

---

## Business quality vs risks

| Area | Reading |
|------|---------|
| Business quality | ${bq.verdict} (score ${bq.businessQualityScore10}/10) |
| Earnings quality | ${analysis.earningsQuality.overallVerdict} |
| Margin trend | ${analysis.margin.overallVerdict} |
| Overall risk view | ${risk.investmentVerdict} |

${risk.concerns.length ? `**Key concerns:** ${risk.concerns.slice(0, 3).join(' · ')}` : ''}

${summaryNote ? `${summaryNote}\n` : ''}
${risk.thesis.whyOwn ? `**Why own:** ${clip(risk.thesis.whyOwn, 450)}` : ''}
${risk.thesis.whyNotAggressive ? `\n**Why not add aggressively:** ${clip(risk.thesis.whyNotAggressive, 450)}` : ''}

---

## Valuation & PCCL

${pcclBlock}

**Growth vs your ${analysis.inputs.expectedCagrPct}% CAGR assumption:** ${c.cagrGap.cagrGapPp != null ? `${c.cagrGap.cagrGapPp} pp gap` : 'n/a'} — ${c.frameworkVerdict ?? c.impliedVerdict}

${detailExcerpt ? `\n${detailExcerpt}\n` : ''}

---

## What to do

| Capital | Action |
|---------|--------|
| Legacy holder | ${holding ? (discipline ? discipline.legacyAction : '**HOLD** — no trim for valuation alone') : '**Not in your portfolio** — fresh-capital lens only'} |
| Fresh / surplus | ${discipline ? discipline.surplusAction : analysis.riskDecision.notScreamingBuy ? '**WAIT / WATCHLIST** — confirm PCCL and sector rank' : '**STAGED STARTER OK** — small size until proof'} |
${disciplineTable}

---

## Scorecard

| Check | Verdict |
|-------|---------|
| CAGR | ${analysis.overview.cagrVerdict} |
| P/E | ${analysis.overview.peVerdict} |
| Earnings | ${analysis.overview.earningsQualityVerdict} |
| Margin | ${analysis.overview.marginVerdict} |
| Business quality | ${analysis.overview.businessQualityVerdict} |
| Risk | ${analysis.overview.riskVerdict} |

---

## Why cheap / core problem

${risk.narrativeSummary ? clip(risk.narrativeSummary, 900) : '*See Risk section in Stock Analysis for detail.*'}

**Watch:** ${risk.thesisBreakers.slice(0, 3).map((t) => t.text).join(' · ') || '—'}

---

## Quotes

${quotes.join('\n\n')}

---

## Triggers

**Next review:** ${risk.thesis.nextReview || 'After quarterly results and material news'}

*Not investment advice.*
`;
}

export async function generateBasicFrameworkReport(
  analysis: StockCalculatorFullResult,
  tenantId: string,
  lotCtx?: LotPersistenceContext
): Promise<BasicFrameworkReport> {
  const loc = await getStockbookByTicker(analysis.ticker);
  const sector = loc?.sector ?? analysis.sector;
  const stockName = loc?.stock ?? analysis.stockName;

  const [holding, stockMd] = await Promise.all([
    getUserHoldingForTicker(tenantId, analysis.ticker, lotCtx),
    loadStockbookMd(analysis.ticker, sector, stockName, tenantId),
  ]);
  const cmp = analysis.peParameters.cmp ?? analysis.riskDecision.cmp ?? analysis.cagr.snapshot.cmp;
  const cmpSource = analysis.peParameters.cmpSource ?? analysis.riskDecision.cmpSource;

  const pcclSource =
    stockMd.detail ?? stockMd.summary ?? getBundledParametersMd(analysis.ticker);
  const pcclBase = extractPcclAnchor(pcclSource);
  const pcclApplied = appliedPccl(pcclBase, cmp, holding);
  const premiumPccl = premiumToPcclPct(cmp, pcclApplied);

  const discipline = getDisciplineRule(analysis.ticker, { hasPosition: holding != null });
  const oneLine = deriveOneLineVerdict(analysis, discipline, holding, premiumPccl);

  const detailExcerpt = stockMd.detail
    ? clip(
        stockMd.detail
          .split('## 5. Valuation')[1]
          ?.split('## 6.')[0]
          ?.trim() ??
          stockMd.detail.slice(0, 1200),
        1000
      )
    : null;

  let markdown = buildDeterministicMarkdown({
    analysis,
    holding,
    cmp,
    cmpSource,
    pcclBase,
    pcclApplied,
    premiumPccl,
    discipline,
    ctx: stockMd.ctx,
    detailExcerpt,
    oneLine,
  });

  let reportMode: BasicFrameworkReport['reportMode'] = 'framework-local';

  try {
    const system = `You are an India equity analyst writing for a long-term investor. Refine ONLY the "## Business quality vs risks" section. Never change numbers elsewhere or the one-line verdict. No file paths or methodology jargon.`;
    const userPrompt = `Ticker ${analysis.ticker}. One-line: ${oneLine}. Rewrite Business quality vs risks (3-4 short paragraphs + keep the table). Plain language.`;

    const gemini = await generateGeminiText(system, userPrompt);
    if (gemini && gemini.trim().length > 120) {
      markdown = markdown.replace(
        /## Business quality vs risks[\s\S]*?(?=## Valuation)/,
        `## Business quality vs risks\n\n${gemini.trim()}\n\n`
      );
      reportMode = 'gemini';
    }
  } catch {
    /* keep deterministic */
  }

  return { markdown, oneLineVerdict: oneLine, reportMode };
}

export { toInvestorFacingReport } from './investor-report-format';
