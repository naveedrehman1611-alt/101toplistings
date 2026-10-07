import 'server-only';
import { objectName, putObject, removeObjects, type ValidImage } from './media-upload';
import type { createClient } from './supabase-server';

/**
 * Storage and media-row steps for listing images, shared by the edit page's
 * upload action and the new-listing action. Deliberately not 'use server':
 * every export of such a file is a public endpoint, and these trust their
 * caller to have checked who may write to the listing.
 */

export type Supabase = Awaited<ReturnType<typeof createClient>>;

/** The media columns needed to decide whether, and what, to clean up. */
export type MediaRef = { id: string; path: string; folder: string | null };

export type MediaRow = MediaRef & {
  alt: string | null;
  width: number | null;
  height: number | null;
  size_bytes: number | null;
  mime_type: string | null;
  uploaded_by: string | null;
  created_at: string;
};

const MEDIA_COLUMNS =
  'id, path, alt, width, height, size_bytes, mime_type, folder, uploaded_by, created_at';

/**
 * Uploads a validated image for a listing and records its media row. The
 * uploader's uid leads the path: that prefix is what the storage policy lets
 * them write to, and the listing id after it is what it checks they manage.
 * If the row cannot be written the file is removed again (nothing could find
 * it), and the error is thrown.
 */
export async function storeListingMedia(
  supabase: Supabase,
  args: {
    uploaderId: string;
    listing: { id: string; name: string };
    image: ValidImage;
    alt: string;
  },
): Promise<MediaRow> {
  const { uploaderId, listing, image, alt } = args;
  const path = `listings/${uploaderId}/${listing.id}/${objectName(image)}`;
  await putObject(supabase, path, image);

  const { data, error } = await supabase
    .from('media')
    .insert({
      path,
      alt,
      width: image.width,
      height: image.height,
      size_bytes: image.size,
      mime_type: image.mime,
      folder: 'listings',
      uploaded_by: uploaderId,
    })
    .select(MEDIA_COLUMNS)
    .single();
  if (error) {
    await removeObjects(supabase, [path]);
    throw error;
  }
  return data as MediaRow;
}

/**
 * Deletes a listing photo's media row and file once nothing uses it. Library
 * images are left alone: they belong to the media library, not the listing.
 * If RLS refuses the delete (an owner removing a photo a moderator uploaded),
 * the row stays for an editor to clean up from the media library.
 */
export async function discardMedia(supabase: Supabase, media: MediaRef | null) {
  if (!media || media.folder !== 'listings') return;
  const { count } = await supabase
    .from('listing_images')
    .select('id', { count: 'exact', head: true })
    .eq('media_id', media.id);
  if (count) return;
  const { data } = await supabase.from('media').delete().eq('id', media.id).select('id');
  if (data?.length) await removeObjects(supabase, [media.path]);
}
