import Link from 'next/link';

export function ListingCategories({
  categories,
}: {
  categories: { name: string; slug: string }[];
}) {
  // One pill per category, even if the same one is passed twice.
  const unique = [...new Map(categories.map((c) => [c.slug, c])).values()];
  if (unique.length === 0) return null;

  return (
    <section className="surface-card p-5">
      <h2 className="font-display text-lg font-semibold">Categories</h2>
      <ul className="mt-4 flex flex-wrap gap-2">
        {unique.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/category/${c.slug}`}
              className="hover:border-brand-500 hover:bg-brand-50 hover:text-brand-800 inline-flex items-center rounded-full border border-[var(--border)] px-3 py-1 text-sm"
            >
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
