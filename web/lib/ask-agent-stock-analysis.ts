/**
 * Ask Agent — full investor-facing stock report (same engine as Stock Analysis Basic).
 */

import { runFullStockCalculatorAnalysis } from './stock-calculator-full';
import { generateLiteInvestorReport } from './basic-analysis-report';
import { sanitizeUserFacingAnswer } from './investor-report-format';
import type { AgentQueryResult } from './agent/framework-agent';
import type { StockSearchResult } from './stock-search';
import type { LotPersistenceContext } from './holding-lots';

export async function runAskAgentStockAnalysis(
  tenantId: string,
  stock: StockSearchResult,
  portfolioLotContext?: LotPersistenceContext
): Promise<AgentQueryResult | null> {
  const full = await runFullStockCalculatorAnalysis({
    ticker: stock.ticker,
    tenantId,
    peBasis: 'ttm',
    expectedCagrPct: 12,
    years: 5,
    basicAnalysis: true,
    portfolioLotContext,
  });

  let report = full?.frameworkReport ?? null;

  if (!report?.markdown) {
    report = await generateLiteInvestorReport(tenantId, stock, portfolioLotContext);
  }

  if (!report?.markdown) return null;

  const answer = sanitizeUserFacingAnswer(report.markdown);
  const mode: AgentQueryResult['mode'] =
    report.reportMode === 'gemini' ? 'gemini' : 'framework-local';

  return {
    answer,
    mode,
    model: mode === 'gemini' ? process.env.GEMINI_MODEL ?? 'gemini-2.0-flash' : undefined,
  };
}
