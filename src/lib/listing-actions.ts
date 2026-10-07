'use server';

import { createClient } from './supabase-server';
import { requireRole, requireUser } from './auth';
import { writeAudit } from './audit';
import { check, runAndReturn } from './action-flow';
import { FormError, bool, text, uuid } from './form-data';
import { freeSlug, parseHours, parseListingForm, writeHours } from './listing-input';
import { readOptionalImageUpload, type ValidImage } from './media-upload';
import {
  discardMedia,
  storeListingMedia,
  type MediaRow,
  type Supabase,
} from './listing-image-store';
import { LISTING_IMAGE_MAX_BYTES, LOGO_FIELD, PHOTO_FIELDS } from './listing-image-limits';

const STATUSES = ['approved', 'pending', 'draft', 'rejected', 'suspended'] as const;
const VERIFICATIONS = ['unverified', 'pending', 'verified', 'rejected'] as const;

function pick<T extends readonly string[]>(
  value: string | null,
  allowed: T,
  label: string,
): T[number] {
  if (value && (allowed as readonly string[]).includes(value)) return value as T[number];
  throw new FormError(`Choose a ${label}.`);
}

/** Admin create/update. Staff may set every field, including publishing ones. */
export async function saveListingAsStaff(fd: FormData) {
  const user = await requireRole('moderator');
  const id = uuid(fd, 'id');
  await runAndReturn(id ? `/admin/listings/${id}` : '/admin/listings', async () => {
    const supabase = await createClient();
    const base = await parseListingForm(fd, supabase);
    const hours = parseHours(fd);
    const status = pick(text(fd, 'status', 20), STATUSES, 'status');

    const row = {
      ...base,
      status,
      verification: pick(text(fd, 'verification', 20), VERIFICATIONS, 'verification'),
      is_featured: bool(fd, 'is_featured'),
      seo_title: text(fd, 'seo_title', 200),
      seo_description: text(fd, 'seo_description', 300),
      slug: await freeSlug(supabase, text(fd, 'slug', 120) ?? base.name, id ?? undefined),
      last_updated_by: user.id,
    };

    if (id) {
      const before = check(await supabase.from('listings').select('*').eq('id', id).maybeSingle());
      if (!before) throw new FormError('Listing not found.');
      const patch = {
        ...row,
        // Publishing stamps the date once; re-approving must not reorder the feed.
        published_at:
          status === 'approved' && !before.published_at
            ? new Date().toISOString()
            : before.published_at,
      };
      const after = check(
        await supabase.from('listings').update(patch).eq('id', id).select('*').maybeSingle(),
      );
      await writeHours(supabase, id, hours);
      await writeAudit(user.id, 'update', 'listing', id, before, after);
      return `Saved ${row.name}.`;
    }

    const after = check(
      await supabase
        .from('listings')
        .insert({
          ...row,
          created_by: user.id,
          published_at: status === 'approved' ? new Date().toISOString() : null,
        })
        .select('*')
        .single(),
    );
    await writeHours(supabase, after.id, hours);
    await writeAudit(user.id, 'create', 'listing', after.id, null, after);
    return `Added ${row.name}.`;
  });
}

export async function deleteListing(fd: FormData) {
  const user = await requireRole('admin');
  await runAndReturn('/admin/listings', async () => {
    const id = uuid(fd, 'id');
    if (!id) throw new FormError('Nothing selected.');
    const supabase = await createClient();
    const before = check(await supabase.from('listings').select('*').eq('id', id).maybeSingle());
    if (!before) throw new FormError('Listing not found.');
    check(await supabase.from('listings').delete().eq('id', id));
    await writeAudit(user.id, 'delete', 'listing', id, before, null);
    return `Deleted ${before.name}.`;
  });
}

// ---------------------------------------------------------------------------
// Business owners
// ---------------------------------------------------------------------------
// Owners submit as 'pending' and can never publish, verify or feature their own
// listing. The RLS insert/update policies enforce the same thing at the database.

export async function submitOwnListing(fd: FormData) {
  const user = await requireUser('/dashboard/listings/new');
  await runAndReturn('/dashboard', async () => {
    const supabase = await createClient();
    const base = await parseListingForm(fd, supabase);
    const hours = parseHours(fd);
    // Every image is validated before anything is written, so a bad file is
    // reported with nothing created rather than leaving a half-made listing.
    const images = await readNewListingImages(fd);
    const after = check(
      await supabase
        .from('listings')
        .insert({
          ...base,
          slug: await freeSlug(supabase, base.name),
          owner_user_id: user.id,
          created_by: user.id,
          last_updated_by: user.id,
          status: 'pending',
          verification: 'unverified',
        })
        .select('id, name')
        .single(),
    );
    if (!after) throw new FormError('The listing could not be saved.');
    await writeHours(supabase, after.id, hours);
    const failed = await storeNewListingImages(supabase, user.id, after, images);
    return `Thanks — ${after.name} was submitted and will appear once it has been reviewed.${failed}`;
  });
}

