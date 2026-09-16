'use client';

/*
 * Images never travel through the Server Action.
 *
 * A Server Action request is capped at 1 MB by default (see "Security → Body
 * size limit" in node_modules/next/dist/docs/01-app/02-guides/server-actions.md)
 * and the `listing-media` bucket accepts files up to 5 MiB, so routing uploads
 * through saveListing would reject four fifths of the legal range. Instead the
 * browser uploads straight to Supabase Storage with the anon key + the admin's
 * own session, inserts the `media` row, and hands only the resulting media_id
 * back into the form as a hidden field. The action then sees a handful of uuids.
 */

import Image from 'next/image';
import { useCallback, useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Input, Select } from '@/components/form';
import { IMAGE_KINDS, type ImageKind } from '@/lib/listing-schema';

const BUCKET = 'listing-media';

/** Mirrors storage.buckets.allowed_mime_types and file_size_limit from 0014. */
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] as const;
const MAX_BYTES = 5 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

export type AttachedImage = {
  mediaId: string;
  path: string;
  alt: string;
  kind: ImageKind;
};

const KIND_OPTIONS = IMAGE_KINDS.map((kind) => ({
  value: kind,
  label: kind === 'cover' ? 'Cover' : kind === 'logo' ? 'Logo' : 'Gallery',
}));

