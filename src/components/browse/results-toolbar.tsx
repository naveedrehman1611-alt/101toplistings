import Link from 'next/link';
import { BROWSE_SORTS, type BrowseSort } from '@/lib/browse';
import type { ResultsContent } from '@/lib/content/pages/directory';
import { listingsHref, type ListingsParams } from './href';
import { fill } from './fill';

const NUMBER = new Intl.NumberFormat('en-US');

export function ResultsToolbar({
  total,
  page,
  perPage,
  sort,
  params,
  labels: t,
}: {
  total: number;
  page: number;
  perPage: number;
  sort: BrowseSort;
  params: ListingsParams;
  labels: ResultsContent;
}) {
  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);
  const noun = total === 1 ? t.listing_one : t.listing_many;
  const sortLabels: Record<BrowseSort, string> = {
    featured: t.sort_featured,
    newest: t.sort_newest,
    oldest: t.sort_oldest,
    rating: t.sort_rating,
    alphabetical: t.sort_alphabetical,
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <p className="text-sm text-[var(--text-muted)]">
        {total === 0 || from > total
          ? `${NUMBER.format(total)} ${noun}`
          : fill(t.showing, {
              from: NUMBER.format(from),
              to: NUMBER.format(to),
              total: NUMBER.format(total),
              noun,
            })}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-[var(--text-muted)]">{t.sort_label}</span>
        {BROWSE_SORTS.map((s) => (
          <Link
            key={s.key}
            // A new order starts again from the first page.
            href={listingsHref({ ...params, sort: s.key, page: undefined })}
            aria-current={sort === s.key ? 'true' : undefined}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              sort === s.key
                ? 'border-brand-500 bg-brand-50 text-brand-800'
                : 'border-[var(--border)] hover:bg-[var(--surface-2)]'
            }`}
          >
            {sortLabels[s.key]}
          </Link>
        ))}
      </div>
    </div>
  );
}
