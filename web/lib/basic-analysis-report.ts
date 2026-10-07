/**
 * Basic Analysis — investor narrative for Ask Agent + Stock Analysis (Basic mode).
 */

import { readStockTabContent } from './content';
import { getStockbookByTicker } from './stockbook-index';
import type { LotPersistenceContext } from './holding-lots';
import {
  getUserHoldingForTicker,
  stripAuthorPositionFromMarkdown,
} from './portfolio-holdings';
import { buildStockbookReportContext } from './stock-calculator-report';
import { getBundledParametersMd } from './load-bundled-stockbook';
import {
  getBundledSummaryMd,
  getBundledFaqMd,
  getBundledApproachMd,
} from './load-bundled-stockbook-tabs';
import { getDisciplineRule } from './investor-discipline-web';
import type { StockCalculatorFullResult } from './stock-calculator-full';
import { runStockCalculator } from './stock-calculator-engine';
import { loadPeEvaluation } from './pe-evaluation';
import type { StockSearchResult } from './stock-search';
import {
  appliedPccl,
  buildInvestorStockReportMarkdown,
  deriveInvestorOneLine,
  extractFaqSection,
  extractPcclAnchor,
  premiumToPcclPct,
} from './investor-stock-report';

export interface BasicFrameworkReport {
  markdown: string;
  oneLineVerdict: string;
  reportMode: 'framework-local' | 'gemini';
}

async function loadStockbookMd(
  ticker: string,
  sector: string,
  stockName: string,
  tenantId: string
) {
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

  const cmp =
    analysis.peParameters.cmp ??
    analysis.riskDecision.cmp ??
    analysis.cagr.snapshot.cmp;
  const cmpSource =
    analysis.peParameters.cmpSource ?? analysis.riskDecision.cmpSource ?? 'PARAMETERS';

  const pcclSource =
    stockMd.detail ??
    stockMd.summary ??
    stockMd.faq ??
    getBundledParametersMd(analysis.ticker);
  const pcclBase = extractPcclAnchor(pcclSource);
  const pcclApplied = appliedPccl(pcclBase, cmp, holding);
  const premiumPccl = premiumToPcclPct(cmp, pcclApplied);

  const discipline = getDisciplineRule(analysis.ticker, { hasPosition: holding != null });
  const oneLine = deriveInvestorOneLine(analysis, discipline, holding, premiumPccl);

  const declineSection =
    extractFaqSection(stockMd.faq, 'Q3') ??
    extractFaqSection(stockMd.faq, 'Why did the stock fall');

  const markdown = buildInvestorStockReportMarkdown({
    analysis,
    holding,
    cmp,
    cmpSource,
    pcclBase,
    pcclApplied,
    premiumPccl,
    discipline,
    oneLine,
    faq: stockMd.faq,
    summaryMd: stockMd.summary,
    declineSection,
  });

  return { markdown, oneLineVerdict: oneLine, reportMode: 'framework-local' };
}

/** When a module fails on serverless, still produce the structured investor report. */
export async function generateLiteInvestorReport(
  tenantId: string,
  stock: StockSearchResult,
  lotCtx?: LotPersistenceContext
): Promise<BasicFrameworkReport | null> {
  let cagr: Awaited<ReturnType<typeof runStockCalculator>> | null = null;
  try {
    cagr = await runStockCalculator({
      stockQuery: stock.ticker,
      ticker: stock.ticker,
      peBasis: 'ttm',
      expectedCagrPct: 12,
      years: 5,
      basicAnalysis: true,
    });
  } catch {
    cagr = null;
  }

  const pe = await loadPeEvaluation(stock.ticker, tenantId);
  if (!cagr || !pe) return null;

  const analysis = await buildMinimalFullResult(stock, cagr, pe);
  return generateBasicFrameworkReport(analysis, tenantId, lotCtx);
}

