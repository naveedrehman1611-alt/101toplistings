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
      <h2 className="font-title-md text-title-md text-on-surface">Categories</h2>
      <ul className="mt-4 flex flex-wrap gap-2">
        {unique.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/category/${c.slug}`}
              className="border-border-subtle bg-surface-card text-on-surface hover:border-primary-container hover:text-primary-container font-label-sm text-label-sm inline-flex items-center rounded-full border px-3 py-1 transition-colors"
            >
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
