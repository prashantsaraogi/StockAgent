import { refreshAllSectorOutlookMcaps } from './sector-mcap-refresh';
import { refreshPortfolioCmpInStockbook } from './cmp-stockbook-refresh';
import { scanQuarterResults } from './quarterly-results-scan';
import { runNewsFrameworkQuery } from './agent/news-agent';
import { parseHoldingsTable } from './holdings';
import {
  ALL_AUTOMATED_ACTIONS,
  DAILY_AUTOMATED_ACTIONS,
  type AutomatedServiceAction,
} from './market-data-deps';

export interface ServiceStepResult {
  action: string;
  ok: boolean;
  summary: string;
  error?: string;
  details?: unknown;
}

export interface RunPackResult {
  pack: 'daily' | 'all-automated';
  startedAt: string;
  finishedAt: string;
  steps: ServiceStepResult[];
}

async function runSingleAction(
  action: AutomatedServiceAction,
  ctx: { tenantId: string; email: string }
): Promise<ServiceStepResult> {
  try {
    if (action === 'refresh-portfolio-cmp') {
      const rows = await parseHoldingsTable(ctx.tenantId);
      const tickers = rows.map((r) => r.ticker);
      const result = await refreshPortfolioCmpInStockbook(tickers);
      return {
        action,
        ok: result.tickersFailed.length < tickers.length,
        summary: `CMP refreshed for ${result.tickersUpdated}/${result.tickersRequested} holdings · cache ${result.refreshedAt}`,
        details: {
          failed: result.tickersFailed,
          updated: result.tickersUpdated,
        },
      };
    }

    if (action === 'scan-quarter-results') {
      const rows = await parseHoldingsTable(ctx.tenantId);
      const companies = new Map(rows.map((r) => [r.ticker, r.company]));
      const scan = await scanQuarterResults(
        rows.map((r) => r.ticker),
        companies
      );
      return {
        action,
        ok: true,
        summary: `${scan.staleCount}/${scan.items.length} holdings may need ${scan.expectedQuarter} results refresh`,
        details: scan,
      };
    }

    if (action === 'refresh-sector-mcap') {
      const results = await refreshAllSectorOutlookMcaps();
      return {
        action,
        ok: true,
        summary: `Mcap updated for ${results.reduce((n, r) => n + r.tickersUpdated, 0)} tickers across ${results.length} sectors`,
        details: results,
      };
    }

    if (action === 'news-today') {
      const result = await runNewsFrameworkQuery(
        "Run news for today — partial IST window to now. Stock-wise loop all holdings · write today's summary.md.",
        { tenantId: ctx.tenantId, email: ctx.email }
      );
      return {
        action,
        ok: true,
        summary: result.newsDate
          ? `News summary written for ${result.newsDate}`
          : 'News run completed',
        details: { newsWebPath: result.newsWebPath },
      };
    }

    return { action, ok: false, summary: '', error: 'Unknown action' };
  } catch (err) {
    return {
      action,
      ok: false,
      summary: '',
      error: err instanceof Error ? err.message : 'Step failed',
    };
  }
}

export async function runAutomatedPack(
  pack: 'daily' | 'all-automated',
  ctx: { tenantId: string; email: string }
): Promise<RunPackResult> {
  const startedAt = new Date().toISOString();
  const actions =
    pack === 'daily' ? [...DAILY_AUTOMATED_ACTIONS] : [...ALL_AUTOMATED_ACTIONS];
  const steps: ServiceStepResult[] = [];

  for (const action of actions) {
    steps.push(await runSingleAction(action, ctx));
  }

  return {
    pack,
    startedAt,
    finishedAt: new Date().toISOString(),
    steps,
  };
}

export { DAILY_AUTOMATED_ACTIONS, ALL_AUTOMATED_ACTIONS };
