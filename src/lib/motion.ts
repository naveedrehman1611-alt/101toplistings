'use client';

import { useEffect, useState } from 'react';
import type { Variants, Transition } from 'framer-motion';

/**
 * Shared motion tokens. §8 requires shared variants and one easing/duration set
 * rather than one-off animate props scattered across pages.
 * prefers-reduced-motion is handled globally in globals.css, which zeroes every
 * transition duration — so these variants degrade automatically.
 */
export const easing: Transition['ease'] = [0.22, 1, 0.36, 1];

export const durations = { fast: 0.18, base: 0.32, slow: 0.5 } as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: durations.base, ease: easing } },
};

export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

/**
 * Mount-and-transition state for an element that animates in and out with CSS
 * (the header drawer and mega menus), so they need no animation library.
 * `mounted` turns on with `open` and stays on for `exitMs` after it turns off,
 * long enough for the exit transition. `shown` turns on two frames after
 * mounting, so the hidden state paints first and the enter transition runs;
 * render the hidden styles while it is off. Reopening mid-exit reverses the
 * transition from where it is.
 */
export function usePresence(open: boolean, exitMs: number): { mounted: boolean; shown: boolean } {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  // Adjusted while rendering, so an opening element mounts in the same commit.
  if (open && !mounted) setMounted(true);
  if (!open && shown) setShown(false);

  useEffect(() => {
    if (open) {
      let second = 0;
      const first = requestAnimationFrame(() => {
        second = requestAnimationFrame(() => setShown(true));
      });
      return () => {
        cancelAnimationFrame(first);
        cancelAnimationFrame(second);
      };
    }
    const timer = setTimeout(() => setMounted(false), exitMs);
    return () => clearTimeout(timer);
  }, [open, exitMs]);

  return { mounted: mounted || open, shown: open && shown };
}
