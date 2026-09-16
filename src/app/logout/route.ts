import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST only. A GET logout can be fired by any <img> or prefetch on another
 * site, which is CSRF in the one direction people forget to defend.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // signOut() clears the auth cookies through the cookie store; Next merges
  // those writes into the redirect below.
  await supabase.auth.signOut();

  // 303 so the browser follows with GET instead of re-POSTing to /login.
  return NextResponse.redirect(new URL('/login', request.url), { status: 303 });
}
