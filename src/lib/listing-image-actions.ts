'use server';

import { createClient } from './supabase-server';
import { requireRole, requireUser, type CurrentUser } from './auth';
import { writeAudit } from './audit';
import { check, runAndReturn } from './action-flow';
import { FormError, text, uuid } from './form-data';
import { objectName, putObject, readImageUpload, removeObjects } from './media-upload';

type Supabase = Awaited<ReturnType<typeof createClient>>;

/**
 * Cover, logo and gallery images for one listing. The same forms are used from
 * the admin edit page (moderators and above, any listing) and the owner's
 * dashboard (their own listing only). The form says which it came from, but that
 * only picks the page to return to and which check to run; it grants nothing.
 * RLS (0008 listing_images, 0015 storage and media) enforces the same rules again.
 */

const KINDS = ['cover', 'logo', 'gallery'] as const;
type Kind = (typeof KINDS)[number];

// Enough for a good gallery without letting one listing fill the bucket.
const MAX_GALLERY = 20;

type Target = { user: CurrentUser; listingId: string; path: string; staff: boolean };

/** Runs before runAndReturn, because requireRole/requireUser signal by redirecting. */
async function authorise(fd: FormData): Promise<Target> {
  const listingId = uuid(fd, 'listing_id');
  if (!listingId) throw new FormError('Listing missing.');
  if (text(fd, 'context', 10) === 'admin') {
    const user = await requireRole('moderator');
    return { user, listingId, path: `/admin/listings/${listingId}`, staff: true };
  }
  const path = `/dashboard/listings/${listingId}`;
  return { user: await requireUser(path), listingId, path, staff: false };
}

/**
 * Staff writes are audited like every other admin write. Owner writes are not,
 * matching updateOwnListing: audit_logs only accepts rows from moderators (0011),
 * so an owner's insert would be silently refused by RLS anyway.
 */
async function audit(
  t: Target,
  action: Parameters<typeof writeAudit>[1],
  id: string,
  before: unknown,
  after: unknown,
) {
  if (t.staff) await writeAudit(t.user.id, action, 'listing_image', id, before, after);
}

/** Owners may manage only their own listing; staff on the admin page may manage any. */
async function loadListing(supabase: Supabase, t: Target) {
  const listing = check(
    await supabase
      .from('listings')
      .select('id, name, owner_user_id')
      .eq('id', t.listingId)
      .maybeSingle(),
  );
  if (!listing) throw new FormError('Listing not found.');
  // The admin branch already passed requireRole('moderator'). The owner branch
  // is checked here as well as by RLS: RLS would let a moderator write through
  // the dashboard form too, and that page is meant to be the owner's alone.
  if (!t.staff && listing.owner_user_id !== t.user.id) {
    throw new FormError('You can only change images on your own listing.');
  }
  return listing as { id: string; name: string; owner_user_id: string | null };
}

export async function uploadListingImage(fd: FormData) {
  const t = await authorise(fd);
  await runAndReturn(t.path, async () => {
    const supabase = await createClient();
    const listing = await loadListing(supabase, t);
    const kind = text(fd, 'kind', 10) as Kind | null;
    if (!kind || !KINDS.includes(kind)) throw new FormError('Choose cover, logo or gallery.');

    const existing = check(
      await supabase
        .from('listing_images')
        .select('id, media_id, sort_order, media(id, path, folder)')
        .eq('listing_id', listing.id)
        .eq('kind', kind)
        .order('sort_order', { ascending: false }),
    ) as unknown as ExistingImage[];
    if (kind === 'gallery' && existing.length >= MAX_GALLERY) {
      throw new FormError(`A gallery holds at most ${MAX_GALLERY} images. Remove one first.`);
    }

    const image = await readImageUpload(fd);
    // The uploader's uid leads the path: that prefix is what the storage policy
    // lets them write to, and the listing id after it is what it checks they manage.
    const path = `listings/${t.user.id}/${listing.id}/${objectName(image)}`;
    await putObject(supabase, path, image);

    const { data: media, error } = await supabase
      .from('media')
      .insert({
        path,
        alt: text(fd, 'alt', 300) ?? `${listing.name} ${kind === 'gallery' ? 'photo' : kind}`,
        width: image.width,
        height: image.height,
        size_bytes: image.size,
        mime_type: image.mime,
        folder: 'listings',
        uploaded_by: t.user.id,
      })
      .select('*')
      .single();
    if (error) {
      await removeObjects(supabase, [path]);
      throw error;
    }

    // Cover and logo are single (a partial unique index enforces it). Replacing
    // repoints the existing row at the new media, so there is never a moment with
    // two covers, nor one with none.
    const current = kind === 'gallery' ? undefined : existing[0];
    if (current) {
      const after = check(
        await supabase
          .from('listing_images')
          .update({ media_id: media.id })
          .eq('id', current.id)
          .select('*')
          .single(),
      );
      await discardMedia(supabase, current.media);
      await audit(t, 'update', current.id, current, {
        ...after,
        media,
      });
      return `Replaced the ${kind}.`;
    }

    const { data: row, error: rowError } = await supabase
      .from('listing_images')
      .insert({
        listing_id: listing.id,
        media_id: media.id,
        kind,
        sort_order: kind === 'gallery' ? (existing[0]?.sort_order ?? -1) + 1 : 0,
      })
      .select('*')
      .single();
    if (rowError) {
      await discardMedia(supabase, media);
      throw rowError;
    }
    await audit(t, 'create', row.id, null, { ...row, media });
    return kind === 'gallery' ? 'Added to the gallery.' : `Added the ${kind}.`;
  });
}

export async function removeListingImage(fd: FormData) {
  const t = await authorise(fd);
  await runAndReturn(t.path, async () => {
    const supabase = await createClient();
    const listing = await loadListing(supabase, t);
    const id = uuid(fd, 'id');
    if (!id) throw new FormError('Nothing selected.');

    // Scoped to this listing, so an id from another listing cannot be passed in.
    const before = check(
      await supabase
        .from('listing_images')
        .select('id, listing_id, kind, sort_order, media_id, media(id, path, folder)')
        .eq('id', id)
        .eq('listing_id', listing.id)
        .maybeSingle(),
    ) as unknown as (ExistingImage & { kind: Kind }) | null;
    if (!before) throw new FormError('Image not found.');

    check(await supabase.from('listing_images').delete().eq('id', id));
    await discardMedia(supabase, before.media);
    await audit(t, 'delete', id, before, null);
    return before.kind === 'gallery' ? 'Removed from the gallery.' : `Removed the ${before.kind}.`;
  });
}

type MediaRef = { id: string; path: string; folder: string | null };
type ExistingImage = {
  id: string;
  media_id: string | null;
  sort_order: number;
  media: MediaRef | null;
};

/**
 * Deletes a listing photo's media row and file once nothing uses it. Library
 * images are left alone: they belong to the media library, not the listing.
 * If RLS refuses the delete (an owner removing a photo a moderator uploaded),
 * the row stays for an editor to clean up from the media library.
 */
async function discardMedia(supabase: Supabase, media: MediaRef | null) {
  if (!media || media.folder !== 'listings') return;
  const { count } = await supabase
    .from('listing_images')
    .select('id', { count: 'exact', head: true })
    .eq('media_id', media.id);
  if (count) return;
  const { data } = await supabase.from('media').delete().eq('id', media.id).select('id');
  if (data?.length) await removeObjects(supabase, [media.path]);
}
