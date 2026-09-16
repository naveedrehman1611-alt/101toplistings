'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { drawer } from '@/lib/motion';
import type { MenuItem } from '@/lib/queries';

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

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="font-display text-lg font-bold tracking-tight">
          {brand}
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-6 text-sm">
            {nav.map((item) => (
              <li key={item.url}>
                <Link href={item.url} className="hover:text-brand-700">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden md:block">
          <Link
            href="/dashboard/listings/new"
            className="inline-flex h-10 items-center rounded-lg bg-brand-700 px-4 text-sm font-medium text-white hover:bg-brand-800"
          >
            Add your business
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          className="grid size-10 place-items-center rounded-lg border border-[var(--border)] md:hidden"
        >
          <span aria-hidden>☰</span>
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label="Close menu"
              className="absolute inset-0 bg-black/40"
              onClick={() => setOpen(false)}
            />
            <motion.nav
              aria-label="Mobile"
              variants={drawer}
              initial="hidden"
              animate="show"
              exit="exit"
              className="absolute right-0 top-0 flex h-full w-80 max-w-[85vw] flex-col gap-1 overflow-y-auto bg-[var(--surface)] p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="font-display font-bold">{brand}</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="grid size-9 place-items-center rounded-lg border border-[var(--border)]"
                >
                  <span aria-hidden>✕</span>
                </button>
              </div>
              {mobileNav.map((item) => (
                <Link
                  key={item.url}
                  href={item.url}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-base hover:bg-[var(--surface-2)]"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/dashboard/listings/new"
                onClick={() => setOpen(false)}
                className="mt-4 inline-flex h-11 items-center justify-center rounded-lg bg-brand-700 px-4 font-medium text-white"
              >
                Add your business
              </Link>
            </motion.nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
