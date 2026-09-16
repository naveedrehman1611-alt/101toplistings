'use client';

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

export const drawer: Variants = {
  hidden: { x: '100%' },
  show: { x: 0, transition: { duration: durations.base, ease: easing } },
  exit: { x: '100%', transition: { duration: durations.fast, ease: easing } },
};
