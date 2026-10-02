import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/route-handler';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { ensureUserDataDir } from '@/lib/tenant';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/home';
  const authError = searchParams.get('error');
  const authErrorDescription = searchParams.get('error_description');

  const loginWithError = (message: string) => {
    const login = new URL('/login', origin);
    login.searchParams.set('error', message);
    return NextResponse.redirect(login);
  };

  if (authError) {
    return loginWithError(authErrorDescription ?? authError);
  }

  if (!isSupabaseConfigured()) {
    return loginWithError('Supabase is not configured on the server.');
  }

  if (!code) {
    return loginWithError('Missing sign-in code. Please request a new magic link.');
  }

  const safeNext = next.startsWith('/') ? next : '/home';
  const response = NextResponse.redirect(new URL(safeNext, origin));
  const supabase = createRouteHandlerClient(request, response);

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('[auth/callback] exchangeCodeForSession failed:', error.message);
    return loginWithError(
      error.message.includes('expired') || error.message.includes('invalid')
        ? 'Magic link expired or already used. Request a new one.'
        : `Sign-in failed: ${error.message}`
    );
  }

  if (data.user) {
    try {
      const tenantId = data.user.id;
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', data.user.id)
        .maybeSingle();

      await ensureUserDataDir(profile?.tenant_id ?? tenantId);
    } catch (err) {
      console.error('[auth/callback] post-login setup failed:', err);
      // Session is valid — continue even if disk folder creation fails
    }
  }

  return response;
}
