'use client';

import { useEffect, useState } from 'react';
import { SvgIcon } from '@/components/svg-icon';
import { arrowUpIcon } from '@/components/icon-nodes';

/** How far down the page (px) before the button appears. */
const THRESHOLD = 500;

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setVisible(window.scrollY > THRESHOLD);
    };
    // At most one state check per frame, however fast scroll events arrive.
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    onScroll(); // a reload can restore the page mid-scroll
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  function toTop() {
    // Keyboard users carry on from the start of the content (the skip link's
    // target), not from this button at the end of the page.
    const main = document.getElementById('main');
    if (main) {
      if (!main.hasAttribute('tabindex')) {
        main.setAttribute('tabindex', '-1');
        main.addEventListener('blur', () => main.removeAttribute('tabindex'), { once: true });
      }
      main.focus({ preventScroll: true });
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={toTop}
      // Hidden means gone for everyone: not clickable, focusable or announced.
      inert={!visible}
      aria-hidden={visible ? undefined : true}
      tabIndex={visible ? undefined : -1}
      className={`bg-brand-700 hover:bg-brand-800 fixed right-8 bottom-24 z-40 grid size-11 place-items-center rounded-md text-white shadow-[var(--shadow-raised)] transition duration-300 ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0 motion-safe:translate-y-3'
      }`}
    >
      <SvgIcon node={arrowUpIcon} size={20} strokeWidth={2} />
    </button>
  );
}
