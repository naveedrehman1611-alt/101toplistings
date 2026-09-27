import Image from 'next/image';
import type { BrandVM } from '@/lib/home-types';

/**
 * The site logo. An uploaded logo (Settings → brand.logo_*_media_id) is used
 * when there is one; until then the brand name is drawn as a wordmark beside a
 * pin-on-globe mark, with the brand.name_accent suffix ("Dir") in orange, as
 * on the reference. `tone` is the background it sits on.
 */

export function LogoMark({ className = 'size-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden focusable="false">
      <circle
        cx="20"
        cy="21"
        r="17"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="2"
      />
      <path
        d="M4 21h32M20 4c5.5 5 5.5 29 0 34M20 4c-5.5 5-5.5 29 0 34"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.3"
        strokeWidth="1.5"
      />
      <path
        d="M24 5.5a8.5 8.5 0 0 0-8.5 8.5c0 6.4 8.5 15 8.5 15s8.5-8.6 8.5-15A8.5 8.5 0 0 0 24 5.5z"
        fill="#f58a1f"
      />
      <circle cx="24" cy="14" r="3.2" fill="#fff" />
    </svg>
  );
}

export function Logo({
  brand,
  tone,
  priority = false,
  className = '',
}: {
  brand: BrandVM;
  tone: 'light' | 'dark';
  /** Above-the-fold logos load eagerly. */
  priority?: boolean;
  className?: string;
}) {
  const upload = tone === 'dark' ? brand.logoOnDark : brand.logoOnLight;
  if (upload) {
    const height = 44;
    const width =
      upload.width && upload.height ? Math.round((upload.width / upload.height) * height) : 180;
    return (
      <Image
        src={upload.url}
        alt={upload.alt}
        width={width}
        height={height}
        priority={priority}
        sizes={`${width}px`}
        className={`h-11 w-auto ${className}`}
      />
    );
  }

  const main = brand.accent ? brand.name.slice(0, -brand.accent.length) : brand.name;
  return (
    <span
      className={`inline-flex items-center gap-2 ${tone === 'dark' ? 'text-white' : 'text-ink-900'} ${className}`}
    >
      <LogoMark />
      <span className="font-display text-[1.375rem] leading-none font-semibold tracking-tight">
        {main}
        {brand.accent ? <span className="text-orange-500">{brand.accent}</span> : null}
      </span>
    </span>
  );
}
