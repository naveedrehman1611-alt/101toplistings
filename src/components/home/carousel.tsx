'use client';

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { SvgIcon } from '@/components/svg-icon';
import { chevronLeftIcon, chevronRightIcon, pauseIcon, playIcon } from '@/components/icon-nodes';

/**
 * The one carousel behind every homepage slider. Native horizontal scrolling
 * with scroll-snap does the moving, so touch, trackpad and keyboard scrolling
 * work without a library; this component adds dots, arrows, optional autoplay
 * and the W3C carousel semantics.
 *
 * Slide widths come from `slideClassName` (for example
 * "basis-full sm:basis-1/2 lg:basis-1/3"); the number of slides in view is
 * measured, never assumed, so the controls stay right at every breakpoint.
 *
 * Autoplay never runs under prefers-reduced-motion, pauses while the pointer or
 * keyboard focus is inside, while the tab is hidden and while the carousel is
 * off screen, and has a visible pause button (WCAG 2.2.2).
 */

type Props = {
  /** Accessible name, e.g. "Top-rated businesses". */
  label: string;
  children: ReactNode;
  slideClassName: string;
  /** How far next, previous and autoplay move. */
  step?: 'slide' | 'page';
  dots?: boolean;
  arrows?: boolean;
  /** Milliseconds between automatic moves; 0 disables autoplay. */
  autoplayMs?: number;
  /** Sets data-center="true" on the middle visible slide, for centre-mode styling. */
  highlightCenter?: boolean;
  className?: string;
};

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function Carousel({
  label,
  children,
  slideClassName,
  step = 'page',
  dots = true,
  arrows = false,
  autoplayMs = 0,
  highlightCenter = false,
  className = '',
}: Props) {
  const slides = Children.toArray(children);
  const count = slides.length;
  const trackRef = useRef<HTMLDivElement>(null);
  const [perView, setPerView] = useState(1);
  const [first, setFirst] = useState(0);
  const [playing, setPlaying] = useState(autoplayMs > 0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);

  const maxFirst = Math.max(0, count - perView);
  const positions =
    step === 'slide' ? maxFirst + 1 : Math.max(1, Math.ceil(count / Math.max(perView, 1)));
  const active =
    step === 'slide' ? first : first >= maxFirst ? positions - 1 : Math.floor(first / perView);
  const scrollable = count > perView;

  const slideOffset = useCallback((index: number) => {
    const track = trackRef.current;
    const el = track?.children[index] as HTMLElement | undefined;
    const start = track?.children[0] as HTMLElement | undefined;
    return el && start ? el.offsetLeft - start.offsetLeft : 0;
  }, []);

  const measure = useCallback(() => {
    const track = trackRef.current;
    const slide = track?.children[0] as HTMLElement | undefined;
    if (!track || !slide || slide.offsetWidth === 0) return;
    setPerView(Math.max(1, Math.round(track.clientWidth / slide.offsetWidth)));
  }, []);

  const goTo = useCallback(
    (position: number) => {
      const track = trackRef.current;
      if (!track) return;
      const wrapped = ((position % positions) + positions) % positions;
      const index = step === 'slide' ? wrapped : Math.min(wrapped * perView, maxFirst);
      track.scrollTo({
        left: slideOffset(index),
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      });
    },
    [positions, perView, maxFirst, step, slideOffset],
  );

  // Track the first visible slide from the scroll position.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const slide = track.children[0] as HTMLElement | undefined;
        const width = slide?.offsetWidth ?? 0;
        if (!width) return;
        const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
        setFirst(atEnd ? Math.max(0, count - perView) : Math.round(track.scrollLeft / width));
      });
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener('scroll', onScroll);
    };
  }, [count, perView]);

  // Re-measure when the layout changes, and watch visibility and motion preference.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(track);
    const seen = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.25,
    });
    seen.observe(track);
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotion = () => setReduced(motion.matches);
    onMotion();
    motion.addEventListener('change', onMotion);
    return () => {
      resize.disconnect();
      seen.disconnect();
      motion.removeEventListener('change', onMotion);
    };
  }, [measure]);

  // Autoplay.
  const autoplay = autoplayMs > 0 && !reduced && scrollable;
  useEffect(() => {
    if (!autoplay || !playing || paused || !visible) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') goTo(active + 1);
    }, autoplayMs);
    return () => window.clearInterval(timer);
  }, [autoplay, playing, paused, visible, autoplayMs, goTo, active]);

  const center = highlightCenter ? first + Math.floor(perView / 2) : -1;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      className={`relative ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      <div
        ref={trackRef}
        aria-live={autoplay && playing ? 'off' : 'polite'}
        className="no-scrollbar -mx-3 flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            data-center={i === center ? 'true' : undefined}
            className={`group shrink-0 snap-start px-3 ${slideClassName}`}
          >
            {slide}
          </div>
        ))}
      </div>

      {arrows && scrollable ? (
        <>
          <button
            type="button"
            onClick={() => goTo(active - 1)}
            aria-label="Previous slide"
            className="border-ink-200 text-ink-900 hover:border-brand-700 hover:bg-brand-700 absolute top-1/2 -left-3 z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full border bg-white shadow-[var(--shadow-card)] transition-colors hover:text-white sm:grid lg:-left-6"
          >
            <SvgIcon node={chevronLeftIcon} size={20} />
          </button>
          <button
            type="button"
            onClick={() => goTo(active + 1)}
            aria-label="Next slide"
            className="border-ink-200 text-ink-900 hover:border-brand-700 hover:bg-brand-700 absolute top-1/2 -right-3 z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full border bg-white shadow-[var(--shadow-card)] transition-colors hover:text-white sm:grid lg:-right-6"
          >
            <SvgIcon node={chevronRightIcon} size={20} />
          </button>
        </>
      ) : null}

      {/* Fixed height so the controls appearing after hydration cause no layout shift. */}
      <div className="mt-8 flex h-6 items-center justify-center gap-3">
        {scrollable && (dots || arrows) ? (
          <>
            {dots ? (
              <div className="flex items-center gap-2">
                {Array.from({ length: positions }, (_, p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => goTo(p)}
                    aria-label={`Go to slide ${p + 1} of ${positions}`}
                    aria-current={p === active ? 'true' : undefined}
                    className={`h-2 rounded-full transition-all ${
                      p === active ? 'bg-ink-800 w-5' : 'bg-ink-300 hover:bg-ink-400 w-2'
                    }`}
                  />
                ))}
              </div>
            ) : null}
            {arrows ? (
              <div className="flex items-center gap-2 sm:hidden">
                <button
                  type="button"
                  onClick={() => goTo(active - 1)}
                  aria-label="Previous slide"
                  className="border-ink-200 grid size-9 place-items-center rounded-full border bg-white"
                >
                  <SvgIcon node={chevronLeftIcon} size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => goTo(active + 1)}
                  aria-label="Next slide"
                  className="border-ink-200 grid size-9 place-items-center rounded-full border bg-white"
                >
                  <SvgIcon node={chevronRightIcon} size={18} />
                </button>
              </div>
            ) : null}
            {autoplay ? (
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                aria-label={playing ? 'Pause automatic slides' : 'Play automatic slides'}
                className="text-ink-500 hover:text-ink-900 grid size-6 place-items-center rounded-full"
              >
                <SvgIcon node={playing ? pauseIcon : playIcon} size={14} strokeWidth={2} />
              </button>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
