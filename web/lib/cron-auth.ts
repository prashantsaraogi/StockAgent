import { assertSafeTenantId } from './tenant';

const DEV_TENANT = 'dev';

/** Verify Authorization: Bearer CRON_SECRET (required when CRON_SECRET is set). */
export function verifyCronRequest(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return true;
  const auth = req.headers.get('authorization');
  return auth === `Bearer ${secret}`;
}

/** Tenant used by scheduled / CLI cron jobs (must have portfolio/holdings.md). */
export function getCronTenantId(): string {
  const id = (process.env.CRON_TENANT_ID ?? DEV_TENANT).trim();
  assertSafeTenantId(id);
  return id;
}

export function getCronUserEmail(): string {
  return (process.env.CRON_USER_EMAIL ?? 'cron@my-agent.local').trim();
}
