import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';
import { getDevUserPaths, getRepoRoot } from './framework-paths';
import { isServerlessReadOnlyFs, safeMkdir } from './serverless-fs';

const DEV_TENANT = 'dev';
const DEV_EMAIL_NAMESPACE = 'my-agent-cookie-dev-v1';

/** UUID v4 or literal `dev` — blocks path traversal in data/users/{tenantId}/ */
const SAFE_TENANT_ID = /^(dev|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

export function assertSafeTenantId(tenantId: string): void {
  if (!SAFE_TENANT_ID.test(tenantId)) {
    throw new Error(`Invalid tenant id: ${tenantId}`);
  }
}

/**
 * Cookie dev login (no Supabase): one stable UUID folder per email under data/users/{id}/.
 * Never use shared `dev` for all emails — holdings must not leak across logins.
 */
export function tenantIdFromDevEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return DEV_TENANT;
  const hash = createHash('sha256').update(`${DEV_EMAIL_NAMESPACE}:${normalized}`).digest();
  const bytes = Buffer.from(hash.subarray(0, 16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/** Resolve on-disk paths for a tenant (Supabase user uuid or `dev`). */
export function getUserPaths(tenantId: string = DEV_TENANT) {
  assertSafeTenantId(tenantId);
  return getDevUserPaths(tenantId);
}

function emptyHoldingsTemplate(tenantId: string): string {
  return `# Portfolio Holdings — web tenant

**Tenant:** \`${tenantId}\`  
**Positions:** 0  
**Note:** Private to this login. Add holdings via import or edit this file.

---

## Summary table

| # | Ticker | Company | Qty | Avg cost (₹) | Cost basis (₹) | Sector |
|---|--------|---------|-----|--------------|----------------|--------|
`;
}

/**
 * Create data/users/{tenantId}/ on first login.
 * - Supabase users: empty portfolio (no other user's stocks)
 * - Cookie dev: per-email tenant folder; empty portfolio unless that folder already exists
 * - Legacy `dev` tenant only: may seed from data/users/dev/portfolio/holdings.md
 */
export { isServerlessReadOnlyFs } from './serverless-fs';

/** Local dev: create tenant folders. Serverless: no-op (never mkdir /var/task/data). */
export async function ensureUserDataDir(tenantId: string): Promise<void> {
  assertSafeTenantId(tenantId);
  if (isServerlessReadOnlyFs()) return;

  try {
    const paths = getUserPaths(tenantId);
    await safeMkdir(paths.portfolioDir);
    await safeMkdir(paths.stockbookDir);
    await safeMkdir(path.join(paths.portfolioDir, '../analysis-log'));

    if (await fileExists(paths.holdingsFile)) {
      return;
    }
    await safeMkdir(path.join(paths.portfolioDir, '../stock-calculator'));
    await safeMkdir(path.dirname(paths.newsTickerIndex));

    const holdingsExists = await fileExists(paths.holdingsFile);
    if (!holdingsExists) {
      let seed: string;
      if (tenantId === DEV_TENANT) {
        const devHoldings = path.join(getRepoRoot(), 'data/users/dev/portfolio/holdings.md');
        if (await fileExists(devHoldings)) {
          seed = await fs.readFile(devHoldings, 'utf8');
        } else {
          seed = emptyHoldingsTemplate(tenantId);
        }
      } else {
        seed = emptyHoldingsTemplate(tenantId);
      }
      await fs.writeFile(paths.holdingsFile, seed, 'utf8');
    }

    if (!(await fileExists(paths.newsTickerIndex))) {
      await fs.writeFile(
        paths.newsTickerIndex,
        `# Ticker index — ${tenantId}\n\nPer-user news links (private to this login).\n`,
        'utf8'
      );
    }
  } catch {
    /* Do not fail login or SSR when disk is unavailable */
  }
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}
