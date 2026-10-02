import fs from 'fs/promises';
import path from 'path';
import { getDevUserPaths, getRepoRoot } from './framework-paths';

const DEV_TENANT = 'dev';

/** UUID v4 or literal `dev` — blocks path traversal in data/users/{tenantId}/ */
const SAFE_TENANT_ID = /^(dev|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

export function assertSafeTenantId(tenantId: string): void {
  if (!SAFE_TENANT_ID.test(tenantId)) {
    throw new Error(`Invalid tenant id: ${tenantId}`);
  }
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
 * - dev tenant: sample 3-stock file for local cookie mode only
 */
export async function ensureUserDataDir(tenantId: string): Promise<void> {
  assertSafeTenantId(tenantId);
  const paths = getUserPaths(tenantId);
  await fs.mkdir(paths.portfolioDir, { recursive: true });
  await fs.mkdir(paths.stockbookDir, { recursive: true });
  await fs.mkdir(path.join(paths.portfolioDir, '../analysis-log'), { recursive: true });
  await fs.mkdir(path.join(paths.portfolioDir, '../stock-calculator'), { recursive: true });
  await fs.mkdir(path.dirname(paths.newsTickerIndex), { recursive: true });

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
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}
