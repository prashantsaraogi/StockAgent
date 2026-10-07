/**
 * Ask Agent — full investor-facing stock report (same engine as Stock Analysis Basic).
 */

import {
  generateLiteInvestorReport,
  buildFallbackInvestorReport,
} from './basic-analysis-report';
import { runFullStockCalculatorAnalysis } from './stock-calculator-full';
import { sanitizeUserFacingAnswer } from './investor-report-format';
import type { AgentQueryResult } from './agent/framework-agent';
import type { StockSearchResult } from './stock-search';
import type { LotPersistenceContext } from './holding-lots';

function toAgentResult(
  markdown: string,
  reportMode: 'framework-local' | 'gemini'
): AgentQueryResult {
  const answer = sanitizeUserFacingAnswer(markdown);
  const mode: AgentQueryResult['mode'] = reportMode === 'gemini' ? 'gemini' : 'framework-local';
  return {
    answer,
    mode,
    model: mode === 'gemini' ? process.env.GEMINI_MODEL ?? 'gemini-2.0-flash' : undefined,
  };
}

export async function runAskAgentStockAnalysis(
  tenantId: string,
  stock: StockSearchResult,
  portfolioLotContext?: LotPersistenceContext
): Promise<AgentQueryResult> {
  const errors: string[] = [];

  try {
    const lite = await generateLiteInvestorReport(tenantId, stock, portfolioLotContext);
    if (lite?.markdown?.trim()) {
      return toAgentResult(lite.markdown, lite.reportMode);
    }
    errors.push('lite report empty');
  } catch (e) {
    errors.push(`lite: ${e instanceof Error ? e.message : 'failed'}`);
  }

  try {
    const full = await runFullStockCalculatorAnalysis({
      ticker: stock.ticker,
      tenantId,
      peBasis: 'ttm',
      expectedCagrPct: 12,
      years: 5,
      basicAnalysis: true,
      portfolioLotContext,
    });
    const md = full?.frameworkReport?.markdown;
    const reportMode = full?.frameworkReport?.reportMode ?? 'framework-local';
    if (md?.trim()) {
      return toAgentResult(md, reportMode);
    }
    errors.push('full report empty');
  } catch (e) {
    errors.push(`full: ${e instanceof Error ? e.message : 'failed'}`);
  }

  const fallback = await buildFallbackInvestorReport(
    tenantId,
    stock,
    portfolioLotContext,
    errors.join(' · ')
  );
  return toAgentResult(fallback.markdown, fallback.reportMode);
}
