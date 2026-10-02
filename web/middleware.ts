import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { updateSupabaseSession } from '@/lib/supabase/middleware';

const PUBLIC = ['/login', '/api/auth/login', '/api/auth/signin', '/api/auth/logout', '/api/health', '/auth/callback'];

function isPublicPath(pathname: string): boolean {
  return PUBLIC.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function hasCookieDevSession(request: NextRequest): boolean {
  return request.cookies.get('my-agent-session')?.value === 'active';
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  let response: NextResponse;
  let authenticated = false;

  if (isSupabaseConfigured()) {
    const { supabaseResponse, user } = await updateSupabaseSession(request);
    response = supabaseResponse;
    authenticated = Boolean(user);
  } else {
    response = NextResponse.next();
    authenticated = hasCookieDevSession(request);
  }

  if (!authenticated && !isPublicPath(pathname)) {
    const login = new URL('/login', request.url);
    login.searchParams.set('from', pathname);
    return NextResponse.redirect(login);
  }

  if (authenticated && pathname === '/login') {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  if (pathname === '/') {
    return NextResponse.redirect(new URL(authenticated ? '/home' : '/login', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
