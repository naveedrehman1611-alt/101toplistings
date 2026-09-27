'use server';

import { redirect } from 'next/navigation';
import { createClient } from './supabase-server';
import { SITE_URL } from './supabase';

/**
 * Only same-site paths. `//host` and `/\host` are both read as another origin.
 * With no usable `next` we land on /login, which forwards a signed-in user to
 * /admin or /dashboard by role — the same place a password sign-in ends up.
 */
function safeNext(v: unknown): string {
  const s = typeof v === 'string' ? v : '';
  if (!s.startsWith('/') || s.startsWith('//') || s.startsWith('/\\')) return '/login';
  return s;
}

/**
 * Starts "Continue with Google". Supabase returns the Google consent URL and,
 * because @supabase/ssr uses PKCE, writes the code verifier cookie through
 * createClient(). Google sends the user back via Supabase to /auth/callback,
 * which redeems the code in this same browser and forwards to `next`.
 *
 * The profile row is created by the handle_new_user trigger on auth.users,
 * exactly as for email signups (see migrations 0010 and 0019).
 */
export async function signInWithGoogle(formData: FormData) {
  const next = safeNext(formData.get('next'));
  const from = formData.get('from') === 'register' ? '/register' : '/login';

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // `oauth=google` lets the callback tell a cancelled Google sign-in apart
      // from an expired email link when Supabase sends back ?error=.
      redirectTo: `${SITE_URL}/auth/callback?oauth=google&next=${encodeURIComponent(next)}`,
      queryParams: { prompt: 'select_account' },
    },
  });

  if (error || !data.url) {
    redirect(
      `${from}?error=${encodeURIComponent('Google sign-in is unavailable right now. Try again or use your email and password.')}`,
    );
  }

  redirect(data.url);
}
