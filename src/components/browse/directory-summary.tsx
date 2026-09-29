import Link from 'next/link';
import type { DirectoryFacets, FacetCount } from '@/lib/browse';
import { listingsHref, type ListingsParams } from './href';

const NUMBER = new Intl.NumberFormat('en-US');

export function DirectorySummary({
  facets,
  params,
}: {
  facets: DirectoryFacets;
  params: ListingsParams;
}) {
  if (facets.total === 0) return null;

  const stats = [
    { label: 'Listings', value: facets.total },
    { label: 'Featured', value: facets.featured },
    { label: 'With phone', value: facets.withPhone },
    { label: 'Categories', value: facets.categoryCount },
    { label: 'Cities', value: facets.cityCount },
  ];
  const hasChips = facets.topCategories.length > 0 || facets.topCities.length > 0;

  return (
    <section aria-labelledby="directory-summary-heading">
      <h2 id="directory-summary-heading" className="font-display text-xl font-semibold">
        Directory at a glance
      </h2>
      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="surface-card flex flex-col p-4">
            {/* dt must come first inside the group; order-first puts the
                number on top visually. */}
            <dt className="mt-1 text-sm text-[var(--text-muted)]">{s.label}</dt>
            <dd className="font-display text-brand-700 order-first text-2xl font-bold tabular-nums">
              {NUMBER.format(s.value)}
            </dd>
          </div>
        ))}
      </dl>

      {hasChips ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <FacetChips
            heading="Top categories"
            items={facets.topCategories}
            active={params.category}
            hrefFor={(category) => listingsHref({ ...params, category, page: undefined })}
          />
          <FacetChips
            heading="Top cities"
            items={facets.topCities}
            active={params.city}
            hrefFor={(city) => listingsHref({ ...params, city, page: undefined })}
          />
        </div>
      ) : null}
    </section>
  );
}

function FacetChips({
  heading,
  items,
  active,
  hrefFor,
}: {
  heading: string;
  items: FacetCount[];
  /** Slug of the filter currently applied, if any. */
  active?: string;
  hrefFor: (slug: string | undefined) => string;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="text-base font-semibold">{heading}</h3>
      <ul className="mt-3 flex flex-wrap gap-2">
        {items.map((f) => {
          const current = f.slug === active;
          return (
            <li key={f.slug}>
              {/* The active chip links to the same view without that filter,
                  so a second click clears it. */}
              <Link
                href={hrefFor(current ? undefined : f.slug)}
                aria-current={current ? 'true' : undefined}
                className={`inline-flex items-center gap-2 rounded-full border py-1.5 pr-2 pl-3 text-sm transition-colors ${
                  current
                    ? 'border-brand-500 bg-brand-50 text-brand-800'
                    : 'border-[var(--border)] hover:bg-[var(--surface-2)]'
                }`}
              >
                {f.name}
                <span
                  className={`rounded-full px-1.5 text-xs tabular-nums ${
                    current ? 'bg-brand-100 text-brand-800' : 'bg-ink-100 text-[var(--text-muted)]'
                  }`}
                >
                  {NUMBER.format(f.count)}
                  <span className="sr-only"> listings</span>
                </span>
                {current ? (
                  <span aria-hidden className="text-brand-700 pr-1">
                    ×
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
