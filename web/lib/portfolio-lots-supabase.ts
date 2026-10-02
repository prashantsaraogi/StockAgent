import { createClientIfConfigured } from './supabase/server';

export interface LotsFilePayload {
  version: 1;
  lots: unknown[];
}

const TABLE = 'portfolio_lots';

export async function readLotsFromSupabase(userId: string): Promise<LotsFilePayload | null> {
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

  const lots = data?.lots as LotsFilePayload | undefined;
  if (lots?.version === 1 && Array.isArray(lots.lots)) return lots;
  return { version: 1, lots: [] };
}

export async function writeLotsToSupabase(
  userId: string,
  tenantId: string,
  payload: LotsFilePayload
): Promise<void> {
  const supabase = await createClientIfConfigured();
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Portfolio save on Vercel requires magic-link login and database migration 010_portfolio_lots.sql.'
    );
  }

  const { error } = await supabase.from(TABLE).upsert({
    user_id: userId,
    tenant_id: tenantId,
    lots: payload,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(
      error.message.includes('portfolio_lots')
        ? 'Portfolio table missing — run supabase/migrations/010_portfolio_lots.sql in Supabase SQL Editor.'
        : `Could not save portfolio: ${error.message}`
    );
  }
}
