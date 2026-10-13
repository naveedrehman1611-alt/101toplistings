import Image from 'next/image';
import type { ImageValue } from '@/lib/content/schema';

/**
 * The RankYouSite logo, drawn as SVG in /public (text is outlined, so it needs
 * no web font). `full` is the whole lockup with the LIST • RANK • GROW line;
 * `compact` drops that line, which is unreadable at header size. `dark` is the
 * full lockup recoloured white for dark backgrounds such as the footer.
 * `image` is the logo chosen in Admin → Content, which replaces the variant's
 * file; its own size is used when the media library knows it.
 */
const LOGOS = {
  full: { src: '/logo.svg', width: 471, height: 126 },
  compact: { src: '/logo-header.svg', width: 464, height: 91 },
  dark: { src: '/logo-dark.svg', width: 471, height: 126 },
} as const;

export function SiteLogo({
  image,
  variant = 'compact',
  eager = false,
  className = '',
}: {
  image: ImageValue;
  variant?: keyof typeof LOGOS;
  /** Above-the-fold logos load eagerly. */
  eager?: boolean;
  className?: string;
}) {
  const logo = LOGOS[variant];
  return (
    <Image
      src={image.src}
      alt={image.alt}
      width={image.width && image.height ? image.width : logo.width}
      height={image.width && image.height ? image.height : logo.height}
      unoptimized
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      className={className}
    />
  );
}
