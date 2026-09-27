/**
 * Shared, side-effect-free media helpers, safe to import from any component.
 * Everything that touches uploads or the Storage API lives in media-upload.ts.
 */

/** The Supabase Storage bucket created by migration 0015. */
export const MEDIA_BUCKET = 'media';

/**
 * Public CDN URL for an object in the media bucket. The bucket is public, so no
 * signed URL is needed. Each path segment is encoded on its own so the slashes
 * that separate folders survive.
 */
export function mediaUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '');
  const encoded = path.split('/').map(encodeURIComponent).join('/');
  return `${base}/storage/v1/object/public/${MEDIA_BUCKET}/${encoded}`;
}

/** A media row as the UI needs it. */
export type MediaItem = {
  id: string;
  path: string;
  alt: string | null;
  width: number | null;
  height: number | null;
};
