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
  const pages = Math.max(1, Math.ceil(Number(total) / perPage));

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
                  ? 'border-brand-500 bg-brand-50 text-brand-800 dark:bg-brand-900/40 dark:text-brand-100'
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
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
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
          ))}
        </nav>
      ) : null}
    </>
  );
}

export function parseSort(v: string | undefined): SortKey {
  return v === 'oldest' || v === 'rating' || v === 'alphabetical' || v === 'nearest' ? v : 'newest';
}

export function parsePage(v: string | undefined): number {
  const n = Number(v ?? 1);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}
