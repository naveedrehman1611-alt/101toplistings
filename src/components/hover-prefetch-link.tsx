'use client';

import Link from 'next/link';
import { useState, type ComponentProps } from 'react';

/**
 * next/link that prefetches when a visitor shows intent — pointer over it,
 * touch, or keyboard focus — instead of whenever it scrolls into view (the
 * hover pattern from Next's prefetching guide). The homepage, header and footer
 * hold dozens of links to routes rendered per request (listings, category and
 * city pages, sign-in, the dashboard); prefetching on sight rendered every one
 * of them on the server for each visitor, database reads included, whether
 * they clicked or not. Navigation stays client-side either way.
 */
export function HoverPrefetchLink({
  onMouseEnter,
  onTouchStart,
  onFocus,
  prefetch,
  ...props
}: ComponentProps<typeof Link>) {
  const [intent, setIntent] = useState(false);
  return (
    <Link
      {...props}
      prefetch={intent ? (prefetch ?? null) : false}
      onMouseEnter={(e) => {
        setIntent(true);
        onMouseEnter?.(e);
      }}
      onTouchStart={(e) => {
        setIntent(true);
        onTouchStart?.(e);
      }}
      onFocus={(e) => {
        setIntent(true);
        onFocus?.(e);
      }}
    />
  );
}
