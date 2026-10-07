'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from '@/components/icon';

export const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container';

/** Hover intent: moving the cursor from the trigger into the panel crosses a gap. */
const CLOSE_DELAY_MS = 150;

/**
 * A desktop header trigger and its full-width panel, shared by the "Services"
 * and "Free SEO Tools" menus. The panel is absolutely positioned against the
 * sticky <header> (the nearest positioned ancestor), not fixed: the header's
 * backdrop-filter would make it the containing block anyway.
 */
export function MegaMenu({
  label,
  shortLabel = label,
  active,
  children,
}: {
  label: string;
  /** Shown until xl, where the row has little room. */
  shortLabel?: string;
  /** The current page belongs to this menu. */
  active: boolean;
  children: ReactNode;
}) {
  const pathname = usePathname();
  // Open state remembers the path it was opened on, so navigating closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const panelId = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // A mouse click right after hover opened the panel keeps it open, not toggles it shut.
  const openedByHover = useRef(false);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };
  const show = () => {
    cancelClose();
    setOpenOn(pathname);
  };
  const hide = () => {
    cancelClose();
    setOpenOn(null);
  };

  useEffect(() => cancelClose, []);

  // Escape closes and hands focus back; a press outside closes.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpenOn(null);
      trigger.current?.focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpenOn(null);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  return (
    <div
      ref={root}
      onPointerEnter={(event) => {
        if (event.pointerType !== 'mouse') return;
        if (!open) openedByHover.current = true;
        show();
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== 'mouse') return;
        cancelClose();
        closeTimer.current = setTimeout(() => setOpenOn(null), CLOSE_DELAY_MS);
      }}
      onBlur={(event) => {
        if (open && !event.currentTarget.contains(event.relatedTarget as Node | null)) hide();
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          if (open && openedByHover.current) openedByHover.current = false;
          else if (open) hide();
          else {
            openedByHover.current = false;
            show();
          }
        }}
        className={`inline-flex items-center gap-0.5 rounded-sm whitespace-nowrap transition-colors ${focusRing} ${
          active || open
            ? 'text-primary-container font-semibold'
            : 'font-label-md text-label-md text-on-surface-variant hover:text-on-surface'
        }`}
      >
        {shortLabel === label ? (
          label
        ) : (
          <>
            <span className="xl:hidden">{shortLabel}</span>
            <span className="hidden xl:inline">{label}</span>
          </>
        )}
        <Icon
          name="expand_more"
          size={18}
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            id={panelId}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute inset-x-0 top-full z-50 px-6 pt-1 lg:px-12"
          >
            {/* tabIndex -1: a click on a muted row or the background keeps focus inside. */}
            <div
              tabIndex={-1}
              className="bg-surface-card border-border-subtle pointer-events-auto mx-auto max-w-6xl rounded-2xl border shadow-[0_12px_40px_rgba(0,0,0,0.12)] outline-none"
            >
              {children}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/** The panel's bottom strip: a note on the left, a "view all" link on the right. */
export function MegaMenuFooter({ children }: { children: ReactNode }) {
  return (
    <div className="border-border-subtle flex items-center justify-between gap-4 border-t px-8 py-4">
      {children}
    </div>
  );
}