function humanSize(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Natural dimensions, for the `media` row. Best effort — never blocks an upload. */
async function readDimensions(file: File): Promise<{ width: number; height: number } | null> {
  try {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  } catch {
    return null;
  }
}

export function ImageManager({
  initial,
  error,
}: {
  initial: AttachedImage[];
  error?: string | string[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const fileRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<AttachedImage[]>(initial);
  const [alt, setAlt] = useState('');
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const publicUrl = useCallback(
    (path: string) => supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl,
    [supabase],
  );

  const upload = useCallback(async () => {
    setFailure(null);
    const file = fileRef.current?.files?.[0];

    // Validate before the request so the admin gets the real reason instead of a
    // bare 400 from Storage's own bucket checks.
    if (!file) {
      setFailure('Choose an image file first.');
      return;
    }
    if (alt.trim().length < 3) {
      setFailure('Describe the image first — alt text is required on every image.');
      return;
    }
    if (!ALLOWED_MIME.includes(file.type as (typeof ALLOWED_MIME)[number])) {
      setFailure(`${file.type || 'That file type'} is not allowed. Use JPEG, PNG, WebP or AVIF.`);
      return;
    }
    if (file.size > MAX_BYTES) {
      setFailure(`That file is ${humanSize(file.size)}. The limit is 5.0 MB.`);
      return;
    }

    setBusy(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const extension = EXTENSIONS[file.type] ?? 'bin';
      // Random name, not the original: two admins uploading "logo.png" must not
      // collide, and media.path is UNIQUE.
      const path = `listings/${crypto.randomUUID()}.${extension}`;

      const uploaded = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type, cacheControl: '31536000' });
      if (uploaded.error) {
        setFailure(`Upload failed: ${uploaded.error.message}`);
        return;
      }

      const dimensions = await readDimensions(file);
      const inserted = await supabase
        .from('media')
        .insert({
          path,
          alt: alt.trim(),
          width: dimensions?.width ?? null,
          height: dimensions?.height ?? null,
          size_bytes: file.size,
          mime_type: file.type,
          folder: 'listings',
          uploaded_by: user?.id ?? null,
        })
        .select('id')
        .single();

      if (inserted.error || !inserted.data) {
        // The object is already in the bucket; without a media row it would be
        // an orphan, so clean it up rather than leaving a file nothing points at.
        await supabase.storage.from(BUCKET).remove([path]);
        setFailure(`Could not record the image: ${inserted.error?.message ?? 'unknown error'}`);
        return;
      }

      setImages((current) => [
        ...current,
        { mediaId: inserted.data.id as string, path, alt: alt.trim(), kind: 'gallery' },
      ]);
      setAlt('');
      if (fileRef.current) fileRef.current.value = '';
    } finally {
      setBusy(false);
    }
  }, [alt, supabase]);

  /** listing_images has partial UNIQUEs on cover and logo, so promoting one demotes the other. */
  const setKind = useCallback((mediaId: string, kind: ImageKind) => {
    setImages((current) =>
      current.map((image) => {
        if (image.mediaId === mediaId) return { ...image, kind };
        if (kind !== 'gallery' && image.kind === kind) return { ...image, kind: 'gallery' };
        return image;
      }),
    );
  }, []);

  const move = useCallback((index: number, delta: number) => {
    setImages((current) => {
      const target = index + delta;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      const [moved] = next.splice(index, 1);
      next.splice(target, 0, moved);
      return next;
    });
  }, []);

  /* Detaching only removes the listing_images row on the next save. The media
     row and the object stay, because the same image may be used elsewhere. */
  const detach = useCallback((mediaId: string) => {
    setImages((current) => current.filter((image) => image.mediaId !== mediaId));
  }, []);

  const messages = Array.isArray(error) ? error : error ? [error] : [];

  return (
    <div className="flex flex-col gap-5">
      {/* The hidden pairs are what saveListing actually reads. Document order is
          the gallery order, which is why sort_order is never posted. */}
      {images.map((image) => (
        <span key={`${image.mediaId}-fields`} hidden>
          <input type="hidden" name="image_media_id" value={image.mediaId} />
          <input type="hidden" name="image_kind" value={image.kind} />
        </span>
      ))}

      {messages.length > 0 ? (
        <p role="alert" className="text-xs font-medium text-red-700">
          {messages.join(' ')}
        </p>
      ) : null}

      <div className="rounded-lg border border-dashed border-[var(--border)] p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="image-file" className="text-sm font-medium">
              Image file
            </label>
            <input
              id="image-file"
              ref={fileRef}
              type="file"
              accept={ALLOWED_MIME.join(',')}
              className="text-sm file:mr-3 file:rounded-lg file:border file:border-[var(--border)] file:bg-[var(--surface-2)] file:px-3 file:py-2 file:text-sm"
            />
            <p className="text-xs text-[var(--text-muted)]">JPEG, PNG, WebP or AVIF. Up to 5 MB.</p>
          </div>

          <Input
            name="image_alt_draft"
            label="Alt text"
            required
            value={alt}
            onChange={(event) => setAlt(event.currentTarget.value)}
            maxLength={160}
            hint="Describe what is in the photo. Screen readers and Google both read this."
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={upload}
            disabled={busy}
            className="focus-visible:outline-brand-700 bg-brand-700 hover:bg-brand-800 inline-flex h-10 items-center rounded-lg px-4 text-sm font-medium text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Uploading…' : 'Upload image'}
          </button>
          {failure ? (
            <p role="alert" className="text-xs font-medium text-red-700">
              {failure}
            </p>
          ) : null}
        </div>
      </div>

      {images.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">No images attached yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {images.map((image, index) => (
            <li
              key={image.mediaId}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-[var(--border)] p-3"
            >
              <Image
                src={publicUrl(image.path)}
                alt={image.alt}
                width={64}
                height={64}
                unoptimized
                className="size-16 shrink-0 rounded-md object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{image.alt}</p>
                <p className="truncate text-xs text-[var(--text-muted)]">{image.path}</p>
              </div>
              <Select
                name={`image_kind_ui_${image.mediaId}`}
                id={`image-kind-${image.mediaId}`}
                label="Role"
                options={KIND_OPTIONS}
                value={image.kind}
                onChange={(event) => setKind(image.mediaId, event.currentTarget.value as ImageKind)}
                className="w-32"
              />
              <div className="flex items-center gap-1">
                <IconButton label="Move up" onClick={() => move(index, -1)} disabled={index === 0}>
                  ↑
                </IconButton>
                <IconButton
                  label="Move down"
                  onClick={() => move(index, 1)}
                  disabled={index === images.length - 1}
                >
                  ↓
                </IconButton>
                <IconButton label="Detach image" onClick={() => detach(image.mediaId)}>
                  ×
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-[var(--text-muted)]">
        At most one cover and one logo per listing — promoting an image demotes the previous one
        automatically. Gallery order follows the list above.
      </p>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="focus-visible:outline-brand-700 inline-flex size-9 items-center justify-center rounded-lg border border-[var(--border)] text-sm transition-colors hover:bg-[var(--surface-2)] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
