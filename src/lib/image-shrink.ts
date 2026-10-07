import { LISTING_IMAGE_MAX_BYTES, LOGO_MAX_EDGE, PHOTO_MAX_EDGE } from './listing-image-limits';

/**
 * Browser-only: shrinks a picked logo or photo before the form posts it, so the
 * Server Action body stays under Vercel's 4.5 MB cap and Storage holds no more
 * bytes than the site can show. The server re-checks everything regardless.
 *
 * The algorithm is fixed so the same picture always comes out the same:
 * 1. Decode, honouring EXIF rotation, and fit inside maxEdge×maxEdge (never upscale).
 * 2. A PNG or WebP already within both the size and byte caps is returned untouched.
 * 3. Otherwise encode WebP down a fixed quality ladder until it fits. Browsers
 *    that cannot encode WebP (Safari) fall back to PNG for logos, which keeps
 *    transparency, and JPEG for photos.
 * 4. PNG has no quality knob, so it steps the dimensions down by 0.75 instead.
 *
 * Re-encoding also drops EXIF metadata, GPS position included, which owners
 * rarely mean to publish with a photo of their shop.
 */

export type ShrinkVariant = 'logo' | 'photo';

export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/avif';

const ACCEPTED = new Set(IMAGE_ACCEPT.split(','));

// Everything else is always re-encoded. JPEG because it is what phone cameras
// write, GPS position and all, and passing a small one through would publish
// that. GIF to get a modern format (an animation is flattened to its first
// frame, which is fine for a logo or photo), AVIF because not every browser
// that views the site can display it.
const PASS_THROUGH = new Set(['image/png', 'image/webp']);

// Some platforms (Chrome on Windows reading the registry) report an empty type
// for .webp or .avif files, so the extension stands in when the type is missing.
const TYPE_BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  avif: 'image/avif',
};

const QUALITY_LADDER = [0.82, 0.72, 0.62, 0.5] as const;
const PNG_SCALE_STEP = 0.75;
const PNG_MAX_RETRIES = 3;

type OutputType = 'image/webp' | 'image/png' | 'image/jpeg';

const EXT: Record<OutputType, string> = {
  'image/webp': '.webp',
  'image/png': '.png',
  'image/jpeg': '.jpg',
};

const MAX_MB = LISTING_IMAGE_MAX_BYTES / 1024 / 1024;

export async function shrinkImage(file: File, variant: ShrinkVariant): Promise<File> {
  const type = file.type || TYPE_BY_EXT[extensionOf(file.name)] || '';
  if (!ACCEPTED.has(type)) {
    throw new Error('Only JPEG, PNG, WebP, GIF or AVIF images can be uploaded.');
  }
  const maxEdge = variant === 'logo' ? LOGO_MAX_EDGE : PHOTO_MAX_EDGE;
  const maxBytes = LISTING_IMAGE_MAX_BYTES;

  const source = await decode(file);
  try {
    const srcW = source instanceof HTMLImageElement ? source.naturalWidth : source.width;
    const srcH = source instanceof HTMLImageElement ? source.naturalHeight : source.height;
    if (!srcW || !srcH) throw new Error('That file is not a readable image.');

    if (file.size <= maxBytes && Math.max(srcW, srcH) <= maxEdge && PASS_THROUGH.has(type)) {
      return file;
    }

    const scale = Math.min(1, maxEdge / Math.max(srcW, srcH));
    let w = Math.max(1, Math.round(srcW * scale));
    let h = Math.max(1, Math.round(srcH * scale));

    let canvas = draw(source, w, h, false);
    const first = await encode(canvas, 'image/webp', QUALITY_LADDER[0]);

    // Safari ignores an unsupported type and hands back PNG, so check what came out.
    if (first.type === 'image/webp') {
      for (let i = 0; i < QUALITY_LADDER.length; i++) {
        const blob = i === 0 ? first : await encode(canvas, 'image/webp', QUALITY_LADDER[i]);
        if (blob.size <= maxBytes) return toFile(blob, 'image/webp', file.name);
      }
    } else if (variant === 'photo') {
      // JPEG has no alpha, so transparent areas would otherwise turn black.
      canvas = draw(source, w, h, true);
      for (const quality of QUALITY_LADDER) {
        const blob = await encode(canvas, 'image/jpeg', quality);
        if (blob.size <= maxBytes) return toFile(blob, 'image/jpeg', file.name);
      }
    } else {
      let blob = first.type === 'image/png' ? first : await encode(canvas, 'image/png');
      for (let retry = 0; ; retry++) {
        if (blob.size <= maxBytes) return toFile(blob, 'image/png', file.name);
        if (retry === PNG_MAX_RETRIES) break;
        w = Math.max(1, Math.round(w * PNG_SCALE_STEP));
        h = Math.max(1, Math.round(h * PNG_SCALE_STEP));
        canvas = draw(source, w, h, false);
        blob = await encode(canvas, 'image/png');
      }
    }

    throw new Error(`This image is still over ${MAX_MB} MB after resizing. Try a smaller picture.`);
  } finally {
    if (!(source instanceof HTMLImageElement)) source.close();
  }
}

type Source = ImageBitmap | HTMLImageElement;
type Canvas = OffscreenCanvas | HTMLCanvasElement;

async function decode(file: File): Promise<Source> {
  try {
    return await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    // Older Safari rejects the options bag or some formats; an <img> still decodes them.
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } catch {
    throw new Error('That file is not a readable image.');
  } finally {
    // Once decode() resolves the pixels are held by the element, not the URL.
    URL.revokeObjectURL(url);
  }
}

function draw(source: Source, w: number, h: number, opaque: boolean): Canvas {
  const canvas: Canvas =
    typeof OffscreenCanvas !== 'undefined'
      ? new OffscreenCanvas(w, h)
      : Object.assign(document.createElement('canvas'), { width: w, height: h });
  const ctx = canvas.getContext('2d') as
    OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D | null;
  if (!ctx) throw new Error('Your browser could not resize this image.');
  if (opaque) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, w, h);
  return canvas;
}

function encode(canvas: Canvas, type: OutputType, quality?: number): Promise<Blob> {
  if (typeof OffscreenCanvas !== 'undefined' && canvas instanceof OffscreenCanvas) {
    return canvas.convertToBlob({ type, quality });
  }
  return new Promise((resolve, reject) => {
    (canvas as HTMLCanvasElement).toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error('Your browser could not resize this image.')),
      type,
      quality,
    );
  });
}

function extensionOf(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : '';
}

/** The server checks the extension against the file's magic bytes, so it must match `type`. */
function toFile(blob: Blob, type: OutputType, originalName: string): File {
  const dot = originalName.lastIndexOf('.');
  const stem = dot > 0 ? originalName.slice(0, dot) : originalName;
  const base =
    stem
      .replace(/[^A-Za-z0-9._-]+/g, '-')
      .replace(/^[.-]+/, '')
      .slice(0, 60) || 'image';
  return new File([blob], base + EXT[type], { type, lastModified: Date.now() });
}
