import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from './supabase-server';
import { signInHref } from './legacy-redirects';
import { roleAtLeast, type Role } from './role-order';

export { roleAtLeast, type Role };

/**
 * Data Access Layer for authorisation.
 *
 * The Next.js 16 authentication guide is explicit that proxy.ts should only do
 * optimistic checks and "should not be your only line of defense" — the real
 * check belongs as close to the data as possible. So every admin page and every
 * admin action calls into here, and RLS enforces the same rules again at the
 * database. That is the two-layer requirement in §9.5.6.
 */

export type CurrentUser = {
  id: string;
  email: string | null;
  /** The role every check uses: the real role, or a lower one being previewed. */
  role: Role;
  /** The role in the profiles table. */
  actualRole: Role;
  displayName: string | null;
};

/**
 * "Preview as": a staff member can view the admin as a lower staff role. The
 * cookie can only lower the role used for checks, never raise it, so a forged
 * cookie grants nothing: anything above the profile's own role is ignored.
 */
export const PREVIEW_ROLE_COOKIE = 'admin_preview_role';

function previewRole(actual: Role, wanted: string | undefined): Role {
  const staff: Role[] = ['moderator', 'editor', 'admin', 'super_admin'];
  const w = staff.find((r) => r === wanted);
  return w && roleAtLeast(actual, w) ? w : actual;
}

/**
 * Resolves the signed-in user and their role.
 *
 * Uses getUser(), not getSession(): getSession reads the cookie without
 * revalidating it, so a tampered cookie would be trusted. getUser round-trips
 * to Supabase Auth and is the only trustworthy check on the server.
 *
 * The role is read from the profiles table, never from a client-supplied claim.
 *
 * Wrapped in React's cache() so the admin layout and the page it renders share
 * one getUser() round trip and one profiles read per request instead of two
 * each — the guard still runs for both, it just stops re-asking.
 */
export const getCurrentUser = cache(async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, display_name, is_suspended')
    .eq('id', user.id)
    .maybeSingle();

  // A suspended account is treated as signed out rather than downgraded, so a
  // suspension takes effect immediately without waiting for the token to expire.
  if (!profile || profile.is_suspended) return null;

  const actualRole = profile.role as Role;
  const preview = (await cookies()).get(PREVIEW_ROLE_COOKIE)?.value;
  return {
    id: user.id,
    email: user.email ?? null,
    role: previewRole(actualRole, preview),
    actualRole,
    displayName: profile.display_name as string | null,
  };
});

/** Guards a page or action. Redirects rather than rendering a partial admin UI. */
export async function requireRole(required: Role): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/admin`);
  if (!roleAtLeast(user.role, required)) {
    // /admin/no-access renders inside the admin layout, which itself requires
    // moderator — sending a non-staff user there would redirect forever.
    redirect(roleAtLeast(user.role, 'moderator') ? '/admin/no-access' : '/dashboard');
  }
  return user;
}

/** Any signed-in, non-suspended user. Sends everyone else to sign in first. */
export async function requireUser(next: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(signInHref(next));
  return user;
}
