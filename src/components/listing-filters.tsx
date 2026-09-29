import Link from 'next/link';
import { NearMeButton } from './near-me-button';

type Option = { slug: string; name: string };

/**
 * Keyword + category + city filters (§7.5.6, criterion 46). A plain GET form,
 * so every filter lives in the URL: results are shareable, the back button
 * works, and nothing needs client JavaScript. Omit `categories` or `cities` to
 * hide that field on a page already scoped to one.
 */
export function ListingFilters({
  action,
  q,
  category,
  city,
  sort,
  defaultSort = 'newest',
  categories,
  cities,
  nearMe,
  near,
}: {
  action: string;
  q?: string;
  category?: string;
  city?: string;
  sort?: string;
  /** The page's own default order, which is left out of the URL. */
  defaultSort?: string;
  categories?: Option[];
  cities?: Option[];
  /** Show the "Near me" button (it searches from /search). */
  nearMe?: boolean;
  /** An active location search, kept when the other filters change. */
  near?: { lat: number; lng: number; radius: number };
}) {
  const active = Boolean(q || category || city || near);
  const selectCls =
    'focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-hidden';

  return (
    <form
      action={action}
      role="search"
      className="surface-card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto]"
    >
      <label className="block text-sm">
        <span className="sr-only">Keyword</span>
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Business name or keyword"
          className={selectCls}
        />
      </label>
      {categories ? (
        <label className="block text-sm">
          <span className="sr-only">Category</span>
          <select name="category" defaultValue={category ?? ''} className={selectCls}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {cities ? (
        <label className="block text-sm">
          <span className="sr-only">City</span>
          <select name="city" defaultValue={city ?? ''} className={selectCls}>
            <option value="">All cities</option>
            {cities.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {sort && sort !== defaultSort ? <input type="hidden" name="sort" value={sort} /> : null}
      {near ? (
        <>
          <input type="hidden" name="lat" value={near.lat} />
          <input type="hidden" name="lng" value={near.lng} />
          <input type="hidden" name="radius" value={near.radius} />
        </>
      ) : null}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="bg-primary-container font-label-md text-label-md text-on-primary hover:bg-primary focus-visible:ring-primary-container h-11 rounded-lg px-5 shadow-xs transition hover:shadow-[0_4px_12px_rgba(4,120,87,0.25)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
        >
          Filter
        </button>
        {nearMe && !near ? <NearMeButton /> : null}
        {active ? (
          <Link href={action} className="text-brand-700 text-sm whitespace-nowrap hover:underline">
            Clear
          </Link>
        ) : null}
      </div>
    </form>
  );
}
