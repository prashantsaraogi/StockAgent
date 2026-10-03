/**
 * Basic Analysis — unified framework narrative (chat-style) for Stock Analysis tab.
 * Uses module outputs + StockBook excerpts + portfolio holdings + personal discipline.
 */

import { readStockTabContent } from './content';
import { getStockbookByTicker } from './stockbook-index';
import { parseHoldingsTable, type HoldingRow } from './holdings';
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
      '> *"Don\'t average down on a losing position unless the thesis has improved — not because the price fell."*  \n> — **Framework synthesis**'
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

  const summary =
    summaryFile?.content ?? getBundledSummaryMd(ticker) ?? null;
  const faq = faqFile?.content ?? getBundledFaqMd(ticker) ?? null;
  const approach =
    approachFile?.content ?? getBundledApproachMd(ticker) ?? null;
  const detail = detailFile?.content ?? null;

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
    ? `### Personal discipline (mandatory)

| Field | Value |
|-------|--------|
| Surplus rank | **${discipline.surplusPct}%** |
| Legacy | ${discipline.legacyAction} |
| Fresh / surplus | ${discipline.surplusAction} |
| Why | ${discipline.reason} |

*Source: \`investor-wisdom/personal-discipline.md\` (web rules).*`
    : '*Ticker not in pause / structural buckets — still run buy-decision-workflow before ADD.*';

  const pcclBlock =
    pcclApplied != null
      ? `| Rational / StockBook PCCL anchor | ${pcclBase != null ? formatInr(pcclBase) : '—'} |
| **Applied PCCL** (loss-book floor) | **${formatInr(pcclApplied)}** |
| CMP (${cmpSource}) | ${cmp != null ? formatInr(cmp) : '—'} |
| Premium to Applied PCCL | ${premiumPccl != null ? `${formatPct(premiumPccl)}` : '—'} |`
      : `| CMP | ${cmp != null ? formatInr(cmp) : '—'} |
| PCCL | *Not parsed — open StockBook \`detail-analysis.md\` or refresh PARAMETERS* |
| TTM P/E | ${pe.ttmPe ?? '—'}× |
| 10Y avg P/E | ${pe.avg10yPe ?? '—'}× |`;

  return `# Framework report — ${analysis.stockName} (${analysis.ticker})

**Sector:** ${analysis.sector} · **Date:** ${date}  
**Mode:** Basic Analysis (6 modules + framework narrative)

> **One-line:** ${oneLine}

---

## Framework lens

Applied in this run (same precedence as Ask Agent):

1. **StockBook read order** — summary → faq → approach → PARAMETERS (excerpts below when available)
2. **Six calculator modules** — CAGR gap · P/E · earnings quality · margin · business quality · risk decision
3. **Personal discipline** — pause registry & structural buckets override generic "SIP everywhere"
4. **PCCL dual anchor** — StockBook pessimistic anchor; **Applied PCCL = max(Base, CMP)** on underwater legacy book
5. **Evidence labels** — FACT (live CMP, module scores) vs ASSUMPTION (your ${analysis.inputs.expectedCagrPct}% CAGR) vs StockBook narrative

**Binding:** \`stock-agent.mdc\` · \`buy-decision-workflow.md\` · \`personal-discipline.md\`

---

## Your position

${positionBlock}

---

## Context used

| Layer | Status |
|-------|--------|
| StockBook summary | ${ctx.summaryExcerpt ? 'Loaded' : 'Missing / bundled unavailable'} |
| StockBook approach | ${ctx.approachExcerpt ? 'Loaded' : 'Missing'} |
| PARAMETERS | ${pe.parametersFile ?? getBundledParametersMd(analysis.ticker) ? 'Loaded' : 'Missing'} |
| Live CMP | ${cmpSource} |
| Portfolio holdings | ${holding ? 'Matched ticker' : 'Not held or not imported'} |
| Risk decision file | ${risk.riskDecisionFile ?? 'Module synthesis'} |

${ctx.summaryExcerpt ? `\n### Summary excerpt\n\n${ctx.summaryExcerpt}\n` : ''}
${detailExcerpt ? `\n### Valuation / PCCL excerpt (detail)\n\n${detailExcerpt}\n` : ''}

---

## Business quality vs governance

| Lens | Signal | Source |
|------|--------|--------|
| Business quality module | ${bq.verdict} | Stock Analysis tab |
| Moat / quality score | ${bq.businessQualityScore10}/10 | BUSINESS_QUALITY file |
| Earnings quality | ${analysis.earningsQuality.overallVerdict} | Earnings Quality tab |
| Margin trend | ${analysis.margin.overallVerdict} | Margin tab |
| Risk & decision | ${risk.investmentVerdict} | RISK_DECISION synthesis |

**Governance / integrity:** Treat separately from franchise quality. ${risk.concerns.slice(0, 2).join(' · ') || 'See Risk tab for factor register.'}

---

## Valuation & PCCL

${pcclBlock}

**CAGR gap (your ${analysis.inputs.expectedCagrPct}% vs framework possible band):** ${c.cagrGap.cagrGapPp != null ? `${c.cagrGap.cagrGapPp} pp` : 'n/a'} — ${c.frameworkVerdict ?? c.impliedVerdict}