type NewListingImages = { logo: ValidImage | null; photos: ValidImage[] };

/** The optional logo and photos on the new-listing form; empty inputs are skipped. */
async function readNewListingImages(fd: FormData): Promise<NewListingImages> {
  const logo = await readOptionalImageUpload(fd, LOGO_FIELD, LISTING_IMAGE_MAX_BYTES, 'Logo');
  const photos: ValidImage[] = [];
  for (const [i, field] of PHOTO_FIELDS.entries()) {
    const photo = await readOptionalImageUpload(
      fd,
      field,
      LISTING_IMAGE_MAX_BYTES,
      `Photo ${i + 1}`,
    );
    if (photo) photos.push(photo);
  }
  return { logo, photos };
}

/**
 * Stores the new listing's images, one at a time in a fixed order: logo, then
 * photos as they appear on the form. This runs after the listing exists, as the
 * storage policy checks the uploader manages that listing id.
 *
 * The listing is already submitted by now, so a failed image does not fail the
 * request: it is cleaned up as far as possible and reported in the returned
 * suffix for the success message ('' when everything was saved).
 */
async function storeNewListingImages(
  supabase: Supabase,
  uploaderId: string,
  listing: { id: string; name: string },
  { logo, photos }: NewListingImages,
): Promise<string> {
  type Row = { kind: 'cover' | 'logo' | 'gallery'; sort_order: number };
  type Job = { image: ValidImage; alt: string; rows: Row[] };

  const jobs: Job[] = [];
  if (logo) {
    jobs.push({
      image: logo,
      alt: `${listing.name} logo`,
      rows: [{ kind: 'logo', sort_order: 0 }],
    });
  }
  photos.forEach((image, i) => {
    const rows: Row[] = [{ kind: 'gallery', sort_order: i }];
    // The first photo is also the cover, so cards and the page hero have an
    // image. Both rows point at one media row: no second upload, no extra bytes.
    if (i === 0) rows.push({ kind: 'cover', sort_order: 0 });
    jobs.push({ image, alt: `${listing.name} photo ${i + 1}`, rows });
  });

  let failures = 0;
  let reason: string | null = null;
  for (const job of jobs) {
    let media: MediaRow | null = null;
    try {
      media = await storeListingMedia(supabase, {
        uploaderId,
        listing,
        image: job.image,
        alt: job.alt,
      });
      const mediaId = media.id;
      check(
        await supabase
          .from('listing_images')
          .insert(job.rows.map((row) => ({ listing_id: listing.id, media_id: mediaId, ...row }))),
      );
    } catch (e) {
      failures += 1;
      reason ??= e instanceof FormError ? e.message.replace(/\.$/, '') : 'storage error';
      // storeListingMedia cleans up after itself; a stored media row whose
      // listing_images insert failed is unused, so remove it and its file.
      if (media) await discardMedia(supabase, media).catch(() => undefined);
    }
  }
  if (failures === 0) return '';
  const what =
    failures === 1 ? '1 image could not be saved' : `${failures} images could not be saved`;
  return ` ${what} (${reason}) — you can add ${failures === 1 ? 'it' : 'them'} from the listing's edit page.`;
}

export async function updateOwnListing(fd: FormData) {
  const user = await requireUser('/dashboard');
  const id = uuid(fd, 'id');
  await runAndReturn(id ? `/dashboard/listings/${id}` : '/dashboard', async () => {
    if (!id) throw new FormError('Nothing selected.');
    const supabase = await createClient();
    const { data: own } = await supabase
      .from('listings')
      .select('id, owner_user_id')
      .eq('id', id)
      .maybeSingle();
    if (!own || own.owner_user_id !== user.id) throw new FormError('Listing not found.');

    const base = await parseListingForm(fd, supabase);
    const hours = parseHours(fd);
    check(
      await supabase
        .from('listings')
        .update({ ...base, last_updated_by: user.id })
        .eq('id', id)
        .eq('owner_user_id', user.id),
    );
    await writeHours(supabase, id, hours);
    return `Saved ${base.name}.`;
  });
}
