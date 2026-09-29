import Link from 'next/link';
import { listingsHref, type ListingsParams } from './href';

const WINDOW = 2;
const STEP =
  'inline-flex h-10 items-center gap-1 rounded-lg border border-[var(--border)] px-3 text-sm';

export function Pager({
  page,
  pages,
  params,
}: {
  page: number;
  pages: number;
  params: ListingsParams;
}) {
  if (pages <= 1) return null;

  // Same window as results.tsx: first, last and two either side of the current
  // page, so the markup stays small however long the list gets.
  const numbers: (number | 'gap')[] = [];
  for (let p = 1; p <= pages; p++) {
    if (p === 1 || p === pages || Math.abs(p - page) <= WINDOW) {
      numbers.push(p);
    } else if (numbers[numbers.length - 1] !== 'gap') {
      numbers.push('gap');
    }
  }
  // Past the end (an old ?page= link), Previous goes to the last real page.
  const prev = Math.min(page - 1, pages);

  return (
    <nav aria-label="Pagination" className="flex flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {prev >= 1 ? (
          <Link
            href={listingsHref({ ...params, page: prev })}
            rel="prev"
            className={`${STEP} hover:bg-[var(--surface-2)]`}
          >
            <span aria-hidden>‹</span> Previous
          </Link>
        ) : (
          // role="link" so screen readers announce it as an unavailable link;
          // aria-disabled on a plain span is ignored.
          <span
            role="link"
            aria-disabled="true"
            className={`${STEP} text-[var(--text-muted)] opacity-50`}
          >
            <span aria-hidden>‹</span> Previous
          </span>
        )}

        {numbers.map((p, i) =>
          p === 'gap' ? (
            <span key={`gap-${i}`} aria-hidden className="px-1 text-sm text-[var(--text-muted)]">
              …
            </span>
          ) : (
            <Link
              key={p}
              href={listingsHref({ ...params, page: p })}
              aria-current={p === page ? 'page' : undefined}
              className={`grid h-10 min-w-10 place-items-center rounded-lg border px-3 text-sm ${
                p === page
                  ? 'border-primary-container bg-primary-container text-on-primary'
                  : 'border-[var(--border)] hover:bg-[var(--surface-2)]'
              }`}
            >
              <span className="sr-only">Page </span>
              {p}
            </Link>
          ),
        )}

        {page < pages ? (
          <Link
            href={listingsHref({ ...params, page: page + 1 })}
            rel="next"
            className={`${STEP} hover:bg-[var(--surface-2)]`}
          >
            Next <span aria-hidden>›</span>
          </Link>
        ) : (
          <span
            role="link"
            aria-disabled="true"
            className={`${STEP} text-[var(--text-muted)] opacity-50`}
          >
            Next <span aria-hidden>›</span>
          </span>
        )}
      </div>
      <p className="text-sm text-[var(--text-muted)]">
        Page {page} of {pages}
      </p>
    </nav>
  );
}
