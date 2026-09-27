'use server';

import { createClient } from './supabase-server';
import { requireRole } from './auth';
import { writeAudit } from './audit';
import { check, runAndReturn } from './action-flow';
import { FormError, text, uuid } from './form-data';

/** Approve, reject or reply to a review. The rating trigger recounts on approve/reject. */
export async function moderateReview(fd: FormData) {
  const user = await requireRole('moderator');
  const back = text(fd, 'back', 200)?.startsWith('/admin/reviews')
    ? text(fd, 'back', 200)!
    : '/admin/reviews';
  await runAndReturn(back, async () => {
    const id = uuid(fd, 'id');
    if (!id) throw new FormError('Nothing selected.');
    const decision = text(fd, 'decision', 20);
    const supabase = await createClient();
    const before = check(await supabase.from('reviews').select('*').eq('id', id).maybeSingle());
    if (!before) throw new FormError('Review not found.');

    if (decision === 'delete') {
      check(await supabase.from('reviews').delete().eq('id', id));
      await writeAudit(user.id, 'delete', 'review', id, before, null);
      return 'Review deleted.';
    }

    const now = new Date().toISOString();
    let patch: Record<string, unknown>;
    let action: 'approve' | 'reject' | 'update';
    if (decision === 'approve' || decision === 'reject') {
      patch = {
        status: decision === 'approve' ? 'approved' : 'rejected',
        moderated_by: user.id,
        moderated_at: now,
        updated_at: now,
      };
      action = decision;
    } else if (decision === 'reply') {
      const reply = text(fd, 'reply_body', 2000);
      patch = {
        reply_body: reply,
        reply_by: reply ? user.id : null,
        replied_at: reply ? now : null,
        updated_at: now,
      };
      action = 'update';
    } else {
      throw new FormError('Unknown action.');
    }

    const after = check(
      await supabase.from('reviews').update(patch).eq('id', id).select('*').maybeSingle(),
    );
    await writeAudit(user.id, action, 'review', id, before, after);
    return decision === 'reply'
      ? 'Reply saved.'
      : `Review ${decision === 'approve' ? 'approved' : 'rejected'}.`;
  });
}

const SUBMISSION_STATUSES = ['new', 'in_progress', 'resolved', 'spam'];

export async function setSubmissionStatus(fd: FormData) {
  const user = await requireRole('moderator');
  await runAndReturn('/admin/inbox', async () => {
    const id = uuid(fd, 'id');
    const status = text(fd, 'status', 20);
    if (!id || !status || !SUBMISSION_STATUSES.includes(status))
      throw new FormError('Invalid request.');
    const supabase = await createClient();
    const before = check(
      await supabase
        .from('form_submissions')
        .select('id, status, is_spam')
        .eq('id', id)
        .maybeSingle(),
    );
    if (!before) throw new FormError('Message not found.');
    const after = check(
      await supabase
        .from('form_submissions')
        .update({
          status,
          is_spam: status === 'spam',
          handled_by: user.id,
          handled_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('id, status, is_spam')
        .maybeSingle(),
    );
    await writeAudit(user.id, 'update', 'form_submission', id, before, after);
    return `Marked as ${status.replace('_', ' ')}.`;
  });
}
