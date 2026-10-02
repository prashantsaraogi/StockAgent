import { NextResponse } from 'next/server';
import { verifyCronRequest, getCronTenantId, getCronUserEmail } from '@/lib/cron-auth';
import { runAutomatedPack } from '@/lib/market-data-runner';
import { writeCronRunLog } from '@/lib/cron-log';
import { loadServicesStatus } from '@/lib/services-status';

/** Scheduled morning job — daily market pack @ 8 AM IST (external trigger). */
export async function GET(req: Request) {
  if (!verifyCronRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startedAt = new Date().toISOString();

  try {
    const tenantId = getCronTenantId();
    const result = await runAutomatedPack('daily', {
      tenantId,
      email: getCronUserEmail(),
    });

    const failed = result.steps.filter((s) => !s.ok);
    const ok = failed.length === 0;
    const summary = `${result.steps.filter((s) => s.ok).length}/${result.steps.length} steps OK`;

    await writeCronRunLog({
      action: 'daily-market-pack',
      trigger: 'cron-api',
      startedAt,
      finishedAt: new Date().toISOString(),
      ok,
      summary,
      steps: result.steps,
      error: failed.length ? failed.map((f) => f.error ?? f.action).join('; ') : undefined,
    });

    const status = await loadServicesStatus();

    return NextResponse.json({
      ok,
      action: 'daily-market-pack',
      tenantId,
      summary,
      steps: result.steps,
      status,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Daily pack failed';
    await writeCronRunLog({
      action: 'daily-market-pack',
      trigger: 'cron-api',
      startedAt,
      finishedAt: new Date().toISOString(),
      ok: false,
      summary: message,
      error: message,
    });
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return GET(req);
}
