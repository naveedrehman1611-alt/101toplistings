'use server';

import { createClient } from './supabase-server';
import { requireRole, roleAtLeast, type Role } from './auth';
import { writeAudit } from './audit';
import { check, runAndReturn } from './action-flow';
import { FormError, text, uuid } from './form-data';

const ROLES: Role[] = ['user', 'business_owner', 'moderator', 'editor', 'admin', 'super_admin'];

/**
 * Changes a user's role or suspension. Admin-only; RLS (profiles_admin_all)
 * enforces the same thing at the database. On top of that:
 *  - nobody edits their own account here, so an admin cannot lock themselves out;
 *  - only a super admin may touch another admin, or grant admin or above.
 */
export async function updateUser(fd: FormData) {
  const actor = await requireRole('admin');
  const back = `/admin/users${text(fd, 'qs', 200) ?? ''}`.replace(/[^\w/?=&%.-]/g, '');
  await runAndReturn(back, async () => {
    const id = uuid(fd, 'id');
    if (!id) throw new FormError('Nothing selected.');
    if (id === actor.id) throw new FormError('You cannot change your own account here.');

    const supabase = await createClient();
    const before = check(
      await supabase
        .from('profiles')
        .select('id, role, display_name, is_suspended')
        .eq('id', id)
        .maybeSingle(),
    );
    if (!before) throw new FormError('User not found.');

    const isSuper = actor.role === 'super_admin';
    if (!isSuper && roleAtLeast(before.role as Role, 'admin'))
      throw new FormError('Only a super admin can change another admin.');

    const patch: { role?: Role; is_suspended?: boolean; updated_at: string } = {
      updated_at: new Date().toISOString(),
    };
    const role = text(fd, 'role', 20) as Role | null;
    if (role) {
      if (!ROLES.includes(role)) throw new FormError('Unknown role.');
      if (!isSuper && roleAtLeast(role, 'admin'))
        throw new FormError('Only a super admin can grant admin access.');
      patch.role = role;
    }
    const suspend = text(fd, 'suspend', 5);
    if (suspend === 'true' || suspend === 'false') patch.is_suspended = suspend === 'true';

    const after = check(
      await supabase.from('profiles').update(patch).eq('id', id).select('*').maybeSingle(),
    );
    if (!after) throw new FormError('The change was not saved.');
    const name = before.display_name ?? 'User';
    if (patch.is_suspended !== undefined && patch.is_suspended !== before.is_suspended) {
      await writeAudit(
        actor.id,
        patch.is_suspended ? 'suspend' : 'restore',
        'profile',
        id,
        before,
        after,
      );
      return patch.is_suspended ? `Suspended ${name}.` : `Restored ${name}.`;
    }
    await writeAudit(actor.id, 'update', 'profile', id, before, after);
    return `Saved ${name}.`;
  });
}
