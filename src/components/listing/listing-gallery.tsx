'use client';

import Image from 'next/image';
import { useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import type { ListingImage } from '@/lib/queries';
import { Icon } from '@/components/icon';

/** Viewport height left for the lightbox photo once the close bar and caption are placed. */
const PHOTO_MAX_HEIGHT = '100dvh - 10rem';

const CONTROL =
  'pointer-events-auto inline-flex size-11 items-center justify-center rounded-full text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

const altFor = (img: ListingImage, i: number, name: string) =>
  img.alt?.trim() || `${name} photo ${i + 1}`;

/**
 * The large view. With known dimensions the photo gets them (its box is sized
 * before it loads) and a width that keeps it within the viewport height;
 * otherwise it is contained in a fixed box.
 */
function LightboxPhoto({ img, alt }: { img: ListingImage; alt: string }) {
  if (img.width && img.height) {
    const ratio = (img.width / img.height).toFixed(4);
    return (
      <Image
        src={img.url}
        alt={alt}
        width={img.width}
        height={img.height}
        sizes="100vw"
        className="pointer-events-auto mx-auto h-auto object-contain"
        // Never wider than the dialog, the viewport height allows, or the file itself.
        style={{
          width: `min(100%, ${img.width}px, calc((${PHOTO_MAX_HEIGHT}) * ${ratio}))`,
        }}
      />
    );
  }
  return (
    <div
      className="relative mx-auto w-full"
      style={{ height: `min(calc(${PHOTO_MAX_HEIGHT}), 48rem)` }}
    >
      <Image
        src={img.url}
        alt={alt}
        fill
        sizes="100vw"
        className="pointer-events-auto object-contain"
      />
    </div>
  );
}

/**
 * Thumbnail grid plus a lightbox on the native <dialog>: showModal() gives the
 * focus trap, inert page, Escape to close and focus return for free.
 */
export function ListingGallery({ images, name }: { images: ListingImage[]; name: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<number | null>(null);
  const n = images.length;
  if (n === 0) return null;

  const current = index !== null && index < n ? { img: images[index], i: index } : null;

  const open = (i: number) => {
    setIndex(i);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();
  const step = (delta: number) => setIndex((i) => (i === null ? null : (i + delta + n) % n));

  const onKeyDown = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (n < 2 || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
    e.preventDefault();
    step(e.key === 'ArrowLeft' ? -1 : 1);
  };

  // The content wrapper ignores the pointer (the photo and buttons opt back in),
  // so a click on the backdrop or on the empty space around the photo lands on
  // the dialog element itself.
  const onClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) close();
  };

  return (
    <section className="mt-10">
      <h2 className="font-headline-sm text-headline-sm text-on-surface">
        Gallery{' '}
        <span className="font-body-md text-body-md text-secondary">
          ({n} {n === 1 ? 'photo' : 'photos'})
        </span>
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            aria-haspopup="dialog"
            aria-label={`Open photo ${i + 1} of ${n}`}
            onClick={() => open(i)}
            className="group focus-visible:outline-primary-container bg-surface-container-low relative aspect-[4/3] cursor-zoom-in overflow-hidden rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <Image
              src={img.url}
              alt={altFor(img, i, name)}
              fill
              sizes="(min-width: 1024px) 16rem, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        aria-label={`Photos of ${name}`}
        onClose={() => setIndex(null)}
        onKeyDown={onKeyDown}
        onClick={onClick}
        className="m-auto w-[calc(100%-2rem)] max-w-5xl bg-transparent p-0 text-white backdrop:bg-black/80"
      >
        <div className="pointer-events-none">
          <div className="flex justify-end pb-3">
            <button
              type="button"
              aria-label="Close photo viewer"
              onClick={close}
              className={`${CONTROL} bg-white/10 hover:bg-white/20`}
            >
              <Icon name="close" size={20} />
            </button>
          </div>

          <div className="relative">
            {current ? (
              <LightboxPhoto
                key={current.img.id}
                img={current.img}
                alt={altFor(current.img, current.i, name)}
              />
            ) : null}
            {n > 1 ? (
              <>
                <button
                  type="button"
                  aria-label="Previous photo"
                  onClick={() => step(-1)}
                  className={`${CONTROL} absolute top-1/2 left-2 -translate-y-1/2 bg-black/50 hover:bg-black/70`}
                >
                  {/* chevron_right mirrored: the set has no chevron_left, and a pair must match. */}
                  <Icon name="chevron_right" size={20} className="rotate-180" />
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  onClick={() => step(1)}
                  className={`${CONTROL} absolute top-1/2 right-2 -translate-y-1/2 bg-black/50 hover:bg-black/70`}
                >
                  <Icon name="chevron_right" size={20} />
                </button>
              </>
            ) : null}
          </div>

          <p
            aria-live="polite"
            className="font-body-sm text-body-sm mt-3 text-center text-white/80"
          >
            {current ? (
              <>
                <span className="font-medium text-white tabular-nums">{`${current.i + 1} / ${n}`}</span>
                <span aria-hidden> · </span>
                {altFor(current.img, current.i, name)}
              </>
            ) : null}
          </p>
        </div>
      </dialog>
    </section>
  );
}
