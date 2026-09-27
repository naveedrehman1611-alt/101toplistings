'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { drawer } from '@/lib/motion';
import { Logo } from '@/components/logo';
import { SvgIcon } from '@/components/svg-icon';
import { menuIcon, plusIcon, userIcon, xIcon } from '@/components/icon-nodes';
import type { ChromeVM, LinkVM } from '@/lib/home-types';

/**
 * Site header. On the homepage it floats transparent over the hero photo and
 * scrolls away with it, as on the reference; everywhere else it is a white bar
 * that sticks to the top. Below lg the links move into an off-canvas dialog.
 */

// Homepage sections are ordered by editors, so only float over the page while
// the hero photo really is at the top; otherwise keep the solid bar, and white
// text never lands on a white section.
function watchMain(onChange: () => void) {
  const main = document.getElementById('main');
  if (!main) return () => {};
  const observer = new MutationObserver(onChange);
  observer.observe(main, { childList: true });
  return () => observer.disconnect();
}
const heroLeads = () => document.querySelector('#main > [data-hero]:first-child') !== null;
const heroLeadsOnServer = () => true;

/** 'page' for the current route, 'true' for a page below it; both get the active style. */
function currentState(pathname: string, href: string): 'page' | 'true' | undefined {
  if (!href.startsWith('/') || href.startsWith('//') || href.includes('#')) return undefined;
  const path = href.split('?')[0].replace(/(.)\/+$/, '$1');
  if (pathname === path) return 'page';
  return path !== '/' && pathname.startsWith(`${path}/`) ? 'true' : undefined;
}

const FOCUSABLE = 'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])';

/**
 * The menu dialog renders at the end of <body>: inside the header it would
 * share the header's z-40 layer, under anything later in the page (the
 * back-to-top button sits on its bottom corner). Only mounted while open,
 * which is only ever on the client.
 */
function BodyPortal({ children }: { children: ReactNode }) {
  return createPortal(children, document.body);
}

