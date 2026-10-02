import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClientIfConfigured } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { ensureUserDataDir } from '@/lib/tenant';

export const SESSION_COOKIE = 'my-agent-session';
export const EMAIL_COOKIE = 'my-agent-email';

export type AuthMode = 'supabase' | 'cookie-dev';

export interface AppSession {
  userId: string;
  email: string;
  tenantId: string;
  authMode: AuthMode;
}

const SUPABASE_TENANT_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Vercel: persist lots in Supabase when tenant folder is a real auth user uuid (not `dev`). */
export function portfolioLotContext(session: AppSession): { userId?: string } {
  const id = session.tenantId;
  if (SUPABASE_TENANT_ID.test(id) && id === session.userId) {
    return { userId: id };
  }
  return {};
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

async function getCookieDevSession(): Promise<AppSession | null> {
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;
  const email = jar.get(EMAIL_COOKIE)?.value;
  if (session === 'active' && email) {
    return {
      userId: 'dev',
      email,
      tenantId: 'dev',
      authMode: 'cookie-dev',
    };
  }
  return null;
}

async function getSupabaseSession(): Promise<AppSession | null> {
  const supabase = await createClientIfConfigured();
  if (!supabase) return null;

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user?.email) return null;

  // Disk folder always = Supabase auth user id (one user, one tenant — no sharing)
  const tenantId = user.id;

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) {
    await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      tenant_id: user.id,
    });
  } else if (profile.tenant_id !== user.id) {
    await supabase.from('profiles').update({ tenant_id: user.id }).eq('id', user.id);
  }

  return {
    userId: user.id,
    email: user.email,
    tenantId,
    authMode: 'supabase',
  };
}

/** Current session — Supabase when configured, else cookie dev fallback. */
export async function getSession(): Promise<AppSession | null> {
  let session: AppSession | null = null;
  if (isSupabaseConfigured()) {
    session = await getSupabaseSession();
  }
  if (!session) {
    session = await getCookieDevSession();
  }
  if (session) {
    try {
      await ensureUserDataDir(session.tenantId);
    } catch {
      /* Vercel/serverless: /var/task is read-only except traced files — avoid crashing pages */
    }
  }
  return session;
}

export async function requireSession(): Promise<AppSession> {
  const session = await getSession();
  if (!session) redirect('/login');
  return session;
}

export function isAuthenticatedCookie(request: Request): boolean {
  const cookie = request.headers.get('cookie') ?? '';
  return cookie.includes(`${SESSION_COOKIE}=active`);
}
