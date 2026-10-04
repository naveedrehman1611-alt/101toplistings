import { SITE_URL } from '@/lib/supabase';

/**
 * A schema.org block. Names come from editors and business owners, so "<" is
 * escaped: a "</script>" in one of them cannot close the tag and inject markup.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}

/** Absolute URL for a site path, as schema.org expects. */
function absolute(path: string): string {
  return `${SITE_URL}${path === '/' ? '' : path}`;
}

/** BreadcrumbList matching the visible <Breadcrumbs> trail; the last crumb is the page itself. */
export function breadcrumbSchema(
  trail: { label: string; href?: string }[],
  currentPath: string,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      item: absolute(c.href ?? currentPath),
    })),
  };
}

/** ItemList of the listings shown on the page, in the order they are shown. */
export function itemListSchema(
  name: string,
  listings: { slug: string; name: string }[],
  offset = 0,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: listings.length,
    itemListElement: listings.map((l, i) => ({
      '@type': 'ListItem',
      position: offset + i + 1,
      url: absolute(`/listing/${l.slug}`),
      name: l.name,
    })),
  };
}
