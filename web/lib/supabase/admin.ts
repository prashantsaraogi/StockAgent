import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, isSupabaseConfigured } from './config';

/** Server-only admin client — never import in client components. */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!isSupabaseConfigured() || !key) {
    return null;
  }
  return createClient(getSupabaseUrl(), key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function getPocPassword(): string | null {
  return process.env.AUTH_POC_PASSWORD ?? null;
}

export function isPocAuthEnabled(): boolean {
  return process.env.NEXT_PUBLIC_AUTH_POC !== 'false';
}
