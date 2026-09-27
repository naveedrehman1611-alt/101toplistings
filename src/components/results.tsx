import Link from 'next/link';
import type { ListingCard as Card } from '@/lib/queries';
import { ListingCard } from './listing-card';
import { EmptyState } from './ui';

export type SortKey = 'newest' | 'oldest' | 'rating' | 'alphabetical' | 'nearest';

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'newest', label: 'Newest' },
  { key: 'oldest', label: 'Oldest' },
  { key: 'rating', label: 'Highest rated' },
  { key: 'alphabetical', label: 'A–Z' },
];

function buildHref(base: string, params: Record<string, string | number | undefined>) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '' && v !== null) q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `${base}?${s}` : base;
}

export function Results({
  listings,
  basePath,
  page,
  perPage,
  sort,
  query,
  cityNames,
  emptyTitle,
  emptyBody,
}: {
  listings: Card[];
  basePath: string;
  page: number;
  perPage: number;
  sort: SortKey;
  query?: string;
  cityNames: Map<string, string>;
  emptyTitle: string;
  emptyBody: string;
}) {
  const total = listings[0]?.total_count ?? 0;
  const pages = Math.min(MAX_PAGE, Math.max(1, Math.ceil(Number(total) / perPage)));
  // A link per page is fine at 3 pages and is kilobytes of markup on every
  // request at 800. Render a window around the current page instead.
  const WINDOW = 2;
  const numbers: (number | 'gap')[] = [];
  for (let p = 1; p <= pages; p++) {
    if (p === 1 || p === pages || Math.abs(p - page) <= WINDOW) {
      numbers.push(p);
    } else if (numbers[numbers.length - 1] !== 'gap') {
      numbers.push('gap');
    }
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-[var(--text-muted)]">
          {total} {Number(total) === 1 ? 'business' : 'businesses'}
        </p>
        <div className="flex flex-wrap gap-2">
          {SORTS.map((s) => (
            <Link
              key={s.key}
              href={buildHref(basePath, { q: query, sort: s.key })}
              className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                sort === s.key
                  ? 'border-brand-500 bg-brand-50 text-brand-800'
                  : 'border-[var(--border)] hover:bg-[var(--surface-2)]'
              }`}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      {listings.length === 0 ? (
        <EmptyState title={emptyTitle} body={emptyBody} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} cityName={cityNames.get(l.city_id ?? '')} />
          ))}
        </div>
      )}

      {pages > 1 ? (
        <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {numbers.map((p, i) =>
            p === 'gap' ? (
              <span key={`gap-${i}`} aria-hidden className="px-1 text-sm text-[var(--text-muted)]">
                …
              </span>
            ) : (
            <Link
              key={p}
              href={buildHref(basePath, { q: query, sort, page: p === 1 ? undefined : p })}
              aria-current={p === page ? 'page' : undefined}
              className={`grid h-10 min-w-10 place-items-center rounded-lg border px-3 text-sm ${
                p === page
                  ? 'border-brand-500 bg-brand-700 text-white'
                  : 'border-[var(--border)] hover:bg-[var(--surface-2)]'
              }`}
            >
              {p}
            </Link>
            ),
          )}
        </nav>
      ) : null}
    </>
  );
}

export function parseSort(v: string | undefined): SortKey {
  return v === 'oldest' || v === 'rating' || v === 'alphabetical' || v === 'nearest' ? v : 'newest';
}

/**
 * Paging is bounded on the way in. An unbounded `?page=` is a free way for a
 * crawler or a script to make the database run a very deep OFFSET scan and
 * return a page of results for each one.
 */
export const MAX_PAGE = 500;

export function parsePage(v: string | undefined): number {
  const n = Number(v ?? 1);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(Math.floor(n), MAX_PAGE);
}
