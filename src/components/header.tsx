'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { drawer } from '@/lib/motion';
import type { MenuItem } from '@/lib/queries';
import { Logo } from '@/components/logo';

// Only used when the header menu comes back empty (e.g. the database is
// unreachable), so the site is never left without navigation.
const FALLBACK_NAV: MenuItem[] = [
  { label: 'Home', url: '/', sort_order: 0 },
  { label: 'About us', url: '/about', sort_order: 1 },
  { label: 'Listings', url: '/listings', sort_order: 2 },
  { label: 'Blog', url: '/blog', sort_order: 3 },
  { label: 'Contact us', url: '/contact', sort_order: 4 },
];

function isActive(pathname: string, url: string) {
  if (url === '/') return pathname === '/';
  return pathname === url || pathname.startsWith(`${url}/`);
}

export function Header({
  brand,
  nav,
  mobileNav,
}: {
  brand: string;
  nav: MenuItem[];
  mobileNav: MenuItem[];
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? '/';
  const primary = nav.length ? nav : FALLBACK_NAV;
  const mobile = mobileNav.length ? mobileNav : primary;

  return (
    <header className="sticky top-0 z-40 border-b border-[#1c2636] bg-[#0b111b] text-slate-100">
      <div className="container-page flex h-20 items-center justify-between gap-4">
        <Logo brand={brand} />

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1 rounded-full border border-[#263245] bg-[#111a27] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            {primary.map((item) => {
              const active = isActive(pathname, item.url);
              return (
                <li key={item.url}>
                  <Link
                    href={item.url}
                    aria-current={active ? 'page' : undefined}
                    className={
                      active
                        ? 'block rounded-full bg-sky-500 px-4 py-1.5 text-sm font-semibold text-white shadow-[0_0_18px_rgba(14,165,233,0.45)]'
                        : 'block rounded-full px-4 py-1.5 text-sm font-semibold text-slate-200 transition-colors hover:text-sky-400'
                    }
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/login"
            className="px-2 text-sm font-semibold text-slate-100 hover:text-sky-400"
          >
            Sign in
          </Link>
          <Link
            href="/dashboard/listings/new"
            className="inline-flex h-9 items-center rounded-full border border-sky-500 px-4 text-sm font-semibold text-sky-400 transition-colors hover:bg-sky-500/10"
          >
            Add listing
          </Link>
          <Link
            href="/listings"
            className="inline-flex h-9 items-center rounded-full bg-sky-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-sky-400"
          >
            Browse all
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          className="grid size-10 place-items-center rounded-lg border border-[#263245] text-slate-100 lg:hidden"
        >
          <span aria-hidden>☰</span>
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label="Close menu"
              className="absolute inset-0 bg-black/60"
              onClick={() => setOpen(false)}
            />
            <motion.nav
              aria-label="Mobile"
              variants={drawer}
              initial="hidden"
              animate="show"
              exit="exit"
              className="absolute top-0 right-0 flex h-full w-80 max-w-[85vw] flex-col gap-1 overflow-y-auto border-l border-[#1c2636] bg-[#0b111b] p-6 text-slate-100 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="font-display font-bold">{brand}</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="grid size-9 place-items-center rounded-lg border border-[#263245]"
                >
                  <span aria-hidden>✕</span>
                </button>
              </div>
              {mobile.map((item) => {
                const active = isActive(pathname, item.url);
                return (
                  <Link
                    key={item.url}
                    href={item.url}
                    onClick={() => setOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={`rounded-lg px-3 py-3 text-base font-medium ${
                      active ? 'bg-sky-500 text-white' : 'hover:bg-[#161f2d]'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="mt-4 rounded-lg px-3 py-3 text-base font-medium hover:bg-[#161f2d]"
              >
                Sign in
              </Link>
              <Link
                href="/dashboard/listings/new"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex h-11 items-center justify-center rounded-full border border-sky-500 px-4 font-semibold text-sky-400"
              >
                Add listing
              </Link>
              <Link
                href="/listings"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-sky-500 px-4 font-semibold text-white"
              >
                Browse all
              </Link>
            </motion.nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
