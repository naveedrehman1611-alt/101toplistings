'use server';

import { createClient } from './supabase-server';
import { requireRole } from './auth';
import { writeAudit } from './audit';
import { check, runAndReturn, type RevalidateScope } from './action-flow';
import { FormError, text, uuid } from './form-data';

const COLUMNS = 'id, email, source, status, created_at';

// Only the admin list reads subscribers, so no public page needs refreshing.
const SCOPE: RevalidateScope = { paths: [{ path: '/admin/subscribers' }] };

/** Back to the list the form was on, with its status filter. */
function listPath(fd: FormData): string {
  const view = text(fd, 'view', 20);
  return view === 'active' || view === 'unsubscribed'
    ? `/admin/subscribers?status=${view}`
    : '/admin/subscribers';
}

/** Unsubscribes or reactivates an address. Moderators and up (RLS: newsletter_staff_update). */
export async function setSubscriberStatus(fd: FormData) {
  const user = await requireRole('moderator');
  await runAndReturn(
    listPath(fd),
    async () => {
      const id = uuid(fd, 'id');
      if (!id) throw new FormError('Nothing selected.');
      const status = text(fd, 'status', 20);
      if (status !== 'active' && status !== 'unsubscribed') {
        throw new FormError('Unknown status.');
      }

      const supabase = await createClient();
      const before = check(
        await supabase.from('newsletter_subscribers').select(COLUMNS).eq('id', id).maybeSingle(),
      );
      if (!before) throw new FormError('Subscriber not found.');
      if (before.status === status) {
        return status === 'active' ? 'Already active.' : 'Already unsubscribed.';
      }

      const after = check(
        await supabase
          .from('newsletter_subscribers')
          .update({ status })
          .eq('id', id)
          .select(COLUMNS)
          .maybeSingle(),
      );
      if (!after) throw new FormError('The change was not saved.');
      await writeAudit(user.id, 'update', 'newsletter_subscriber', id, before, after);
      return status === 'active' ? 'Subscriber reactivated.' : 'Subscriber unsubscribed.';
    },
    SCOPE,
  );
}

/** Removes an address for good. Admins only (RLS: newsletter_admin_delete). */
export async function deleteSubscriber(fd: FormData) {
  const user = await requireRole('admin');
  await runAndReturn(
    listPath(fd),
    async () => {
      const id = uuid(fd, 'id');
      if (!id) throw new FormError('Nothing selected.');

      const supabase = await createClient();
      const before = check(
        await supabase.from('newsletter_subscribers').select(COLUMNS).eq('id', id).maybeSingle(),
      );
      if (!before) throw new FormError('Subscriber not found.');

      // RLS turns a refused delete into zero rows rather than an error, so the
      // deleted row is returned to tell the two apart.
      const deleted = check(
        await supabase.from('newsletter_subscribers').delete().eq('id', id).select('id'),
      );
      if (!deleted?.length) throw new FormError('The subscriber was not deleted.');
      await writeAudit(user.id, 'delete', 'newsletter_subscriber', id, before, null);
      return 'Subscriber deleted.';
    },
    SCOPE,
  );
}
