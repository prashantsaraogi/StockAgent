/**
 * Ask Agent — full investor-facing stock report (same engine as Stock Analysis Basic).
 */

import { runFullStockCalculatorAnalysis } from './stock-calculator-full';
import { sanitizeUserFacingAnswer } from './investor-report-format';
import type { AgentQueryResult } from './agent/framework-agent';
import type { StockSearchResult } from './stock-search';

export async function runAskAgentStockAnalysis(
  tenantId: string,
  stock: StockSearchResult
): Promise<AgentQueryResult | null> {
  const full = await runFullStockCalculatorAnalysis({
    ticker: stock.ticker,
    tenantId,
    peBasis: 'ttm',
    expectedCagrPct: 12,
    years: 5,
    basicAnalysis: true,
  });

  if (!full?.frameworkReport?.markdown) return null;

  const answer = sanitizeUserFacingAnswer(full.frameworkReport.markdown);
  const mode: AgentQueryResult['mode'] =
    full.frameworkReport.reportMode === 'gemini' ? 'gemini' : 'framework-local';

  return {
    answer,
    mode,
    model: mode === 'gemini' ? process.env.GEMINI_MODEL ?? 'gemini-2.0-flash' : undefined,
  };
}
