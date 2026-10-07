import Image from 'next/image';

/**
 * The RankYourSite logo, drawn as SVG in /public (text is outlined, so it needs
 * no web font). `full` is the whole lockup with the LIST • RANK • GROW line;
 * `compact` drops that line, which is unreadable at header size.
 */
const LOGOS = {
  full: { src: '/logo.svg', width: 491, height: 126 },
  compact: { src: '/logo-header.svg', width: 484, height: 91 },
} as const;

export function SiteLogo({
  alt,
  variant = 'compact',
  eager = false,
  className = '',
}: {
  alt: string;
  variant?: keyof typeof LOGOS;
  /** Above-the-fold logos load eagerly. */
  eager?: boolean;
  className?: string;
}) {
  const logo = LOGOS[variant];
  return (
    <Image
      src={logo.src}
      alt={alt}
      width={logo.width}
      height={logo.height}
      unoptimized
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      className={className}
    />
  );
}