export function Header({ chrome }: { chrome: ChromeVM }) {
  const pathname = usePathname();
  const heroOnTop = useSyncExternalStore(watchMain, heroLeads, heroLeadsOnServer);
  const overlay = pathname === '/' && heroOnTop;

  // The menu belongs to the page it was opened on, so any navigation closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const panelId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const { brand, login, register, addListing } = chrome;
  // A login label that already names sign-up ("Login/Sign Up") stands alone.
  const showRegister = !login.label.toLowerCase().includes(register.label.toLowerCase());

  const close = useCallback(() => {
    setOpenOn(null);
    menuButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();

    // Lock the page behind the dialog, keeping its width where a scrollbar disappears.
    const root = document.documentElement;
    const { overflow, paddingRight } = root.style;
    const scrollbar = window.innerWidth - root.clientWidth;
    root.style.overflow = 'hidden';
    if (scrollbar > 0) root.style.paddingRight = `${scrollbar}px`;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      const panel = panelRef.current;
      if (event.key !== 'Tab' || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const inside = panel.contains(document.activeElement);
      if (event.shiftKey && (!inside || document.activeElement === first)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (!inside || document.activeElement === last)) {
        event.preventDefault();
        first.focus();
      }
    };
    // The dialog only exists below lg; widening the window past it closes the menu.
    const desktop = window.matchMedia('(min-width: 64rem)');
    const onResize = () => {
      if (desktop.matches) setOpenOn(null);
    };

    document.addEventListener('keydown', onKeyDown);
    desktop.addEventListener('change', onResize);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      desktop.removeEventListener('change', onResize);
      root.style.overflow = overflow;
      root.style.paddingRight = paddingRight;
    };
  }, [open, close]);

  const tone = overlay
    ? {
        link: 'text-white/90 hover:text-white',
        active: 'text-white after:bg-white',
        icon: 'text-white hover:bg-white/10',
      }
    : {
        link: 'text-ink-900 hover:text-brand-700',
        active: 'text-brand-700 after:bg-brand-700',
        icon: 'text-ink-900 hover:bg-[var(--surface-2)]',
      };

  return (
    <header
      className={
        overlay
          ? 'absolute inset-x-0 top-0 z-40 text-white'
          : 'text-ink-900 sticky top-0 z-40 border-b border-[var(--border)] bg-white'
      }
    >
      <div
        className={`container-wide flex items-center gap-6 xl:gap-8 ${
          // The default brand-blue focus ring is hard to see on the photo.
          overlay ? 'h-16 lg:h-[90px] [&_:focus-visible]:outline-white!' : 'h-16 lg:h-[72px]'
        }`}
      >
        <Link
          href="/"
          aria-label={`${brand.name} homepage`}
          className="mr-auto shrink-0 rounded-md"
        >
          <Logo brand={brand} tone={overlay ? 'dark' : 'light'} priority />
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-5 xl:gap-7">
            {chrome.nav.map((item, i) => (
              <li key={`${i}-${item.href}`}>
                <NavLink item={item} pathname={pathname} tone={tone} />
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-1.5 text-[0.9375rem] font-medium lg:flex">
          <SvgIcon node={userIcon} size={18} className="shrink-0" />
          <Link href={login.href} className={`rounded-sm transition-colors ${tone.link}`}>
            {login.label}
          </Link>
          {showRegister ? (
            <>
              <span aria-hidden="true">/</span>
              <Link href={register.href} className={`rounded-sm transition-colors ${tone.link}`}>
                {register.label}
              </Link>
            </>
          ) : null}
        </div>

        <Link
          href={addListing.href}
          className="bg-brand-700 hover:bg-brand-800 hidden h-11 shrink-0 items-center gap-1.5 rounded-lg px-5 text-[0.9375rem] font-medium text-white transition-colors lg:inline-flex"
        >
          <SvgIcon node={plusIcon} size={18} strokeWidth={2} />
          {addListing.label}
        </Link>

        <div className="-mr-2 flex items-center lg:hidden">
          <Link
            href={login.href}
            aria-label={login.label}
            className={`grid size-11 place-items-center rounded-lg transition-colors ${tone.icon}`}
          >
            <SvgIcon node={userIcon} size={22} />
          </Link>
          <button
            ref={menuButtonRef}
            type="button"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpenOn(pathname)}
            className={`grid size-11 place-items-center rounded-lg transition-colors ${tone.icon}`}
          >
            <SvgIcon node={menuIcon} size={24} />
          </button>
        </div>
      </div>

      <MotionConfig reducedMotion="user">
        <AnimatePresence>
          {open ? (
            <BodyPortal key="menu">
              <motion.div
                className="fixed inset-0 z-50 lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div
                  aria-hidden="true"
                  className="bg-navy-950/50 absolute inset-0"
                  onClick={close}
                />
                <motion.div
                  ref={panelRef}
                  id={panelId}
                  role="dialog"
                  aria-modal="true"
                  aria-label="Menu"
                  variants={drawer}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="text-ink-900 absolute inset-y-0 right-0 flex w-80 max-w-[85vw] flex-col bg-white shadow-2xl"
                >
                  <div className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--border)] pr-3 pl-5">
                    <Logo brand={brand} tone="light" />
                    <button
                      ref={closeButtonRef}
                      type="button"
                      aria-label="Close menu"
                      onClick={close}
                      className="grid size-11 place-items-center rounded-lg transition-colors hover:bg-[var(--surface-2)]"
                    >
                      <SvgIcon node={xIcon} size={22} />
                    </button>
                  </div>

                  <nav
                    aria-label="Primary"
                    className="flex-1 overflow-y-auto overscroll-contain px-3 py-4"
                  >
                    <ul className="space-y-1">
                      {chrome.mobileNav.map((item, i) => {
                        const state = currentState(pathname, item.href);
                        return (
                          <li key={`${i}-${item.href}`}>
                            <Link
                              href={item.href}
                              aria-current={state}
                              onClick={close}
                              className={`flex min-h-12 items-center rounded-lg px-3 text-base font-medium transition-colors ${
                                state
                                  ? 'bg-brand-50 text-brand-700'
                                  : 'hover:text-brand-700 hover:bg-[var(--surface-2)]'
                              }`}
                            >
                              {item.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="mt-4 flex items-center gap-2 border-t border-[var(--border)] px-3 pt-4 text-base font-medium">
                      <SvgIcon node={userIcon} size={20} className="text-ink-500 shrink-0" />
                      <Link
                        href={login.href}
                        onClick={close}
                        className="hover:text-brand-700 inline-flex min-h-11 items-center"
                      >
                        {login.label}
                      </Link>
                      {showRegister ? (
                        <>
                          <span aria-hidden="true" className="text-ink-500">
                            /
                          </span>
                          <Link
                            href={register.href}
                            onClick={close}
                            className="hover:text-brand-700 inline-flex min-h-11 items-center"
                          >
                            {register.label}
                          </Link>
                        </>
                      ) : null}
                    </div>
                  </nav>

                  <div className="shrink-0 border-t border-[var(--border)] p-4">
                    <Link
                      href={addListing.href}
                      onClick={close}
                      className="bg-brand-700 hover:bg-brand-800 flex h-12 w-full items-center justify-center gap-2 rounded-lg font-medium text-white transition-colors"
                    >
                      <SvgIcon node={plusIcon} size={18} strokeWidth={2} />
                      {addListing.label}
                    </Link>
                  </div>
                </motion.div>
              </motion.div>
            </BodyPortal>
          ) : null}
        </AnimatePresence>
      </MotionConfig>
    </header>
  );
}

function NavLink({
  item,
  pathname,
  tone,
}: {
  item: LinkVM;
  pathname: string;
  tone: { link: string; active: string };
}) {
  const state = currentState(pathname, item.href);
  return (
    <Link
      href={item.href}
      aria-current={state}
      className={`relative block rounded-sm py-2 text-[0.9375rem] font-medium transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full ${
        state ? tone.active : `${tone.link} after:bg-transparent`
      }`}
    >
      {item.label}
    </Link>
  );
}
