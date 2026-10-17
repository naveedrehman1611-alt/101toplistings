'use client';

import { useLayoutEffect, useRef, useState } from 'react';

/**
 * A directory count for the stats strip: exact below 1,000, then K or M with one
 * decimal and a "+" (1234 → "1.2K+", 10000 → "10K+", 1250000 → "1.2M+").
 * Truncates rather than rounds so the "+" stays true: 1999 is "1.9K+", not "2K+".
 */
export function compactCount(n: number): string {
  if (n >= 1e6) return `${Math.floor(n / 1e5) / 10}M+`;
  if (n >= 1e3) return `${Math.floor(n / 1e2) / 10}K+`;
  return n.toLocaleString('en-US');
}

/** A string, not a function, so a server component can pick it. */
export type CountFormat = 'compact' | 'percent' | 'score';

function format(n: number, kind: CountFormat): string {
  if (kind === 'score') return n.toFixed(1);
  if (kind === 'percent') return `${Math.round(n)}%`;
  return compactCount(Math.round(n));
}

const DURATION = 1600;

/**
 * The final value, rendered on the server so crawlers and no-JS readers see
 * the real number. A counter that starts below the fold resets to zero before
 * first paint and counts up the first time it scrolls into view; one already on
 * screen at hydration keeps its value, since resetting it would visibly flash.
 * Under reduced motion nothing animates.
 */
export function CountUp({ to, format: kind }: { to: number; format: CountFormat }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(to);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const box = el.getBoundingClientRect();
    if (box.top < window.innerHeight && box.bottom > 0) return;
    setValue(0);
    let frame = 0;
    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / DURATION, 1);
        setValue(to * (1 - (1 - t) ** 3)); // ease-out: fast at first, settling on the value
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      run();
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      setValue(to);
    };
  }, [to]);

  return (
    <span ref={ref} className="tabular-nums">
      {format(value, kind)}
    </span>
  );
}
