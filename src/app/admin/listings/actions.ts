'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { listingPayloadSchema, rawListingPayload, shapeListingErrors } from '@/lib/listing-schema';
import type { ModerationState, SaveListingState } from './action-state';

/**
 * Listing mutations.
 *
 * A Server Action is a POST endpoint that anyone who can guess the action id may
 * call directly — it does not have to arrive through /admin/layout.tsx. So the
 * first statement of every export here re-establishes the role, and RLS under
 * the admin's own JWT is the boundary underneath that. There is no service-role
 * key anywhere in this file, by design.
 *
 * See node_modules/next/dist/docs/01-app/02-guides/server-actions.md ("Security").
 */


/* -------------------------------------------------------------------------- */
/* cache fan-out                                                               */
/* -------------------------------------------------------------------------- */

type RevalidationTargets = {
  slug: string | null;
  categorySlug: string | null;
  citySlug: string | null;
};

/**
 * Every public surface a listing can appear on is ISR (300-600s, see the
 * `export const revalidate` lines under src/app). Missing one means the admin
 * approves a listing and the owner still cannot find it for ten minutes, which
 * reads as "the approval did not work". So the fan-out is exhaustive and runs
 * after every mutation, successful or not-yet-redirected.
 */
function revalidateListingSurfaces(targets: RevalidationTargets) {
  revalidatePath('/');
  revalidatePath('/listings');
  revalidatePath('/sitemap.xml');
  if (targets.slug) revalidatePath(`/listing/${targets.slug}`);
  if (targets.categorySlug) revalidatePath(`/category/${targets.categorySlug}`);
  if (targets.citySlug) revalidatePath(`/city/${targets.citySlug}`);
}

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

/**
 * The slugs a listing's public URLs are built from. Read separately from the
 * write because the RPC returns only the id, and because on delete the row is
 * gone by the time we need to purge its page.
 */
async function readRevalidationTargets(
  supabase: SupabaseClient,
  listingId: string,
): Promise<RevalidationTargets> {
  const { data } = await supabase
    .from('listings')
    // listings has two FKs to categories, so the embed needs the disambiguating
    // `!column` hint or PostgREST refuses the request.
    .select('slug, category:categories!category_id (slug), city:cities!city_id (slug)')
    .eq('id', listingId)
    .maybeSingle<{
      slug: string;
      category: { slug: string } | null;
      city: { slug: string } | null;
    }>();

  return {
    slug: data?.slug ?? null,
    categorySlug: data?.category?.slug ?? null,
    citySlug: data?.city?.slug ?? null,
  };
}

/**
 * Postgres messages leak column names, constraint names and sometimes row
 * contents. The admin gets the one thing they can act on; the detail goes to the
 * server log.
 */
function friendlyDbError(context: string, error: { message: string; code?: string }): string {
  console.error(`[admin/listings] ${context}`, error);
  if (error.code === '23505') return 'That value is already taken by another listing.';
  if (error.code === '42501') return 'Your account is not allowed to make that change.';
  return 'The database rejected this change. Nothing was saved.';
}

/* -------------------------------------------------------------------------- */
/* save                                                                        */
/* -------------------------------------------------------------------------- */

export async function saveListing(
  prevState: SaveListingState,
  formData: FormData,
): Promise<SaveListingState> {
  const actor = await requireRole('admin');

  const parsed = listingPayloadSchema.safeParse(rawListingPayload(formData));
  if (!parsed.success) {
    return {
      ok: false,
      errors: shapeListingErrors(parsed.error),
      message: 'Some fields need attention.',
    };
  }

  const { listing, hours, amenities, images } = parsed.data;
  const supabase = await createClient();

  // ONE call. admin_save_listing resolves the slug, writes listings plus all
  // three child tables in a single transaction and writes the audit row — so
  // nothing here touches those tables directly and there is no half-saved state.
  const { data: savedId, error } = await supabase.rpc('admin_save_listing', {
    p_listing: {
      ...listing,
      // The RPC reads `id` with nullif(...,'')::uuid, so a missing id is an insert.
      id: listing.id ?? '',
    },
    p_hours: hours,
    p_amenities: amenities,
    p_images: images,
  });

  if (error || typeof savedId !== 'string') {
    return {
      ok: false,
      errors: {},
      message: friendlyDbError(
        `saveListing by ${actor.id}`,
        error ?? { message: 'no id returned' },
      ),
    };
  }

  revalidateListingSurfaces(await readRevalidationTargets(supabase, savedId));

  // redirect() throws, so it must come last — anything after it never runs.
  redirect(`/admin/listings?saved=${savedId}`);
}

/* -------------------------------------------------------------------------- */
/* moderation                                                                  */
/* -------------------------------------------------------------------------- */

type ModerationVerdict = {
  status: 'approved' | 'rejected' | 'suspended' | 'draft';
  auditAction: 'approve' | 'reject' | 'suspend' | 'restore';
};

/**
 * The four verdicts share one body: read the row (for the before-image and the
 * slugs), flip the status, log the audit entry, fan out the cache. They differ
 * only in the status written and the audit_action recorded.
 */
