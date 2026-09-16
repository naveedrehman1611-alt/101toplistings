import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';

export async function proxy(request: NextRequest) {
  // One call, one response: it both refreshes the session cookies and tells us
  // whether the request carries a valid JWT.
  const { response, user } = await updateSession(request);

  const { pathname } = request.nextUrl;

  // Optimistic only. This is a redirect for humans, not a security boundary:
  // Proxy is skipped for some requests and Server Actions POST straight to
  // their route, so /admin pages and every action re-check through the DAL in
  // src/lib/auth.ts. No profiles/role lookup here — Proxy runs on prefetches
  // too, and a per-request database read would cost every navigation.
  if (pathname.startsWith('/admin') && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return withSessionCookies(NextResponse.redirect(url), response);
  }

  if (pathname === '/login' && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    url.search = '';
    return withSessionCookies(NextResponse.redirect(url), response);
  }

  return response;
}

/**
 * Carries the refreshed auth cookies onto a redirect. Dropping them here is the
 * silent-logout bug: the token was rotated server-side but the browser kept the
 * old one, so the session dies when it expires.
 */
function withSessionCookies(redirect: NextResponse, source: NextResponse) {
  for (const cookie of source.cookies.getAll()) {
    redirect.cookies.set(cookie);
  }
  return redirect;
}

export const config = {
  // Everything except static assets and images — auth redirects must not fire
  // for CSS, JS chunks or optimised images.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)',
  ],
};
