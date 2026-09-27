'use server';

import { createClient } from './supabase-server';
import { requireRole, roleAtLeast } from './auth';
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

/**
 * Approve or reject a claim. Approving hands the listing to the claimant (so
 * the owner RLS policies let them edit it from their dashboard), and can mark
 * it Verified. A listing that already has a different owner is never handed
 * over silently: reject the claim or change the owner on the listing itself.
 */
export async function decideClaim(fd: FormData) {
  const user = await requireRole('moderator');
  const show = text(fd, 'show', 20);
  const back = `/admin/claims${show && /^[a-z_]+$/.test(show) ? `?show=${show}` : ''}`;
  await runAndReturn(back, async () => {
    const id = uuid(fd, 'id');
    const decision = text(fd, 'decision', 20);
    if (!id || !decision) throw new FormError('Invalid request.');
    const supabase = await createClient();
    const claim = check(await supabase.from('claims').select('*').eq('id', id).maybeSingle());
    if (!claim) throw new FormError('Claim not found.');
    const now = new Date().toISOString();

    if (decision === 'in_progress' || decision === 'reject') {
      const after = check(
        await supabase
          .from('claims')
          .update({
            status: decision === 'reject' ? 'resolved' : 'in_progress',
            handled_by: user.id,
            handled_at: now,
          })
          .eq('id', id)
          .select('*')
          .maybeSingle(),
      );
      await writeAudit(
        user.id,
        decision === 'reject' ? 'reject' : 'update',
        'claim',
        id,
        claim,
        after,
      );
      return decision === 'reject' ? 'Claim rejected.' : 'Marked as in progress.';
    }
    if (decision !== 'approve') throw new FormError('Unknown action.');

    const listing = check(
      await supabase
        .from('listings')
        .select('id, name, owner_user_id, verification')
        .eq('id', claim.listing_id)
        .maybeSingle(),
    );
    if (!listing) throw new FormError('The listing no longer exists.');
    if (listing.owner_user_id && listing.owner_user_id !== claim.claimant_id) {
      throw new FormError(
        `${listing.name} is already managed by another account. Reject this claim, or change the owner on the listing first.`,
      );
    }

    const patch: Record<string, unknown> = { owner_user_id: claim.claimant_id, updated_at: now };
    if (fd.get('verify') === 'on') patch.verification = 'verified';
    const listingAfter = check(
      await supabase
        .from('listings')
        .update(patch)
        .eq('id', listing.id)
        .select('id, name, owner_user_id, verification')
        .maybeSingle(),
    );
    if (!listingAfter) throw new FormError('The listing could not be updated.');
    await writeAudit(user.id, 'update', 'listing', listing.id, listing, listingAfter);

    const after = check(
      await supabase
        .from('claims')
        .update({ status: 'resolved', handled_by: user.id, handled_at: now })
        .eq('id', id)
        .select('*')
        .maybeSingle(),
    );
    await writeAudit(user.id, 'approve', 'claim', id, claim, after);

    // A plain user becomes a business owner. Role changes are admin-only under
    // RLS, so a moderator's approval still hands over the listing without it;
    // the owner dashboard works on ownership, not on the role.
    if (roleAtLeast(user.role, 'admin')) {
      const profile = check(
        await supabase
          .from('profiles')
          .select('id, role')
          .eq('id', claim.claimant_id)
          .maybeSingle(),
      );
      if (profile?.role === 'user') {
        const p2 = check(
          await supabase
            .from('profiles')
            .update({ role: 'business_owner', updated_at: now })
            .eq('id', profile.id)
            .select('id, role')
            .maybeSingle(),
        );
        await writeAudit(user.id, 'update', 'profile', profile.id, profile, p2);
      }
    }
    return `Approved — ${listing.name} is now managed by the claimant.`;
  });
}
