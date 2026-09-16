import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env.local.',
  );
}

const SUPABASE_URL = url;
const SUPABASE_ANON_KEY = anonKey;

/**
 * Refreshes the Supabase session on every matched request and reports who the
 * request belongs to.
 *
 * Two bugs this shape exists to avoid:
 *
 * 1. Returning a *different* response object than the one the rotated cookies
 *    were written to. The refresh succeeds, the browser never receives the new
 *    tokens, and the user is silently logged out roughly an hour later when the
 *    old access token expires. Everything below funnels into the single
 *    `response` built at the end, and callers that redirect must copy its
 *    cookies across (see src/proxy.ts).
 * 2. Putting logic between `createServerClient()` and `auth.getUser()`. Anything
 *    that awaits, redirects or returns early in that gap can commit a response
 *    before the refresh has written its cookies, which loses the new session.
 */
export async function updateSession(request: NextRequest): Promise<{
  response: NextResponse;
  user: User | null;
}> {
  // Collected during the refresh and applied to the one response below.
  const refreshedCookies: { name: string; value: string; options: CookieOptions }[] = [];
  const refreshHeaders: Record<string, string> = {};

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        // Write onto the request too, so Server Components rendering later in
        // this same request read the rotated tokens rather than the stale ones.
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        refreshedCookies.push(...cookiesToSet);
        // no-store headers: a CDN must never cache a response that carries
        // someone's Set-Cookie session.
        Object.assign(refreshHeaders, headers);
      },
    },
  });

  // getUser(), never getSession(): only getUser() revalidates the JWT with the
  // auth server. getSession() trusts whatever is in the cookie, which the
  // client controls.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const response = NextResponse.next({ request });
  for (const { name, value, options } of refreshedCookies) {
    response.cookies.set(name, value, options);
  }
  for (const [name, value] of Object.entries(refreshHeaders)) {
    response.headers.set(name, value);
  }

  return { response, user };
}
