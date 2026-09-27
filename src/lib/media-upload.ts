import 'server-only';
import { FormError } from './form-data';
import { MEDIA_BUCKET } from './media';
import type { createClient } from './supabase-server';

type Supabase = Awaited<ReturnType<typeof createClient>>;

/**
 * Upload validation and Storage calls shared by the media library and listing
 * images. Lives outside the 'use server' files so none of it becomes a callable
 * endpoint on its own.
 */

// Vercel caps a function request body at 4.5 MB, and a Server Action receives
// the whole multipart body, so 4 MB of file leaves room for the form overhead.
// The bucket's own 5 MB limit (migration 0015) is only a backstop.
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

// Beyond this the image optimiser does a lot of work for no visible gain, and a
// tiny file claiming huge dimensions is the classic decompression bomb.
const MAX_DIMENSION = 10_000;

type ImageType = 'jpeg' | 'png' | 'webp' | 'gif' | 'avif';

const MIME: Record<ImageType, string> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  avif: 'image/avif',
};

// The extension allowlist. SVG is deliberately absent: it can carry script, and
// the bucket serves files from a public origin.
const EXTENSIONS: Record<string, ImageType> = {
  jpg: 'jpeg',
  jpeg: 'jpeg',
  png: 'png',
  webp: 'webp',
  gif: 'gif',
  avif: 'avif',
};

const CANONICAL_EXT: Record<ImageType, string> = {
  jpeg: 'jpg',
  png: 'png',
  webp: 'webp',
  gif: 'gif',
  avif: 'avif',
};

export const ACCEPT_ATTR = Object.values(MIME).join(',');

export type ValidImage = {
  bytes: Uint8Array;
  mime: string;
  ext: string;
  size: number;
  width: number | null;
  height: number | null;
};

/**
 * Reads and validates an uploaded image. Neither the file name nor the browser's
 * mime type is trusted: the extension must be on the allowlist AND agree with the
 * type detected from the file's own magic bytes. The stored name is generated
 * later, so the original name is only ever used for that extension check.
 */
export async function readImageUpload(fd: FormData, key = 'file'): Promise<ValidImage> {
  const file = fd.get(key);
  if (!(file instanceof File) || file.size === 0) throw new FormError('Choose an image to upload.');
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new FormError(`Images must be ${MAX_UPLOAD_BYTES / 1024 / 1024} MB or smaller.`);
  }

  const dot = file.name.lastIndexOf('.');
  const claimed = dot >= 0 ? EXTENSIONS[file.name.slice(dot + 1).toLowerCase()] : undefined;
  if (!claimed) throw new FormError('Only JPEG, PNG, WebP, GIF or AVIF images can be uploaded.');

  const bytes = new Uint8Array(await file.arrayBuffer());
  const sniffed = sniffImage(bytes);
  if (!sniffed) throw new FormError('That file is not a readable image.');
  if (sniffed.type !== claimed) {
    throw new FormError('The file extension does not match what the file contains.');
  }
  if ((sniffed.width ?? 0) > MAX_DIMENSION || (sniffed.height ?? 0) > MAX_DIMENSION) {
    throw new FormError(`Images must be at most ${MAX_DIMENSION} pixels on each side.`);
  }

  return {
    bytes,
    mime: MIME[sniffed.type],
    ext: CANONICAL_EXT[sniffed.type],
    size: file.size,
    width: sniffed.width,
    height: sniffed.height,
  };
}

/** A fresh, unguessable object name. Uploads never overwrite, so caching can be permanent. */
export function objectName(image: ValidImage): string {
  return `${crypto.randomUUID()}.${image.ext}`;
}

export async function putObject(supabase: Supabase, path: string, image: ValidImage) {
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, image.bytes, {
    contentType: image.mime,
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) throw new FormError(`The upload was refused: ${error.message}`);
}

/**
 * Best-effort removal. Callers delete the database row first, since that is what
 * the site renders from; a file left behind is only wasted storage, whereas a
 * row pointing at a missing file is a broken image. Returns false on failure so
 * the caller can say so.
 */
