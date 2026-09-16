import { cache } from 'react';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { hasMinRole, isUserRole, STAFF_MIN_ROLE, type UserRole } from '@/lib/roles';

export type CurrentUser = {
  id: string;
  email: string | null;
  role: UserRole;
  displayName: string | null;
  avatarUrl: string | null;
};

/**
 * The Data Access Layer. Proxy only does optimistic cookie checks, so this is
 * the real boundary: every Server Component, Server Action and Route Handler
 * that needs identity asks here, and never trusts a role passed in as a prop or
 * form field.
 *
 * `cache()` dedupes the two round trips (auth.getUser + profiles) across a
 * single render pass; it deliberately does not survive into the next request.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();

  // getUser() revalidates the JWT with Supabase Auth. getSession() would only
  // decode a cookie the client can forge.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, display_name, avatar_url, is_suspended')
    .eq('id', user.id)
    .maybeSingle();

  // No profile row means the signup trigger (0010) has not run or the row was
  // removed — treat it as unauthenticated rather than guessing a role. A
  // suspended account keeps a valid JWT, so it has to be rejected here too;
  // has_min_role() makes the same call on the database side.
  if (!profile || profile.is_suspended) return null;
  if (!isUserRole(profile.role)) return null;

  return {
    id: profile.id,
    email: user.email ?? null,
    role: profile.role,
    displayName: profile.display_name,
    avatarUrl: profile.avatar_url,
  };
});

/**
 * Gate a route or an action on a minimum role.
 *
 * `nextPath` is where to send the visitor back after signing in; Server
 * Components cannot read their own pathname, so callers pass it (it is
 * validated again on the way out of /login).
 *
 * Under-privileged but signed in renders a 404 rather than a 403: `forbidden()`
 * needs experimental `authInterrupts` in next.config.ts, which this layer does
 * not own. Hiding the existence of the route is the safer failure anyway.
 */
export async function requireRole(min: UserRole, nextPath = '/admin'): Promise<CurrentUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(safeNextPath(nextPath))}`);
  }

  if (!hasMinRole(user.role, min)) {
    notFound();
  }

  return user;
}

/** Moderator and up — the back-office audience. */
export async function isStaff(): Promise<boolean> {
  const user = await getCurrentUser();
  return user ? hasMinRole(user.role, STAFF_MIN_ROLE) : false;
}

export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user ? hasMinRole(user.role, 'admin') : false;
}

/**
 * Whitelist for post-login redirects. An unvalidated `next` is an open redirect
 * (`//evil.com` and `https://evil.com` are both accepted by Response.redirect),
 * so only same-origin paths below /admin — the one place sign-in leads — are
 * honoured; anything else falls back to /admin.
 */
export function safeNextPath(next: string | null | undefined): string {
  if (!next) return '/admin';
  // `//host` and `/\host` are protocol-relative: same first character, different origin.
  if (!next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return '/admin';
  if (next !== '/admin' && !next.startsWith('/admin/') && !next.startsWith('/admin?')) {
    return '/admin';
  }
  return next;
}