/** Last resort when live quote + modules fail (common on Vercel without NSE). */
export async function buildFallbackInvestorReport(
  tenantId: string,
  stock: StockSearchResult,
  lotCtx?: LotPersistenceContext,
  diagnostic?: string
): Promise<BasicFrameworkReport> {
  const loc = await getStockbookByTicker(stock.ticker);
  const sector = loc?.sector ?? stock.sector;
  const stockName = loc?.stock ?? stock.company;
  const [holding, stockMd] = await Promise.all([
    getUserHoldingForTicker(tenantId, stock.ticker, lotCtx),
    loadStockbookMd(stock.ticker, sector, stockName, tenantId),
  ]);

  const { fetchLiveNseCmp } = await import('./nse-cmp');
  const live = await fetchLiveNseCmp(stock.ticker);
  const date = new Date().toISOString().slice(0, 10);

  const summarySnippet = stockMd.summary
    ? stockMd.summary.slice(0, 2200).trim() + (stockMd.summary.length > 2200 ? '\n\n…' : '')
    : '*No bundled summary for this ticker yet — add StockBook files or run sync-bundled-docs at build.*';

  const cmpLine =
    live?.price != null
      ? `**CMP:** ₹${live.price.toLocaleString('en-IN')} (${live.source})`
      : '**CMP:** UNVERIFIED — NSE/Yahoo blocked or timed out from this server';

  const positionLine = holding
    ? `You hold **${holding.qty}** sh @ avg **₹${holding.avgCost.toLocaleString('en-IN')}** (cost **₹${holding.costBasis.toLocaleString('en-IN')}**).`
    : 'Not in your web portfolio lots — **fresh-entry lens**.';

  const diag =
    diagnostic && diagnostic.length > 0
      ? `\n\n*Server note:* ${diagnostic.slice(0, 280).replace(/\n/g, ' ')}`
      : '';

  const markdown = `# ${stockName} (${stock.ticker}) — Investment view

**Date checked:** ${date}  
${cmpLine}

> **One-line:** **WATCHLIST** — partial data; use StockBook summary below and retry live analysis when quotes load.

---

## Summary

${summarySnippet}

## Your position

${positionLine}

## What to do

| Lens | Action |
|------|--------|
| Legacy / holder | **HOLD** — refresh after quarterly results unless StockBook says PAUSE |
| Fresh surplus | **WAIT** — confirm PCCL and sector rank when CMP loads |

- Retry **Analyze stock** in a minute (market hours help Yahoo/NSE).
- Open **Stock Analysis → Basic** for full modules.
${diag}

*Not investment advice.*`;

  return {
    markdown,
    oneLineVerdict: 'WATCHLIST — partial data; retry live analysis',
    reportMode: 'framework-local',
  };
}

async function buildMinimalFullResult(
  stock: StockSearchResult,
  cagr: NonNullable<Awaited<ReturnType<typeof runStockCalculator>>>,
  pe: NonNullable<Awaited<ReturnType<typeof loadPeEvaluation>>>
): Promise<StockCalculatorFullResult> {
  const verdict = '🟡 WATCHLIST — run full modules in Stock Analysis for detail';
  return {
    ticker: stock.ticker,
    stockName: stock.company,
    sector: stock.sector,
    analyzedAt: new Date().toISOString(),
    basicAnalysis: true,
    inputs: {
      peBasis: 'ttm',
      expectedCagrPct: 12,
      years: 5,
      manualPeOverride: null,
      investmentAmountInr: null,
      purchasePrice: null,
      purchaseDate: null,
    },
    cagr,
    peScorecard: null,
    peParameters: pe,
    earningsQuality: {
      overallVerdict: verdict,
    } as unknown as StockCalculatorFullResult['earningsQuality'],
    margin: { overallVerdict: verdict } as unknown as StockCalculatorFullResult['margin'],
    businessQuality: {
      verdict,
      businessQualityScore10: 0,
    } as unknown as StockCalculatorFullResult['businessQuality'],
    riskDecision: {
      cmp: pe.cmp,
      cmpSource: pe.cmpSource,
      investmentVerdict: verdict,
      verdictTone: 'wait',
      notScreamingBuy: true,
      concerns: [],
      thesis: {
        whyOwn: '',
        whyNotAggressive: '',
        nextReview: 'After quarterly results',
        riskLabel: 'See StockBook FAQ',
      },
      narrativeSummary: '',
      thesisBreakers: [],
    } as unknown as StockCalculatorFullResult['riskDecision'],
    overview: {
      cagrVerdict: cagr.frameworkVerdict ?? cagr.impliedVerdict,
      peVerdict: verdict,
      earningsQualityVerdict: verdict,
      marginVerdict: verdict,
      businessQualityVerdict: verdict,
      riskVerdict: verdict,
    },
  };
}

export { toInvestorFacingReport } from './investor-report-format';
