import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { runNewsFrameworkQuery } from '@/lib/agent/news-agent';
import { refreshAllSectorOutlookMcaps } from '@/lib/sector-mcap-refresh';
import { refreshPortfolioCmpInStockbook } from '@/lib/cmp-stockbook-refresh';
import { scanQuarterResults } from '@/lib/quarterly-results-scan';
import { runAutomatedPack } from '@/lib/market-data-runner';
import { parseHoldingsTable } from '@/lib/holdings';
import { loadServicesStatus } from '@/lib/services-status';

const ALLOWED_ACTIONS = new Set([
  'refresh-sector-mcap',
  'news-today',
  'refresh-portfolio-cmp',
  'scan-quarter-results',
  'run-daily-market-pack',
  'run-all-automated',
]);

/** Run an automated maintenance service (auth required). */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  let body: { action?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const action = String(body.action ?? '').trim();
  if (!ALLOWED_ACTIONS.has(action)) {
    return NextResponse.json({ ok: false, error: `Unknown action: ${action}` }, { status: 400 });
  }

  try {
    if (action === 'run-daily-market-pack' || action === 'run-all-automated') {
      const pack = action === 'run-daily-market-pack' ? 'daily' : 'all-automated';
      const startedAt = new Date().toISOString();
      const result = await runAutomatedPack(pack, {
        tenantId: session.tenantId,
        email: session.email,
      });
      const status = await loadServicesStatus();
      const failed = result.steps.filter((s) => !s.ok);
      const newsStep = result.steps.find((s) => s.action === 'news-today');
      const newsWebPath =
        newsStep?.details && typeof newsStep.details === 'object' && newsStep.details !== null
          ? (newsStep.details as { newsWebPath?: string }).newsWebPath
          : undefined;

      if (action === 'run-daily-market-pack') {
        const { writeCronRunLog } = await import('@/lib/cron-log');
        await writeCronRunLog({
          action: 'daily-market-pack',
          trigger: 'services-ui',
          startedAt,
          finishedAt: new Date().toISOString(),
          ok: failed.length === 0,
          summary: `${result.steps.filter((s) => s.ok).length}/${result.steps.length} steps completed`,
          steps: result.steps,
        });
      }

      return NextResponse.json({
        ok: failed.length === 0,
        action,
        summary: `${result.steps.filter((s) => s.ok).length}/${result.steps.length} steps completed`,
        steps: result.steps,
        newsWebPath,
        status,
      });
    }

    if (action === 'refresh-portfolio-cmp') {
      const rows = await parseHoldingsTable(session.tenantId);
      const result = await refreshPortfolioCmpInStockbook(rows.map((r) => r.ticker));
      const status = await loadServicesStatus();
      return NextResponse.json({
        ok: result.tickersFailed.length < result.tickersRequested,
        action,
        summary: `CMP persisted for ${result.tickersUpdated}/${result.tickersRequested} holdings · ${result.refreshedAt}`,
        tickersFailed: result.tickersFailed,
        results: result.results.filter((r) => r.filesUpdated.length > 0).slice(0, 20),
        status,
      });
    }

    if (action === 'scan-quarter-results') {
      const rows = await parseHoldingsTable(session.tenantId);
      const companies = new Map(rows.map((r) => [r.ticker, r.company]));
      const scan = await scanQuarterResults(
        rows.map((r) => r.ticker),
        companies
      );
      const status = await loadServicesStatus();
      return NextResponse.json({
        ok: true,
        action,
        summary: `${scan.staleCount}/${scan.items.length} holdings may need ${scan.expectedQuarter} refresh`,
        scan,
        status,
      });
    }

    if (action === 'refresh-sector-mcap') {
      const results = await refreshAllSectorOutlookMcaps();
      const failed = [...new Set(results.flatMap((r) => r.tickersFailed))];
      const status = await loadServicesStatus();
      return NextResponse.json({
        ok: true,
        action,
        summary: `Updated mcap for ${results.reduce((n, r) => n + r.tickersUpdated, 0)} tickers across ${results.length} sectors.`,
        refreshedAt: results[0]?.refreshedAt ?? new Date().toISOString().slice(0, 10),
        tickersFailed: failed,
        status,
      });
    }

    if (action === 'news-today') {
      const query =
        "Run news for today — partial IST window to now. Stock-wise loop all holdings · write today's summary.md.";
      const result = await runNewsFrameworkQuery(query, {
        tenantId: session.tenantId,
        email: session.email,
      });
      const status = await loadServicesStatus();
      return NextResponse.json({
        ok: true,
        action,
        summary: result.newsDate
          ? `News summary written for ${result.newsDate}.`
          : 'News run completed.',
        newsDate: result.newsDate,
        newsWebPath: result.newsWebPath,
        mode: result.mode,
        answer: result.answer,
        status,
      });
    }

    return NextResponse.json({ ok: false, error: 'Unhandled action' }, { status: 500 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Service run failed';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
