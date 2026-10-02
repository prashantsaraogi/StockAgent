import './load-env-local';
import { getCronTenantId, getCronUserEmail } from '../lib/cron-auth';
import { runAutomatedPack } from '../lib/market-data-runner';
import { writeCronRunLog } from '../lib/cron-log';

async function main() {
  const startedAt = new Date().toISOString();
  const tenantId = getCronTenantId();

  console.log(`Daily market pack — tenant ${tenantId}`);
  console.log(`Started ${startedAt}\n`);

  try {
    const result = await runAutomatedPack('daily', {
      tenantId,
      email: getCronUserEmail(),
    });

    for (const step of result.steps) {
      const mark = step.ok ? '✓' : '✗';
      console.log(`${mark} ${step.action}: ${step.ok ? step.summary : step.error}`);
    }

    const failed = result.steps.filter((s) => !s.ok);
    const ok = failed.length === 0;
    const summary = `${result.steps.filter((s) => s.ok).length}/${result.steps.length} steps OK`;

    await writeCronRunLog({
      action: 'daily-market-pack',
      trigger: 'cli',
      startedAt,
      finishedAt: new Date().toISOString(),
      ok,
      summary,
      steps: result.steps,
    });

    console.log(`\nDone — ${summary}`);
    process.exit(ok ? 0 : 1);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Failed:', message);
    await writeCronRunLog({
      action: 'daily-market-pack',
      trigger: 'cli',
      startedAt,
      finishedAt: new Date().toISOString(),
      ok: false,
      summary: message,
      error: message,
    });
    process.exit(1);
  }
}

main();