async function moderate(
  formData: FormData,
  verdict: ModerationVerdict,
  rejectionNote: string | null,
): Promise<ModerationState> {
  const listingId = formData.get('id');
  if (typeof listingId !== 'string' || listingId === '') {
    return { ok: false, message: 'No listing was identified.' };
  }

  const supabase = await createClient();

  const { data: before, error: readError } = await supabase
    .from('listings')
    .select('id, slug, status, rejection_note, published_at')
    .eq('id', listingId)
    .maybeSingle();

  if (readError || !before) {
    return { ok: false, message: 'That listing no longer exists.' };
  }

  const patch: {
    status: ModerationVerdict['status'];
    rejection_note: string | null;
    published_at?: string;
  } = {
    status: verdict.status,
    // Cleared on every non-reject verdict: a stale "why we rejected you" note
    // shown next to an approved listing is worse than no note.
    rejection_note: rejectionNote,
  };
  // First crossing into 'approved' stamps published_at, exactly as
  // admin_save_listing does. Without it the listing sorts last in
  // listings_public_recent_idx and the sitemap has no lastmod. Re-approving
  // must NOT restamp, or the "recently added" rail reshuffles on every edit.
  if (verdict.status === 'approved' && before.published_at === null) {
    patch.published_at = new Date().toISOString();
  }

  const { error: writeError } = await supabase.from('listings').update(patch).eq('id', listingId);

  if (writeError) {
    return { ok: false, message: friendlyDbError(`moderate ${verdict.auditAction}`, writeError) };
  }

  const { data: after } = await supabase
    .from('listings')
    .select('id, slug, status, rejection_note, published_at')
    .eq('id', listingId)
    .maybeSingle();

  // log_audit pins actor_id to auth.uid() itself (0011), so this cannot be
  // attributed to anyone but the signed-in moderator.
  const { error: auditError } = await supabase.rpc('log_audit', {
    p_action: verdict.auditAction,
    p_entity_type: 'listing',
    p_entity_id: listingId,
    p_before: before,
    p_after: after,
  });
  if (auditError) console.error('[admin/listings] log_audit failed', auditError);

  revalidateListingSurfaces(await readRevalidationTargets(supabase, listingId));

  return { ok: true, message: `Listing ${verdict.auditAction}d.` };
}

export async function approveListing(formData: FormData): Promise<ModerationState> {
  await requireRole('moderator');
  return moderate(formData, { status: 'approved', auditAction: 'approve' }, null);
}

export async function rejectListing(formData: FormData): Promise<ModerationState> {
  await requireRole('moderator');

  const note = formData.get('rejection_note');
  const trimmed = typeof note === 'string' ? note.trim() : '';
  // A rejection without a reason is an unactionable rejection: the owner gets
  // an email that tells them nothing and the moderator gets the reply.
  if (trimmed.length < 4) {
    return { ok: false, message: 'Give a reason before rejecting this listing.' };
  }
  if (trimmed.length > 1000) {
    return { ok: false, message: 'Keep the rejection reason under 1000 characters.' };
  }

  return moderate(formData, { status: 'rejected', auditAction: 'reject' }, trimmed);
}

export async function suspendListing(formData: FormData): Promise<ModerationState> {
  await requireRole('moderator');

  const note = formData.get('rejection_note');
  const trimmed = typeof note === 'string' ? note.trim() : '';
  return moderate(
    formData,
    { status: 'suspended', auditAction: 'suspend' },
    trimmed === '' ? null : trimmed.slice(0, 1000),
  );
}

/** Undo of suspend/reject: back to 'draft' so a human re-approves deliberately. */
export async function restoreListing(formData: FormData): Promise<ModerationState> {
  await requireRole('moderator');
  return moderate(formData, { status: 'draft', auditAction: 'restore' }, null);
}

/* -------------------------------------------------------------------------- */
/* delete                                                                      */
/* -------------------------------------------------------------------------- */

export async function deleteListing(formData: FormData): Promise<ModerationState> {
  // Admin, not moderator: this cascades to reviews, images and hours and is the
  // one operation here with no undo.
  const actor = await requireRole('admin');

  const listingId = formData.get('id');
  if (typeof listingId !== 'string' || listingId === '') {
    return { ok: false, message: 'No listing was identified.' };
  }

  const supabase = await createClient();

  // Read the slugs first: after the delete there is no row to derive them from,
  // and the public /listing/[slug] page must still be purged.
  const targets = await readRevalidationTargets(supabase, listingId);
  const { data: before } = await supabase
    .from('listings')
    .select('id, slug, name, status')
    .eq('id', listingId)
    .maybeSingle();

  if (!before) return { ok: false, message: 'That listing no longer exists.' };

  const { error } = await supabase.from('listings').delete().eq('id', listingId);
  if (error) {
    return { ok: false, message: friendlyDbError(`deleteListing by ${actor.id}`, error) };
  }

  // Audit after the fact — audit_logs.entity_id has no FK, so the trail outlives
  // the row it describes.
  const { error: auditError } = await supabase.rpc('log_audit', {
    p_action: 'delete',
    p_entity_type: 'listing',
    p_entity_id: listingId,
    p_before: before,
    p_after: null,
  });
  if (auditError) console.error('[admin/listings] log_audit failed', auditError);

  revalidateListingSurfaces(targets);

  return { ok: true, message: `Deleted “${before.name}”.` };
}
