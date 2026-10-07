'use client';

import { useEffect, useRef, useState } from 'react';

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
 * Counts up from zero to `to` the first time it scrolls into view (so on load
 * when it is on screen). The visible digits are hidden from assistive tech,
 * which reads the final value at once; under reduced motion it jumps there.
 */
export function CountUp({ to, format: kind }: { to: number; format: CountFormat }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const run = () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setValue(to);
        return;
      }
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
    };
  }, [to]);

  return (
    <>
      <span ref={ref} aria-hidden className="tabular-nums">
        {format(value, kind)}
      </span>
      <span className="sr-only">{format(to, kind)}</span>
    </>
  );
}
