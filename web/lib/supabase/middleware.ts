import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from './config';

export async function updateSupabaseSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  if (!isSupabaseConfigured()) {
    return { supabaseResponse, user: null as { id: string; email?: string } | null };
  }

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return { supabaseResponse, user };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(
      '[middleware] Supabase auth unreachable — use FORCE_DEV_AUTH=true or fix NEXT_PUBLIC_SUPABASE_URL:',
      message
    );
    return { supabaseResponse, user: null };
  }
}
