import { createClientIfConfigured } from './supabase/server';
import { createAdminClient } from './supabase/admin';
import { isSupabaseConfigured } from './supabase/config';

export interface LotsFilePayload {
  version: 1;
  lots: unknown[];
}

const TABLE = 'portfolio_lots';

function parseLotsPayload(raw: unknown): LotsFilePayload | null {
  const lots = raw as LotsFilePayload | undefined;
  if (lots?.version === 1 && Array.isArray(lots.lots)) return lots;
  return null;
}

async function ensureProfileRow(userId: string, email?: string): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  const row = {
    id: userId,
    email: email?.trim() || 'user@my-agent.local',
    tenant_id: userId,
    updated_at: new Date().toISOString(),
  };

  const { error } = await admin.from('profiles').upsert(row);
  if (error) {
    throw new Error(`Could not upsert profile before portfolio save: ${error.message}`);
  }
}

export async function readLotsFromSupabase(userId: string): Promise<LotsFilePayload | null> {
  const admin = createAdminClient();
  if (admin) {
    const { data, error } = await admin
      .from(TABLE)
      .select('lots')
      .eq('user_id', userId)
      .maybeSingle();
    if (!error) {
      const parsed = parseLotsPayload(data?.lots);
      if (parsed) return parsed;
      if (data != null) return { version: 1, lots: [] };
    } else if (!error.message.includes('portfolio_lots')) {
      console.error('portfolio_lots read (admin) failed:', error.message);
    }
  }

  const supabase = await createClientIfConfigured();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(TABLE)
    .select('lots')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('portfolio_lots read failed:', error.message);
    return null;
  }

  return parseLotsPayload(data?.lots) ?? { version: 1, lots: [] };
}

export async function writeLotsToSupabase(
  userId: string,
  tenantId: string,
  payload: LotsFilePayload,
  opts?: { email?: string }
): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and keys on Vercel (remove FORCE_DEV_AUTH).'
    );
  }

  if (userId !== tenantId) {
    throw new Error('Invalid tenant for portfolio save.');
  }

  await ensureProfileRow(userId, opts?.email);

  const row = {
    user_id: userId,
    tenant_id: tenantId,
    lots: payload,
    updated_at: new Date().toISOString(),
  };

  const admin = createAdminClient();
  if (admin) {
    const { error } = await admin.from(TABLE).upsert(row, { onConflict: 'user_id' });
    if (!error) return;
    throw new Error(formatPortfolioSaveError(error.message));
  }

  const supabase = await createClientIfConfigured();
  if (!supabase) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY missing on server — add it in Vercel env for reliable portfolio saves.'
    );
  }

  const { error } = await supabase.from(TABLE).upsert(row, { onConflict: 'user_id' });
  if (error) {
    throw new Error(formatPortfolioSaveError(error.message));
  }
}

function formatPortfolioSaveError(message: string): string {
  const lower = message.toLowerCase();
  if (
    (lower.includes('portfolio_lots') &&
      (lower.includes('does not exist') || lower.includes('could not find'))) ||
    lower.includes('schema cache') ||
    lower.includes('pgrst205')
  ) {
    return 'Portfolio table missing — run supabase/migrations/010_portfolio_lots.sql in Supabase SQL Editor.';
  }
  if (lower.includes('invalid api key') || lower.includes('invalid jwt')) {
    return 'Supabase API key rejected — check NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY in Vercel (Secret type, no typos).';
  }
  if (lower.includes('foreign key') && lower.includes('profiles')) {
    return 'Profile row missing for this user — sign out, sign in again, then retry.';
  }
  if (lower.includes('row-level security') || lower.includes('policy')) {
    return `Portfolio save blocked by RLS — add SUPABASE_SERVICE_ROLE_KEY on Vercel. (${message})`;
  }
  return `Could not save portfolio: ${message}`;
}

/** Server health — can admin client reach portfolio_lots? */
export async function probePortfolioLotsTable(): Promise<{
  ok: boolean;
  detail: string;
}> {
  const admin = createAdminClient();
  if (!admin) {
    return {
      ok: false,
      detail: 'SUPABASE_SERVICE_ROLE_KEY missing or Supabase not configured',
    };
  }

  const { error } = await admin.from(TABLE).select('user_id').limit(1);
  if (error) {
    return { ok: false, detail: formatPortfolioSaveError(error.message) };
  }
  return { ok: true, detail: 'portfolio_lots reachable' };
}
