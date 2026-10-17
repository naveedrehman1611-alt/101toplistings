'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { Role } from '@/lib/role-order';
import { roleAtLeast } from '@/lib/role-order';
import { adminSearch, type SearchHit } from '@/lib/admin-search-actions';
import { ADMIN_NAV, ROLE_LABEL, activeItem } from './nav';

export type NavCounts = Partial<Record<'listings' | 'reviews' | 'claims' | 'inbox', number>>;

/**
 * The admin frame: a 248px navy sidebar grouped by task, with pending counts
 * as gold badges; a 60px white top bar with the breadcrumb and the ⌘K search;
 * and the scrolling page area (max 1280px). The links shown follow the
 * signed-in user's role.
 */
export function AdminShell({
  brand,
  role,
  userName,
  counts,
  signOut,
  children,
}: {
  brand: string;
  role: Role;
  userName: string;
  counts: NavCounts;
  signOut: () => Promise<void>;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [pal, setPal] = useState(false);
  const here = activeItem(pathname);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPal((p) => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const nav = ADMIN_NAV.map((g) => ({
    ...g,
    items: g.items.filter((i) => roleAtLeast(role, i.min)),
  })).filter((g) => g.items.length);

  const initials =
    userName
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]!.toUpperCase())
      .join('') || '?';

  return (
    <div className="h-screen overflow-hidden bg-[#F8FAFC] font-sans text-[#062347] antialiased">
      <div className="flex h-full overflow-hidden">
        <aside className="flex w-[248px] shrink-0 flex-col bg-[#062347] text-white">
          <div className="flex items-center gap-2.5 px-5 pt-5 pb-[18px]">
            <div className="font-display grid size-8 place-items-center rounded-lg bg-[#14A833] text-base font-extrabold">
              {brand.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="font-display truncate text-[15px] font-bold">{brand}</div>
              <div className="text-[11px] text-[#8FA3BF]">Admin panel</div>
            </div>
          </div>
          <nav aria-label="Admin" className="flex flex-1 flex-col gap-4 overflow-auto px-3 pb-4">
            {nav.map((g) => (
              <div key={g.group} className="flex flex-col gap-0.5">
                <div className="px-2.5 pb-1.5 text-[11px] font-semibold tracking-[.07em] text-[#7C8DA6] uppercase">
                  {g.group}
                </div>
                {g.items.map((it) => {
                  const on = here?.item.href === it.href;
                  const n = it.badge ? (counts[it.badge] ?? 0) : 0;
                  return (
                    <Link
                      key={it.href}
                      href={it.href}
                      aria-current={on ? 'page' : undefined}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-[7px] text-[13.5px] font-medium hover:bg-white/[.06] hover:no-underline"
                      style={{
                        background: on ? 'rgba(255,255,255,.12)' : undefined,
                        color: on ? '#fff' : '#C3CFDE',
                      }}
                    >
                      <span className="flex-1">{it.label}</span>
                      {it.isNew ? (
                        <span className="rounded bg-[#14A833] px-[5px] py-0.5 text-[9.5px] font-bold tracking-[.05em] text-white">
                          NEW
                        </span>
                      ) : null}
                      {n > 0 ? (
                        <span className="min-w-5 rounded-full bg-[#F59E0B] px-1.5 py-px text-center text-[11px] font-bold text-[#062347]">
                          {n > 99 ? '99+' : n}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
          <div className="flex items-center gap-2.5 border-t border-white/10 px-5 py-3.5">
            <div className="grid size-8 shrink-0 place-items-center rounded-full bg-[#1884E7] text-[13px] font-semibold">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold">{userName}</div>
              <div className="text-[11.5px] text-[#8FA3BF]">{ROLE_LABEL[role]}</div>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                title="Sign out"
                className="cursor-pointer rounded-md border-0 bg-transparent px-1.5 py-1 text-[11.5px] text-[#8FA3BF] hover:bg-white/10 hover:text-white"
              >
                Sign out
              </button>
            </form>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-[60px] shrink-0 items-center gap-4 border-b border-[#E2E8F0] bg-white px-7">
            <div className="flex min-w-0 gap-1.5 text-[13px] text-[#64748B]">
              <span className="whitespace-nowrap">{here?.group ?? 'Admin'}</span>
              <span>/</span>
              <span className="truncate font-semibold text-[#062347]">
                {crumbTitle(pathname, here?.item.label)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPal(true)}
              className="ml-auto flex h-9 w-[380px] min-w-40 shrink cursor-pointer items-center gap-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] pr-2.5 pl-3 text-left text-[13.5px] text-[#64748B] hover:border-[#CBD5E1]"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <span className="flex-1 truncate">Search listings, users, posts, pages…</span>
              <span className="rounded-[5px] border border-[#E2E8F0] bg-white px-1.5 py-px text-[11px] font-semibold">
                ⌘K
              </span>
            </button>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] font-semibold whitespace-nowrap text-[#1884E7] hover:text-[#062347] hover:no-underline"
            >
              View site ↗
            </a>
          </header>

          <main id="admin-main" className="flex flex-1 flex-col overflow-auto">
            <div className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-5 px-6 pt-6 pb-12">
              {children}
            </div>
          </main>
        </div>
      </div>

      {pal ? <Palette role={role} onClose={() => setPal(false)} /> : null}
    </div>
  );
}

function crumbTitle(pathname: string, fallback?: string): string {
  if (/^\/admin\/listings\/new$/.test(pathname)) return 'Add listing';
  if (/^\/admin\/listings\/[^/]+$/.test(pathname)) return 'Edit listing';
  if (/^\/admin\/blog\/new$/.test(pathname)) return 'New post';
  if (/^\/admin\/blog\/categories$/.test(pathname)) return 'Blog categories';
  if (/^\/admin\/blog\/[^/]+$/.test(pathname)) return 'Edit post';
  if (/^\/admin\/content\/.+/.test(pathname)) return 'Edit content';
  if (/^\/admin\/pages\/sections\/.+/.test(pathname)) return 'Edit section';
  if (pathname === '/admin/no-access') return 'No access';
  return fallback ?? 'Admin';
}

type Result = { group: string; label: string; sub: string; href: string };

function Palette({ role, onClose }: { role: Role; onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [active, setActive] = useState(0);
  const seq = useRef(0);

  useEffect(() => {
    const term = q.trim();
    const n = ++seq.current;
    if (term.length < 2) {
      setHits([]);
      return;
    }
    const t = window.setTimeout(async () => {
      const res = await adminSearch(term);
      if (n === seq.current) setHits(res);
    }, 200);
    return () => window.clearTimeout(t);
  }, [q]);

  const results: Result[] = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const pages: Result[] = [];
    for (const g of ADMIN_NAV)
      for (const it of g.items)
        if (roleAtLeast(role, it.min) && (!needle || it.label.toLowerCase().includes(needle)))
          pages.push({ group: 'Page', label: it.label, sub: g.group, href: it.href });
    return [...pages, ...hits].slice(0, 12);
  }, [q, hits, role]);

  const go = (r?: Result) => {
    if (!r) return;
    onClose();
    router.push(r.href);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const sel = Math.min(active, Math.max(0, results.length - 1));

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[60] flex justify-center bg-[rgba(6,35,71,.4)] px-4 pt-[12vh]"
    >
      <div
        role="dialog"
        aria-label="Search the admin"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[460px] w-[600px] max-w-full flex-col self-start overflow-hidden rounded-lg bg-white shadow-[0_24px_48px_rgba(6,35,71,.25)]"
      >
        <input
          autoFocus
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, results.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === 'Enter') go(results[sel]);
          }}
          placeholder="Search listings, users, posts or jump to a page…"
          aria-label="Search"
          className="h-[54px] border-0 border-b border-[#E2E8F0] px-[18px] text-[15px] outline-none"
        />
        <div className="overflow-auto p-1.5">
          {results.map((r, i) => (
            <button
              key={`${r.group}${r.href}${i}`}
              type="button"
              onMouseEnter={() => setActive(i)}
              onClick={() => go(r)}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-md border-0 px-3 py-[9px] text-left text-sm"
              style={{ background: i === sel ? '#F1F5F9' : 'transparent' }}
            >
              <span className="w-[70px] shrink-0 text-[10.5px] font-bold tracking-[.05em] text-[#64748B] uppercase">
                {r.group}
              </span>
              <span className="flex-1 truncate font-medium">{r.label}</span>
              <span className="text-xs text-[#94A3B8]">{r.sub}</span>
            </button>
          ))}
          {results.length === 0 ? (
            <div className="p-6 text-center text-sm text-[#64748B]">No results</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
