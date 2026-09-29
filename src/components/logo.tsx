import Image from 'next/image';
import type { BrandVM } from '@/lib/home-types';

/**
 * The site logo. An uploaded logo (Settings → brand.logo_*_media_id) is used
 * when there is one; until then the brand name is set as text, as the header
 * always did. An optional brand.name_accent suffix is drawn in the accent
 * colour. `tone` is the background it sits on.
 */

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
      className={`font-display text-xl leading-none font-bold tracking-tight ${tone === 'dark' ? 'text-white' : 'text-ink-900'} ${className}`}
    >
      {main}
      {brand.accent ? <span className="text-orange-500">{brand.accent}</span> : null}
    </span>
  );
}
