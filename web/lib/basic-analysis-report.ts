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
  const [cagr, pe] = await Promise.all([
    runStockCalculator({
      stockQuery: stock.ticker,
      ticker: stock.ticker,
      peBasis: 'ttm',
      expectedCagrPct: 12,
      years: 5,
      basicAnalysis: true,
    }),
    loadPeEvaluation(stock.ticker, tenantId),
  ]);

  if (!cagr || !pe) return null;

  const analysis = await buildMinimalFullResult(stock, cagr, pe);
  return generateBasicFrameworkReport(analysis, tenantId, lotCtx);
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
