import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from './supabase-server';

/**
 * Data Access Layer for authorisation.
 *
 * The Next.js 16 authentication guide is explicit that proxy.ts should only do
 * optimistic checks and "should not be your only line of defense" — the real
 * check belongs as close to the data as possible. So every admin page and every
 * admin action calls into here, and RLS enforces the same rules again at the
 * database. That is the two-layer requirement in §9.5.6.
 */

// Declaration order in the user_role enum is the authority ordering; mirror it.
const ROLE_ORDER = [
  'user',
  'business_owner',
  'moderator',
  'editor',
  'admin',
  'super_admin',
] as const;

export type Role = (typeof ROLE_ORDER)[number];

export function roleAtLeast(role: Role | null, required: Role): boolean {
  if (!role) return false;
  return ROLE_ORDER.indexOf(role) >= ROLE_ORDER.indexOf(required);
}

export type CurrentUser = {
  id: string;
  email: string | null;
  role: Role;
  displayName: string | null;
};

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

  return {
    id: user.id,
    email: user.email ?? null,
    role: profile.role as Role,
    displayName: profile.display_name as string | null,
  };
});

/** Guards a page or action. Redirects rather than rendering a partial admin UI. */
export async function requireRole(required: Role): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/admin`);
  if (!roleAtLeast(user.role, required)) redirect('/admin/no-access');
  return user;
}
