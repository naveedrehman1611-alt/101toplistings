'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

/**
 * Review moderation — the queue that stands between public review spam and the
 * public site (0015 lets anyone leave a review without an account, always as
 * 'pending').
 *
 * Every export re-checks the role as its FIRST statement. A Server Action is a
 * POST endpoint in its own right: having arrived through the admin layout, which
 * also gates on 'moderator', proves nothing about who is calling.
 *
 * Nothing here ever writes listings.rating_average or listings.review_count.
 * reviews_recalc_rating (0007) owns those two columns and recomputes them from
 * APPROVED rows only; listings_rating_consistent (0003) rejects any hand-written
 * pair that disagrees. Approving a review is therefore what moves the public star
 * rating, which is why every status change revalidates the public surfaces below.
 */

const BASE = '/admin/reviews';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const STATUSES = ['pending', 'approved', 'rejected', 'flagged'] as const;
type ReviewStatus = (typeof STATUSES)[number];

function isReviewStatus(value: unknown): value is ReviewStatus {
  return typeof value === 'string' && (STATUSES as readonly string[]).includes(value);
}

/**
 * audit_action (0001) has no 'flag' member, so the queue's four transitions map
 * onto the four that exist: flagging holds a review back like a suspension, and
 * sending one back to 'pending' restores it to the queue.
 */
const AUDIT_ACTION: Record<ReviewStatus, 'approve' | 'reject' | 'suspend' | 'restore'> = {
  approved: 'approve',
  rejected: 'reject',
  flagged: 'suspend',
  pending: 'restore',
};

/**
 * `returnTo` arrives from the client, so it is treated like any other untrusted
 * field: it may only ever point back at this queue. Anything else — including a
 * protocol-relative `//host` — collapses to the base path.
 */
function safeReturn(raw: FormDataEntryValue | null): string {
  const value = typeof raw === 'string' ? raw : '';
  if (value === BASE) return BASE;
  if (value.startsWith(`${BASE}?`) && !value.includes('\\')) return value;
  return BASE;
}

/**
 * Failures come back as a short code, never as Postgres text: the page owns the
 * wording, and an attacker who crafts the URL cannot put words of their own into
 * the operator's screen.
 */
function withError(back: string, code: string): string {
  return `${back}${back.includes('?') ? '&' : '?'}err=${code}`;
}

type ListingSurfaces = {
  slug: string;
  category_id: string | null;
  city_id: string | null;
};

/**
 * Public pages are ISR (300s for '/' and '/listings', 600s for the detail,
 * category and city pages), so without this a moderator would approve a review
 * and then watch the old star rating sit there for ten minutes.
 */
async function revalidateListingSurfaces(listingId: string): Promise<void> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('listings')
    .select('slug, category_id, city_id')
    .eq('id', listingId)
    .maybeSingle();

  const listing = (data ?? null) as ListingSurfaces | null;
  if (!listing) return;

  revalidatePath(`/listing/${listing.slug}`);
  revalidatePath('/');
  revalidatePath('/listings');

  if (listing.category_id) {
    const { data: category } = await supabase
      .from('categories')
      .select('slug')
      .eq('id', listing.category_id)
      .maybeSingle();
    const slug = (category as { slug: string } | null)?.slug;
    if (slug) revalidatePath(`/category/${slug}`);
  }

  if (listing.city_id) {
    const { data: city } = await supabase
      .from('cities')
      .select('slug')
      .eq('id', listing.city_id)
      .maybeSingle();
    const slug = (city as { slug: string } | null)?.slug;
    if (slug) revalidatePath(`/city/${slug}`);
  }
}

type ReviewRow = {
  id: string;
  listing_id: string;
  status: string;
  rating: number;
  reply_body: string | null;
};

