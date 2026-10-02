import { NextResponse } from 'next/server';
import { createClientIfConfigured } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { cookies } from 'next/headers';
import { EMAIL_COOKIE, SESSION_COOKIE } from '@/lib/auth';

export async function POST() {
  if (isSupabaseConfigured()) {
    const supabase = await createClientIfConfigured();
    if (supabase) {
      await supabase.auth.signOut();
    }
  }

  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  jar.delete(EMAIL_COOKIE);

  return NextResponse.json({ ok: true });
}
