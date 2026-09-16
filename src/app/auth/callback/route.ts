import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { safeNextPath } from '@/lib/auth';

/**
 * Where magic links and password-reset links land. Supabase sends a one-time
 * `code` that has to be exchanged for a session server-side, which is what
 * writes the auth cookies.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  // Same whitelist as /login: the link is attacker-supplied, so `next` is too.
  const next = safeNextPath(searchParams.get('next'));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // Expired, reused or missing code — back to the form, no detail leaked.
  return NextResponse.redirect(new URL('/login', request.url));
}
