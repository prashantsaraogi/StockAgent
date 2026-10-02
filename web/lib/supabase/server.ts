import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from './config';

export async function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }

  const cookieStore = await cookies();

  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // setAll from Server Component — middleware handles refresh
        }
      },
    },
  });
}

/** Returns null when Supabase env is missing (cookie dev mode). */
export async function createClientIfConfigured() {
  if (!isSupabaseConfigured()) return null;
  return createClient();
}
