import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase-server';

/**
 * Landing point for every link Supabase Auth emails out: password recovery,
 * signup confirmation, magic links, email changes — and for the return leg of
 * "Continue with Google" (?code=&oauth=google). It turns the one-time
 * credential in the URL into a session cookie, then forwards to `next`.
 *
 * Two shapes arrive here:
 * - `?code=` — the PKCE flow, which @supabase/ssr uses by default. The code is
 *   only redeemable alongside the verifier cookie written when the email was
 *   requested, so it works in the same browser only.
 * - `?token_hash=&type=` — used when a Supabase email template is edited to
 *   link here with {{ .TokenHash }}. No verifier needed, so it also works when
 *   the email is opened on another device.
 *
 * Cookies set through createClient() in a Route Handler are written onto the
 * response we return, so the redirect carries the new session.
 */

// Supabase's EmailOtpType is widened with `string & {}`; accept only the real ones.
const OTP_TYPES = new Set<EmailOtpType>([
  'signup',
  'invite',
  'magiclink',
  'recovery',
  'email_change',
  'email',
]);

/** Only same-site paths. `//host` and `/\host` are both read as another origin. */
function safeNext(v: string | null): string {
  if (!v || !v.startsWith('/') || v.startsWith('//') || v.startsWith('/\\')) return '/dashboard';
  return v;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const next = safeNext(params.get('next'));
  const code = params.get('code');
  const tokenHash = params.get('token_hash');
  const type = params.get('type') as EmailOtpType | null;

  // Built against the request's own origin, never a value from the query string.
  const to = (path: string) => NextResponse.redirect(new URL(path, request.nextUrl.origin));

  // Supabase itself redirects here with ?error= when a link is expired or reused.
  let ok = false;
  if (!params.get('error')) {
    const supabase = await createClient();
    if (code) {
      ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
    } else if (tokenHash && type && OTP_TYPES.has(type)) {
      ok = !(await supabase.auth.verifyOtp({ token_hash: tokenHash, type })).error;
    }
  }

  if (ok) return to(next);

  // "Continue with Google" (see lib/oauth-actions.ts). Cancelling on Google's
  // consent screen comes back as ?error=access_denied.
  if (params.get('oauth')) {
    const msg =
      params.get('error') === 'access_denied'
        ? 'Google sign-in was cancelled.'
        : 'Google sign-in did not complete. Try again, making sure to finish in this same browser.';
    return to(`/login?error=${encodeURIComponent(msg)}`);
  }

  // A dead recovery link is best answered with the form to request a new one.
  if (next.startsWith('/reset-password') || type === 'recovery') {
    return to(
      `/forgot-password?error=${encodeURIComponent('That reset link has expired or was already used. Request a new one below.')}`,
    );
  }
  return to(
    `/login?error=${encodeURIComponent('That link has expired or was opened in a different browser. Sign in below — if you were confirming your email, it may already be confirmed.')}`,
  );
}
