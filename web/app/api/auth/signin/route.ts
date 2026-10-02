import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/route-handler';
import { createAdminClient, getPocPassword } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { isValidEmail } from '@/lib/auth';
import { ensureUserDataDir } from '@/lib/tenant';

async function ensurePocUser(email: string, password: string): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  const pocPassword = getPocPassword();
  if (!pocPassword || password !== pocPassword) return;

  const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const existing = list?.users?.find((u) => u.email?.toLowerCase() === email);

  if (existing) {
    await admin.auth.admin.updateUserById(existing.id, {
      password: pocPassword,
      email_confirm: true,
    });
    return;
  }

  await admin.auth.admin.createUser({
    email,
    password: pocPassword,
    email_confirm: true,
  });
}

/**
 * Email + password sign-in — no magic link (avoids email rate limits).
 * POC: shared AUTH_POC_PASSWORD auto-registers new emails via service role.
 */
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: 'Supabase not configured — use dev cookie login.' },
      { status: 400 }
    );
  }

  const body = await request.json();
  const email = String(body.email ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');

  if (!isValidEmail(email)) {
    return NextResponse.json({ ok: false, error: 'Enter a valid email' }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json(
      { ok: false, error: 'Password must be at least 6 characters' },
      { status: 400 }
    );
  }

  const response = NextResponse.json({ ok: true });
  const supabase = createRouteHandlerClient(request, response);

  let { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error?.message?.toLowerCase().includes('invalid login credentials')) {
    await ensurePocUser(email, password);
    const retry = await supabase.auth.signInWithPassword({ email, password });
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 401 });
  }

  if (data.user) {
    try {
      await ensureUserDataDir(data.user.id);
    } catch (err) {
      console.error('[auth/signin] ensureUserDataDir:', err);
    }
  }

  return response;
}
