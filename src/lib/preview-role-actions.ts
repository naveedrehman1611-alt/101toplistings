'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { PREVIEW_ROLE_COOKIE, getCurrentUser, roleAtLeast, type Role } from './auth';

const STAFF: Role[] = ['moderator', 'editor', 'admin', 'super_admin'];

/**
 * "Preview as" in the admin top bar: view the panel as a lower staff role.
 * Choosing your own role (or anything not below it) clears the preview.
 * The cookie is also checked on every read (auth.ts), so it can never raise a
 * role, whatever value it holds.
 */
export async function setPreviewRole(role: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user || !roleAtLeast(user.actualRole, 'moderator')) return;
  const jar = await cookies();
  const wanted = STAFF.find((r) => r === role);
  if (!wanted || wanted === user.actualRole || !roleAtLeast(user.actualRole, wanted)) {
    jar.delete(PREVIEW_ROLE_COOKIE);
  } else {
    jar.set(PREVIEW_ROLE_COOKIE, wanted, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 8,
    });
  }
  revalidatePath('/admin', 'layout');
}
