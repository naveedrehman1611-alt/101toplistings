'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from '@/components/icon';
import { TOOLS_BASE, toolHref, toolsByCategory, type FreeTool } from '@/lib/free-tools';

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container';

const CATEGORIES = toolsByCategory();

/** Hover intent: moving the cursor from the trigger into the panel crosses a gap. */
const CLOSE_DELAY_MS = 150;

export function NewPill() {
  return (
    <span className="bg-brand-50 text-primary-container rounded-full px-1.5 py-0.5 text-[10px] leading-none font-bold tracking-wider uppercase">
      New
    </span>
  );
}

export function SoonPill() {
  return (
    <span className="bg-surface-container-low text-secondary rounded-full px-1.5 py-0.5 text-[10px] leading-none font-bold tracking-wider uppercase">
      Soon
    </span>
  );
}

function ToolRow({ tool }: { tool: FreeTool }) {
  const inner = (
    <>
      <span
        className={`grid size-8 shrink-0 place-items-center rounded-lg ${
          tool.status === 'live'
            ? 'bg-brand-50 text-primary-container'
            : 'bg-surface-container-low text-secondary'
        }`}
      >
        <Icon name={tool.icon} size={18} />
      </span>
      <span className="min-w-0 flex-1">{tool.name}</span>
      {tool.status === 'soon' ? <SoonPill /> : tool.isNew ? <NewPill /> : null}
    </>
  );
  const base = 'font-label-md text-label-md flex items-center gap-3 rounded-lg px-2 py-2';
  if (tool.status === 'soon') {
    return (
      <span aria-disabled="true" className={`${base} text-secondary cursor-default opacity-70`}>
        {inner}
      </span>
    );
  }
  return (
    <Link
      href={toolHref(tool)}
      className={`${base} text-on-surface hover:bg-surface-container-low hover:text-primary-container transition-colors ${focusRing}`}
    >
      {inner}
    </Link>
  );
}

/**
 * Desktop "Free SEO Tools" trigger and its panel. The panel is absolutely
 * positioned against the sticky <header> (the nearest positioned ancestor), not
 * fixed: the header's backdrop-filter would make it the containing block anyway.
 */
export function ToolsMegaMenu() {
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
  const active = pathname === TOOLS_BASE || pathname.startsWith(`${TOOLS_BASE}/`);

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
        {/* Short label until xl: the row has little room at 1024px. */}
        <span className="xl:hidden">Tools</span>
        <span className="hidden xl:inline">Free SEO Tools</span>
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
              <div className="grid grid-cols-4 gap-6 p-6">
                {CATEGORIES.map((category) => (
                  <div key={category.id}>
                    <p className="font-label-sm text-label-sm text-secondary mb-2 px-2 tracking-wider uppercase">
                      {category.label}
                    </p>
                    <ul className="flex flex-col gap-0.5">
                      {category.tools.map((tool) => (
                        <li key={tool.slug}>
                          <ToolRow tool={tool} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="border-border-subtle flex items-center justify-between gap-4 border-t px-8 py-4">
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Free, no signup. Every tool runs in your browser.
                </p>
                <Link
                  href={TOOLS_BASE}
                  className={`font-label-md text-label-md text-primary-container hover:text-primary inline-flex items-center gap-1 rounded-sm font-semibold transition-colors ${focusRing}`}
                >
                  View all free tools
                  <Icon name="north_east" size={16} />
                </Link>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