export async function removeObjects(supabase: Supabase, paths: string[]): Promise<boolean> {
  if (paths.length === 0) return true;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove(paths);
  return !error;
}

// ---------------------------------------------------------------------------
// Magic-byte detection and dimensions
// ---------------------------------------------------------------------------

type Sniffed = { type: ImageType; width: number | null; height: number | null };

function ascii(b: Uint8Array, at: number, len: number): string {
  return String.fromCharCode(...b.subarray(at, at + len));
}

function sniffImage(b: Uint8Array): Sniffed | null {
  if (b.length < 16) return null;
  const view = new DataView(b.buffer, b.byteOffset, b.byteLength);

  if (b[0] === 0x89 && ascii(b, 1, 3) === 'PNG') {
    // IHDR is always the first chunk.
    return b.length >= 24
      ? { type: 'png', width: view.getUint32(16), height: view.getUint32(20) }
      : null;
  }
  if (ascii(b, 0, 6) === 'GIF87a' || ascii(b, 0, 6) === 'GIF89a') {
    return { type: 'gif', width: view.getUint16(6, true), height: view.getUint16(8, true) };
  }
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) {
    return { type: 'jpeg', ...jpegSize(b, view) };
  }
  if (ascii(b, 0, 4) === 'RIFF' && ascii(b, 8, 4) === 'WEBP') {
    return { type: 'webp', ...webpSize(b, view) };
  }
  if (ascii(b, 4, 4) === 'ftyp' && isAvifBrand(b, view)) {
    return { type: 'avif', ...avifSize(b, view) };
  }
  return null;
}

type Size = { width: number | null; height: number | null };
const UNKNOWN: Size = { width: null, height: null };

/** Walks the JPEG segments to the first start-of-frame marker. */
function jpegSize(b: Uint8Array, view: DataView): Size {
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) return UNKNOWN;
    const marker = b[i + 1];
    if (marker === 0xff) {
      i += 1; // fill byte
      continue;
    }
    // SOF0-SOF15, excluding DHT (C4), JPG (C8) and DAC (CC), carry the size.
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: view.getUint16(i + 5), width: view.getUint16(i + 7) };
    }
    // Standalone markers have no length field.
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) {
      i += 2;
      continue;
    }
    i += 2 + view.getUint16(i + 2);
  }
  return UNKNOWN;
}

function webpSize(b: Uint8Array, view: DataView): Size {
  if (b.length < 30) return UNKNOWN;
  const chunk = ascii(b, 12, 4);
  if (chunk === 'VP8 ') {
    return { width: view.getUint16(26, true) & 0x3fff, height: view.getUint16(28, true) & 0x3fff };
  }
  if (chunk === 'VP8L') {
    const bits = view.getUint32(21, true);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (chunk === 'VP8X') {
    const u24 = (at: number) => b[at] | (b[at + 1] << 8) | (b[at + 2] << 16);
    return { width: u24(24) + 1, height: u24(27) + 1 };
  }
  return UNKNOWN;
}

/** The ftyp box lists a major brand and compatible brands; any avif/avis counts. */
function isAvifBrand(b: Uint8Array, view: DataView): boolean {
  const boxEnd = Math.min(view.getUint32(0), b.length);
  for (let at = 8; at + 4 <= boxEnd; at += 4) {
    if (at === 12) continue; // minor_version, not a brand
    const brand = ascii(b, at, 4);
    if (brand === 'avif' || brand === 'avis') return true;
  }
  return false;
}

/** Reads the first image-spatial-extents ('ispe') property, which is the primary image's. */
function avifSize(b: Uint8Array, view: DataView): Size {
  const limit = Math.min(b.length - 16, 64 * 1024);
  for (let i = 0; i < limit; i++) {
    if (b[i] === 0x69 && ascii(b, i, 4) === 'ispe') {
      return { width: view.getUint32(i + 8), height: view.getUint32(i + 12) };
    }
  }
  return UNKNOWN;
}
