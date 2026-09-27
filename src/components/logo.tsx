import Link from 'next/link';

/**
 * Wordmark built from the brand name setting, so renaming the brand in the
 * database still renames the logo. A name shaped like "101 Top Listings" gets
 * the stacked number + words treatment; anything else falls back to plain text.
 */
export function Logo({
  brand,
  tagline = 'Free business listings',
}: {
  brand: string;
  tagline?: string;
}) {
  const m = brand.match(/^(\d+)\s*(\S+)\s+(.+)$/);

  if (!m) {
    return (
      <Link href="/" className="font-display text-lg font-bold tracking-tight text-white">
        {brand}
      </Link>
    );
  }

  const [, num, first, rest] = m;
  return (
    <Link href="/" aria-label={brand} className="flex items-center gap-1 leading-none">
      <span
        aria-hidden
        className="font-display bg-gradient-to-br from-sky-400 via-blue-500 to-violet-600 bg-clip-text text-[2.6rem] font-black tracking-[-0.06em] text-transparent"
      >
        {num}
      </span>
      <span aria-hidden className="flex flex-col">
        <span className="font-display relative self-start text-[1.7rem] font-black tracking-tight text-sky-400 uppercase">
          {first}
          <span className="absolute -top-1 -right-3 text-[10px] text-violet-400">★</span>
        </span>
        <span className="font-display -mt-0.5 text-[0.95rem] font-extrabold tracking-[0.08em] text-violet-400 uppercase">
          {rest}
        </span>
        <span className="mt-0.5 text-[6px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
          {tagline}
        </span>
      </span>
    </Link>
  );
}
