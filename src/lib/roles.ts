/**
 * Mirror of the `user_role` enum in supabase/migrations/0001_extensions_and_enums.sql.
 * Declaration order is the authority ordering Postgres compares on, so this list
 * must stay in that exact order.
 */
export type UserRole = 'user' | 'business_owner' | 'moderator' | 'editor' | 'admin' | 'super_admin';

export const USER_ROLES: readonly UserRole[] = [
  'user',
  'business_owner',
  'moderator',
  'editor',
  'admin',
  'super_admin',
];

/** Enum ordinals, matching the `p.role >= required` comparison in has_min_role(). */
export const ROLE_RANK: Record<UserRole, number> = {
  user: 0,
  business_owner: 1,
  moderator: 2,
  editor: 3,
  admin: 4,
  super_admin: 5,
};

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && value in ROLE_RANK;
}

/**
 * TypeScript twin of the SQL has_min_role(). This is for UI gating only —
 * RLS running the real function is what actually protects the rows.
 */
export function hasMinRole(role: UserRole, min: UserRole): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[min];
}

/** Moderator and up run the back office (see current_role_is_staff() in 0007). */
export const STAFF_MIN_ROLE: UserRole = 'moderator';
