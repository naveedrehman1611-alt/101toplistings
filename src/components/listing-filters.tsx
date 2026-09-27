import Link from 'next/link';

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
  categories,
  cities,
}: {
  action: string;
  q?: string;
  category?: string;
  city?: string;
  sort?: string;
  categories?: Option[];
  cities?: Option[];
}) {
  const active = Boolean(q || category || city);
  const selectCls =
    'focus:border-brand-500 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none';

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
      {sort && sort !== 'newest' ? <input type="hidden" name="sort" value={sort} /> : null}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="bg-brand-700 hover:bg-brand-800 h-11 rounded-lg px-5 text-sm font-medium text-white"
        >
          Filter
        </button>
        {active ? (
          <Link href={action} className="text-brand-700 text-sm whitespace-nowrap hover:underline">
            Clear
          </Link>
        ) : null}
      </div>
    </form>
  );
}
