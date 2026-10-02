import { NextResponse } from 'next/server';
import { verifyAllPaths } from '@/lib/verify-paths';
import { getDevUserPaths, getSharedFrameworkPaths } from '@/lib/framework-paths';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { isServerlessReadOnlyFs } from '@/lib/serverless-fs';

export async function GET() {
  const verification = await verifyAllPaths();
  const shared = getSharedFrameworkPaths();
  const dev = getDevUserPaths();
  const supabaseReady = isSupabaseConfigured();

  return NextResponse.json({
    status: verification.ok ? 'ok' : 'degraded',
    mode: 'parallel-development',
    auth: {
      supabaseConfigured: supabaseReady,
      forceDevAuth: process.env.FORCE_DEV_AUTH === 'true',
      loginMode: supabaseReady ? 'supabase-poc-or-magic-link' : 'cookie-dev',
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/auth/callback`,
    },
    hosting: {
      serverlessReadOnlyFs: isServerlessReadOnlyFs(),
      portfolioSaveOnVercel:
        'Supabase login (uuid tenant) + migration 010_portfolio_lots.sql — not cookie-dev',
    },
    cursor: {
      note: 'Root StockBook/ and .cursor/portfolio/ are read-only for web',
      protected: ['StockBook/', '.cursor/portfolio/holdings.md'],
    },
    sharedFramework: {
      repoRoot: shared.repoRoot,
      rules: shared.stockAgentRules,
      skills: shared.skillsDir,
    },
    devTenant: {
      tenantId: dev.tenantId,
      holdings: dev.holdingsFile,
      stockbook: dev.stockbookDir,
    },
    pathChecks: verification.checks,
  });
}
