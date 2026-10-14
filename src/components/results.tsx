import Link from 'next/link';
import type { ListingCard as Card } from '@/lib/queries';
import type { CardsContent, ResultsContent } from '@/lib/content/pages/directory';
import { ListingCard } from './listing-card';
import { EmptyState } from './ui';
import { fill } from './browse/fill';

export type SortKey = 'newest' | 'oldest' | 'rating' | 'alphabetical' | 'nearest';

const SORTS = ['newest', 'oldest', 'rating', 'alphabetical'] as const satisfies SortKey[];

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
  params,
  nearest,
  defaultSort = 'newest',
  cityNames,
  emptyTitle,
  emptyBody,
  labels: t,
  cardLabels,
}: {
  listings: Card[];
  basePath: string;
  page: number;
  perPage: number;
  sort: SortKey;
  query?: string;
  /** Active filters, carried through the sort and page links. */
  params?: Record<string, string | undefined>;
  /** Offer "Nearest" as a sort — only when the search has an origin. */
  nearest?: boolean;
  /** The page's own default order, which is left out of the URL. */
  defaultSort?: SortKey;
  cityNames: Map<string, string>;
  emptyTitle: string;
  emptyBody: string;
  /** Editable copy: Admin → Content → Directory: filters, results and cards. */
  labels: ResultsContent;
  cardLabels: CardsContent;
}) {
  const sortLabels: Record<SortKey, string> = {
    nearest: t.sort_nearest,
    newest: t.sort_newest,
    oldest: t.sort_oldest,
    rating: t.sort_rating,
    alphabetical: t.sort_alphabetical,
  };
  // The default order is the bare URL, so "Newest" and the page links do not
  // mint a ?sort= duplicate of every page.
  const sortParam = (s: SortKey) => (s === defaultSort ? undefined : s);
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
        {/* An h2, so the cards' h3 titles follow the page h1 without skipping a level. */}
        <h2 className="font-sans text-sm font-normal tracking-normal text-[var(--text-muted)]">
          {fill(Number(total) === 1 ? t.count_one : t.count_many, { count: total })}
        </h2>
        <div className="flex flex-wrap gap-2">
          {(nearest ? (['nearest', ...SORTS] as SortKey[]) : SORTS).map((key) => (
            <Link
              key={key}
              href={buildHref(basePath, { ...params, q: query, sort: sortParam(key) })}
              // Re-sorted copies of the same page (canonical to it, see
              // resultsPageSeo): crawlers need not follow every order of every page.
              rel={key === defaultSort ? undefined : 'nofollow'}
              className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                sort === key
                  ? 'border-brand-500 bg-brand-50 text-brand-800'
                  : 'border-[var(--border)] hover:bg-[var(--surface-2)]'
              }`}
            >
              {sortLabels[key]}
            </Link>
          ))}
        </div>
      </div>

      {listings.length === 0 ? (
        <EmptyState title={emptyTitle} body={emptyBody} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.map((l) => (
            <ListingCard
              key={l.id}
              listing={l}
              cityName={cityNames.get(l.city_id ?? '')}
              labels={cardLabels}
            />
          ))}
        </div>
      )}

      {pages > 1 ? (
        <nav
          aria-label="Pagination"
          className="mt-10 flex flex-wrap items-center justify-center gap-2"
        >
          {numbers.map((p, i) =>
            p === 'gap' ? (
              <span key={`gap-${i}`} aria-hidden className="px-1 text-sm text-[var(--text-muted)]">
                …
              </span>
            ) : (
              <Link
                key={p}
                href={buildHref(basePath, {
                  ...params,
                  q: query,
                  sort: sortParam(sort),
                  page: p === 1 ? undefined : p,
                })}
                aria-current={p === page ? 'page' : undefined}
                className={`grid h-10 min-w-10 place-items-center rounded-lg border px-3 text-sm ${
                  p === page
                    ? 'border-primary-container bg-primary-container text-on-primary'
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
