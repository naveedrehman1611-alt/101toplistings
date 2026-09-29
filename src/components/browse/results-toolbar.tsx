import Link from 'next/link';
import { BROWSE_SORTS, type BrowseSort } from '@/lib/browse';
import { listingsHref, type ListingsParams } from './href';

const NUMBER = new Intl.NumberFormat('en-US');

export function ResultsToolbar({
  total,
  page,
  perPage,
  sort,
  params,
}: {
  total: number;
  page: number;
  perPage: number;
  sort: BrowseSort;
  params: ListingsParams;
}) {
  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);
  const noun = total === 1 ? 'listing' : 'listings';

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <p className="text-sm text-[var(--text-muted)]">
        {total === 0 || from > total
          ? `${NUMBER.format(total)} ${noun}`
          : `Showing ${NUMBER.format(from)}–${NUMBER.format(to)} of ${NUMBER.format(total)} ${noun}`}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-[var(--text-muted)]">Sort:</span>
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
            {s.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