---

## Module verdicts (synthesis)

| Module | Verdict |
|--------|---------|
| CAGR | ${analysis.overview.cagrVerdict} |
| P/E | ${analysis.overview.peVerdict} |
| Earnings Quality | ${analysis.overview.earningsQualityVerdict} |
| Margin | ${analysis.overview.marginVerdict} |
| Business Quality | ${analysis.overview.businessQualityVerdict} |
| Risk & Decision | ${analysis.overview.riskVerdict} |

---

## Core-problem test

${risk.narrativeSummary ? clip(risk.narrativeSummary, 900) : '*Run Ask Agent or refresh StockBook `detail-analysis.md` for explicit "why cheap" drivers.*'}

**Thesis breakers to watch:** ${risk.thesisBreakers.slice(0, 3).map((t) => t.text).join(' · ') || '—'}

---

## Actions (framework)

| Capital type | Action |
|--------------|--------|
| Legacy holder | ${discipline ? discipline.legacyAction : holding ? 'Default **HOLD** — long-term mandate (no TRIM for valuation alone)' : '—'} |
| Fresh / salary surplus | ${discipline ? discipline.surplusAction : premiumPccl != null && premiumPccl > 0 ? 'Rank vs portfolio PCCL gaps — prefer better margin-of-safety names' : 'Staged starter only if catalyst + PCCL pass'} |

${disciplineBlock}

---

## Analysis

${risk.thesis.whyOwn ? `**Why own (thesis):** ${clip(risk.thesis.whyOwn, 500)}` : ''}

${risk.thesis.whyNotAggressive ? `**Why not aggressive add:** ${clip(risk.thesis.whyNotAggressive, 500)}` : ''}

Module-linked CAGR report excerpt: ${c.report ? '*See CAGR module tab for full projection tables.*' : '*CAGR narrative in module tab.*'}

*Labels: CMP and module scores = **FACT** where sourced live; expected CAGR = **YOUR ASSUMPTION**; StockBook excerpts = **FACT** from saved files; forward paths = **HYPOTHESIS**.*

---

## Verdict

**${oneLine}**

| Audience | Guidance |
|----------|----------|
| Existing holder | ${discipline?.legacyAction ?? 'HOLD · size-capped adds only if MoS + workflow pass'} |
| Fresh capital | ${discipline?.surplusAction ?? (analysis.riskDecision.notScreamingBuy ? 'WAIT / WATCHLIST — confirm PCCL + sector rank' : 'STAGED STARTER OK — cap ≤2% book until proof')} |

**Next review:** ${risk.thesis.nextReview || 'After quarterly results + material news'}

---

## Quotes lens

${quotes.join('\n\n')}

---

*Generated by Stock Analysis · Basic mode. Not investment advice. For deeper live news / §22 price-decline, use Ask Agent or refresh StockBook in Cursor.*
`;
}

export async function generateBasicFrameworkReport(
  analysis: StockCalculatorFullResult,
  tenantId: string
): Promise<BasicFrameworkReport> {
  const loc = await getStockbookByTicker(analysis.ticker);
  const sector = loc?.sector ?? analysis.sector;
  const stockName = loc?.stock ?? analysis.stockName;

  const [holdings, stockMd] = await Promise.all([
    parseHoldingsTable(tenantId),
    loadStockbookMd(analysis.ticker, sector, stockName, tenantId),
  ]);

  const holding = holdings.find((h) => h.ticker === analysis.ticker.toUpperCase()) ?? null;
  const cmp = analysis.peParameters.cmp ?? analysis.riskDecision.cmp ?? analysis.cagr.snapshot.cmp;
  const cmpSource = analysis.peParameters.cmpSource ?? analysis.riskDecision.cmpSource;

  const pcclSource =
    stockMd.detail ?? stockMd.summary ?? getBundledParametersMd(analysis.ticker);
  const pcclBase = extractPcclAnchor(pcclSource);
  const pcclApplied = appliedPccl(pcclBase, cmp, holding);
  const premiumPccl = premiumToPcclPct(cmp, pcclApplied);

  const discipline = getDisciplineRule(analysis.ticker);
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
    const system = `You are the India Stock Investment Framework assistant. Refine ONLY the "## Analysis" section of a Basic Analysis report. Never change numbers, tables outside Analysis, or verdict. Use FACT/ASSUMPTION labels. No generic disclaimers.`;
    const userPrompt = `Ticker ${analysis.ticker}. One-line verdict: ${oneLine}. Improve Analysis (3-5 short paragraphs): separate business quality vs governance, PCCL/surplus discipline, module conflicts. Return ONLY markdown paragraphs (no ## heading).`;

    const gemini = await generateGeminiText(system, userPrompt);
    if (gemini && gemini.trim().length > 120) {
      markdown = markdown.replace(
        /## Analysis[\s\S]*?(?=## Verdict)/,
        `## Analysis\n\n${gemini.trim()}\n\n`
      );
      reportMode = 'gemini';
    }
  } catch {
    /* keep deterministic */
  }

  return { markdown, oneLineVerdict: oneLine, reportMode };
}
