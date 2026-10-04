import { NextResponse } from 'next/server';
import { createClientIfConfigured } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { cookies } from 'next/headers';
import { EMAIL_COOKIE, isValidEmail, SESSION_COOKIE } from '@/lib/auth';
import { ensureUserDataDir, tenantIdFromDevEmail } from '@/lib/tenant';

/** Cookie dev login — used only when Supabase env is not set. */
export async function POST(request: Request) {
  if (isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: 'Use Supabase magic link sign-in (email on login page).' },
      { status: 400 }
    );
  }

  const body = await request.json();
  const email = String(body.email ?? '').trim().toLowerCase();

  if (!isValidEmail(email)) {
    return NextResponse.json({ ok: false, error: 'Enter a valid email address' }, { status: 400 });
  }

  const jar = await cookies();
  jar.set(SESSION_COOKIE, 'active', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  jar.set(EMAIL_COOKIE, email, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  try {
    await ensureUserDataDir(tenantIdFromDevEmail(email));
  } catch {
    /* non-fatal */
  }

  return NextResponse.json({ ok: true, email, mode: 'cookie-dev' });
}