/** approve / reject / flag / back-to-pending. */
export async function moderateReview(formData: FormData): Promise<void> {
  const actor = await requireRole('moderator', BASE);

  const back = safeReturn(formData.get('returnTo'));
  const id = String(formData.get('id') ?? '');
  const next = formData.get('status');

  if (!UUID.test(id) || !isReviewStatus(next)) redirect(withError(back, 'bad_input'));

  const supabase = await createClient();

  const { data: beforeRow } = await supabase
    .from('reviews')
    .select('id, listing_id, status, rating, reply_body')
    .eq('id', id)
    .maybeSingle();

  const before = (beforeRow ?? null) as ReviewRow | null;
  if (!before) redirect(withError(back, 'not_found'));

  const { data: afterRow, error } = await supabase
    .from('reviews')
    .update({
      status: next,
      moderated_by: actor.id,
      moderated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('id, listing_id, status, rating, reply_body')
    .maybeSingle();

  const after = (afterRow ?? null) as ReviewRow | null;
  if (error || !after) redirect(withError(back, 'save_failed'));

  await supabase.rpc('log_audit', {
    p_action: AUDIT_ACTION[next],
    p_entity_type: 'review',
    p_entity_id: id,
    p_before: { status: before.status },
    p_after: { status: after.status, moderated_by: actor.id },
  });

  await revalidateListingSurfaces(before.listing_id);
  redirect(back);
}

/** The owner/admin reply shown under an approved review. Empty clears it. */
export async function updateReviewReply(formData: FormData): Promise<void> {
  const actor = await requireRole('moderator', BASE);

  const back = safeReturn(formData.get('returnTo'));
  const id = String(formData.get('id') ?? '');
  const body = String(formData.get('reply_body') ?? '').trim();

  if (!UUID.test(id)) redirect(withError(back, 'bad_input'));
  if (body.length > 2000) redirect(withError(back, 'reply_too_long'));

  const supabase = await createClient();

  const { data: beforeRow } = await supabase
    .from('reviews')
    .select('id, listing_id, status, rating, reply_body')
    .eq('id', id)
    .maybeSingle();

  const before = (beforeRow ?? null) as ReviewRow | null;
  if (!before) redirect(withError(back, 'not_found'));

  const cleared = body.length === 0;
  const { error } = await supabase
    .from('reviews')
    .update({
      reply_body: cleared ? null : body,
      reply_by: cleared ? null : actor.id,
      replied_at: cleared ? null : new Date().toISOString(),
    })
    .eq('id', id);

  if (error) redirect(withError(back, 'save_failed'));

  await supabase.rpc('log_audit', {
    p_action: 'update',
    p_entity_type: 'review',
    p_entity_id: id,
    p_before: { has_reply: before.reply_body !== null },
    p_after: { has_reply: !cleared },
  });

  // A reply is published alongside an approved review, so the detail page has to
  // be rebuilt even though the rating has not moved.
  await revalidateListingSurfaces(before.listing_id);
  redirect(back);
}

/**
 * Deleting is admin-only: it destroys evidence that a rejected or flagged review
 * ever existed, which is a different act from moderating one.
 */
export async function deleteReview(formData: FormData): Promise<void> {
  await requireRole('admin', BASE);

  const back = safeReturn(formData.get('returnTo'));
  const id = String(formData.get('id') ?? '');
  if (!UUID.test(id)) redirect(withError(back, 'bad_input'));

  const supabase = await createClient();

  const { data: beforeRow } = await supabase
    .from('reviews')
    .select('id, listing_id, status, rating, reply_body')
    .eq('id', id)
    .maybeSingle();

  const before = (beforeRow ?? null) as ReviewRow | null;
  if (!before) redirect(withError(back, 'not_found'));

  const { error } = await supabase.from('reviews').delete().eq('id', id);
  if (error) redirect(withError(back, 'delete_failed'));

  await supabase.rpc('log_audit', {
    p_action: 'delete',
    p_entity_type: 'review',
    p_entity_id: id,
    p_before: { status: before.status, rating: before.rating, listing_id: before.listing_id },
    p_after: null,
  });

  // Deleting an approved row changes the aggregate too — the same trigger fires
  // on delete.
  await revalidateListingSurfaces(before.listing_id);
  redirect(back);
}
