/**
 * Role ordering, shared by the server guard (auth.ts) and client components
 * that only need to show or hide links. Declaration order in the user_role
 * enum is the authority ordering; mirror it.
 */
export const ROLE_ORDER = [
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
