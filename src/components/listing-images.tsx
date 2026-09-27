import type { ReactNode } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase-server';
import { removeListingImage, uploadListingImage } from '@/lib/listing-image-actions';
import { ACCEPT_ATTR, MAX_UPLOAD_BYTES } from '@/lib/media-upload';
import { mediaUrl, type MediaItem } from '@/lib/media';
import { DangerButton, SubmitButton } from './admin-ui';

type Row = {
  id: string;
  kind: 'cover' | 'logo' | 'gallery';
  sort_order: number;
  media: MediaItem | null;
};

const HINT = `JPEG, PNG, WebP, GIF or AVIF, up to ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.`;

/**
 * The "Images" section of a listing edit page. Drops into both the admin page
 * (`context="admin"`) and the owner's dashboard (`context="owner"`); the context
 * only chooses where the actions return to and which check they run.
 *
 * Its forms sit outside the main listing form on purpose: HTML forms cannot nest,
 * and each upload is its own request, capped well below the Server Action body limit.
 */
export async function ListingImages({
  listingId,
  context,
}: {
  listingId: string;
  context: 'admin' | 'owner';
}) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('listing_images')
    .select('id, kind, sort_order, media(id, path, alt, width, height)')
    .eq('listing_id', listingId)
    .order('sort_order');
  const rows = (data ?? []) as unknown as Row[];
  const cover = rows.find((r) => r.kind === 'cover');
  const logo = rows.find((r) => r.kind === 'logo');
  const gallery = rows.filter((r) => r.kind === 'gallery');

  const hidden = (
    <>
      <input type="hidden" name="listing_id" value={listingId} />
      <input type="hidden" name="context" value={context} />
    </>
  );

  return (
    <section className="surface-card mt-8 p-5">
      <h2 className="text-lg font-semibold">Images</h2>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        The cover appears at the top of the listing page and on listing cards. Uploading a new cover
        or logo replaces the current one.
      </p>

      <div className="mt-5 grid gap-6 sm:grid-cols-2">
        {(['cover', 'logo'] as const).map((kind) => {
          const current = kind === 'cover' ? cover : logo;
          return (
            <div key={kind}>
              <h3 className="font-medium capitalize">{kind}</h3>
              {current?.media ? (
                <div className="mt-2 flex items-start gap-3">
                  <Thumb media={current.media} square={kind === 'logo'} />
                  <form action={removeListingImage}>
                    {hidden}
                    <input type="hidden" name="id" value={current.id} />
                    <DangerButton>Remove</DangerButton>
                  </form>
                </div>
              ) : (
                <p className="mt-2 text-sm text-[var(--text-muted)]">No {kind} yet.</p>
              )}
              <UploadForm kind={kind} hidden={hidden} label={current ? 'Replace' : 'Upload'} />
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        <h3 className="font-medium">Gallery</h3>
        {gallery.length > 0 ? (
          <ul className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {gallery.map((g) =>
              g.media ? (
                <li key={g.id} className="space-y-2">
                  <Thumb media={g.media} />
                  <form action={removeListingImage}>
                    {hidden}
                    <input type="hidden" name="id" value={g.id} />
                    <DangerButton>Remove</DangerButton>
                  </form>
                </li>
              ) : null,
            )}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-[var(--text-muted)]">No gallery images yet.</p>
        )}
        <UploadForm kind="gallery" hidden={hidden} label="Add to gallery" />
      </div>
    </section>
  );
}

function UploadForm({
  kind,
  hidden,
  label,
}: {
  kind: Row['kind'];
  hidden: ReactNode;
  label: string;
}) {
  return (
    <form action={uploadListingImage} className="mt-3 space-y-2">
      {hidden}
      <input type="hidden" name="kind" value={kind} />
      <label className="block text-sm">
        <span className="sr-only">Image file</span>
        <input
          type="file"
          name="file"
          required
          accept={ACCEPT_ATTR}
          className="block w-full text-sm file:mr-3 file:rounded-lg file:border file:border-[var(--border)] file:bg-[var(--surface)] file:px-3 file:py-1.5"
        />
      </label>
      <label className="block text-sm">
        <span className="sr-only">Alt text</span>
        <input
          name="alt"
          maxLength={300}
          placeholder="Describe the image (alt text)"
          className="focus:border-primary-container focus:ring-primary-container/20 h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-hidden focus:ring-2"
        />
      </label>
      <p className="text-xs text-[var(--text-muted)]">{HINT}</p>
      <SubmitButton>{label}</SubmitButton>
    </form>
  );
}

function Thumb({ media, square }: { media: MediaItem; square?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-2)] ${
        square ? 'size-24' : 'aspect-[4/3] w-full max-w-48'
      }`}
    >
      <Image
        src={mediaUrl(media.path)}
        alt={media.alt ?? ''}
        fill
        sizes="12rem"
        className={square ? 'object-contain' : 'object-cover'}
      />
    </div>
  );
}
