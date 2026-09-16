import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Next.js 16 renamed the `middleware` file convention to `proxy` — same
 * behaviour, different file and export name.
 *
 * Two jobs here, and only two:
 *
 * 1. Refresh the Supabase session and write the rotated cookies onto the
 *    response. Server Components cannot set cookies, so without this the
 *    session would expire and users would be logged out unpredictably.
 * 2. An *optimistic* redirect away from /admin when there is no session at all.
 *
 * This is deliberately not the security boundary. Per the Next.js 16 auth
 * guide, proxy runs separately from render code and must not be the only line
 * of defence — role checks live in src/lib/auth.ts and in RLS.
 */
export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith('/admin')) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/login', '/register'],
};
