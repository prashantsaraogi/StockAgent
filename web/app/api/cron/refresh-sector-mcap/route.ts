import { NextResponse } from 'next/server';
import { verifyCronRequest } from '@/lib/cron-auth';
import { refreshAllSectorOutlookMcaps } from '@/lib/sector-mcap-refresh';

/** Weekly cron: refresh Mcap ₹ cr in all sector cap-tier tables. */
export async function GET(req: Request) {
  if (!verifyCronRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const results = await refreshAllSectorOutlookMcaps();
    const failed = results.flatMap((r) => r.tickersFailed);
    return NextResponse.json({
      ok: true,
      refreshedAt: results[0]?.refreshedAt ?? new Date().toISOString().slice(0, 10),
      sectors: results.length,
      tickersUpdated: results.reduce((n, r) => n + r.tickersUpdated, 0),
      tickersFailed: failed,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Refresh failed';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return GET(req);
}
