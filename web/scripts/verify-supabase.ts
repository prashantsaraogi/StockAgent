/**
 * Verify Supabase env vars are set (does not call Supabase API).
 * Run: npm run verify-supabase
 */
import { isSupabaseConfigured } from '../lib/supabase/config';
import { loadEnvLocal } from './load-env-local';

loadEnvLocal();

function mask(value: string): string {
  if (value.length <= 12) return '***';
  return `${value.slice(0, 8)}…${value.slice(-4)}`;
}

function isValidAnonKey(key: string): boolean {
  return key.startsWith('eyJ') || key.startsWith('sb_publishable_');
}

function main(): void {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';

  console.log('\n=== Supabase configuration check ===\n');

  const checks = [
    {
      name: 'NEXT_PUBLIC_SUPABASE_URL',
      ok: Boolean(url && url.includes('supabase.co')),
      value: url ? mask(url) : '(missing)',
    },
    {
      name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      ok: Boolean(anon && isValidAnonKey(anon)),
      value: anon ? mask(anon) : '(missing)',
    },
    {
      name: 'NEXT_PUBLIC_APP_URL',
      ok: Boolean(appUrl),
      value: appUrl || '(missing — default http://localhost:3000)',
    },
  ];

  for (const c of checks) {
    console.log(`${c.ok ? '✓' : '✗'} ${c.name}: ${c.value}`);
  }

  console.log('');

  if (isSupabaseConfigured()) {
    console.log('Status: READY — restart `npm run dev` and look for "Supabase Auth" on login page.');
    console.log('Redirect URL in Supabase dashboard must include:');
    console.log(`  ${appUrl || 'http://localhost:3000'}/auth/callback\n`);
    process.exit(0);
  }

  console.log('Status: NOT CONFIGURED');
  console.log('1. Create project at https://supabase.com/dashboard');
  console.log('2. Run supabase/migrations/001_initial_schema.sql in SQL Editor');
  console.log('3. Fill web/.env.local (copy from .env.example)');
  console.log('4. Re-run: npm run verify-supabase\n');
  console.log('Guide: docs/SUPABASE-SETUP.md\n');
  process.exit(1);
}

main();
