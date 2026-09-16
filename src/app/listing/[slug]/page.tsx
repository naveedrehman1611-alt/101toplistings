import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getAllListingSlugs,
  getCategories,
  getCities,
  getListing,
  getOpeningHours,
  searchListings,
} from '@/lib/queries';
import { Badge, Breadcrumbs, Stars } from '@/components/ui';
import { ListingCard } from '@/components/listing-card';
import { SITE_URL } from '@/lib/supabase';

export const revalidate = 600;

export async function generateStaticParams() {
  const slugs = await getAllListingSlugs();
  return slugs.map((slug) => ({ slug }));
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function fmt(t: string | null) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = Number(h);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${m} ${suffix}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListing(slug);
  if (!listing) return { title: 'Not found' };
  const title = listing.seo_title ?? listing.name;
  const description =
    listing.seo_description ?? listing.tagline ?? listing.description?.slice(0, 155) ?? '';
  const url = `${SITE_URL}/listing/${listing.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'profile' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function ListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = await getListing(slug);
  if (!listing) notFound();

  const [hours, categories, cities] = await Promise.all([
    getOpeningHours(listing.id),
    getCategories(),
    getCities(),
  ]);

  const category = categories.find((c) => c.id === listing.category_id);
  const city = cities.find((c) => c.id === listing.city_id);
  const related = await searchListings({ categoryId: listing.category_id ?? undefined, limit: 4 });
  const cityNames = new Map(cities.map((c) => [c.id, c.name]));

  // §7.5.8 / criterion 48: emit only what is real and visible on the page.
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: listing.name,
    url: `${SITE_URL}/listing/${listing.slug}`,
  };
  if (listing.description) jsonLd.description = listing.description;
  if (listing.phone_primary) jsonLd.telephone = listing.phone_primary;
  if (listing.email) jsonLd.email = listing.email;
  if (listing.address) {
    jsonLd.address = {
      '@type': 'PostalAddress',
      streetAddress: listing.address,
      addressLocality: city?.name,
      postalCode: listing.postal_code ?? undefined,
    };
  }
  if (listing.latitude !== null && listing.longitude !== null) {
    jsonLd.geo = {
      '@type': 'GeoCoordinates',
      latitude: listing.latitude,
      longitude: listing.longitude,
    };
  }
  if (hours.length > 0) {
    jsonLd.openingHoursSpecification = hours
      .filter((h) => !h.is_closed)
      .map((h) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: DAYS[h.day_of_week],
        opens: h.is_24h ? '00:00' : h.opens_at,
        closes: h.is_24h ? '23:59' : h.closes_at,
      }));
  }
  // Never emit aggregateRating when there are no reviews — the reference site's defect.
  if (listing.review_count > 0 && listing.rating_average !== null) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: listing.rating_average,
      reviewCount: listing.review_count,
    };
  }
  if (listing.social_links.length > 0) {
    jsonLd.sameAs = listing.social_links.map((s) => s.url);
  }

  return (
    <div className="container-page py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs
        trail={[
          { label: 'Home', href: '/' },
          { label: 'Listings', href: '/listings' },
          ...(category ? [{ label: category.name, href: `/category/${category.slug}` }] : []),
          { label: listing.name },
        ]}
      />

      <div className="aspect-[4/1] rounded-xl bg-gradient-to-br from-brand-600 to-brand-800" />

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_20rem]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            {category ? <Badge>{category.name}</Badge> : null}
            {listing.verification === 'verified' ? <Badge>Verified</Badge> : null}
          </div>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{listing.name}</h1>
          {listing.tagline ? (
            <p className="mt-2 text-lg text-[var(--text-muted)]">{listing.tagline}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <Stars value={listing.rating_average} count={listing.review_count} />
            {city ? <span className="text-sm text-[var(--text-muted)]">{city.name}</span> : null}
          </div>

          {listing.description ? (
            <section className="mt-10">
              <h2 className="text-xl font-semibold">About</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-[var(--text-muted)]">
                {listing.description}
              </p>
            </section>
          ) : null}

          {hours.length > 0 ? (
            <section className="mt-10">
              <h2 className="text-xl font-semibold">Opening hours</h2>
              <table className="mt-4 w-full max-w-md text-sm">
                <tbody>
                  {hours.map((h) => (
                    <tr key={h.day_of_week} className="border-b border-[var(--border)] last:border-0">
                      <th scope="row" className="py-2.5 text-left font-medium">
                        {DAYS[h.day_of_week]}
                      </th>
                      <td className="py-2.5 text-right text-[var(--text-muted)]">
                        {h.is_closed
                          ? 'Closed'
                          : h.is_24h
                            ? 'Open 24 hours'
                            : `${fmt(h.opens_at)} – ${fmt(h.closes_at)}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ) : null}

          <section className="mt-10">
            <h2 className="text-xl font-semibold">Reviews</h2>
            {listing.review_count === 0 ? (
              <p className="mt-3 text-[var(--text-muted)]">
                No reviews yet. Sign in to be the first to review this business.
              </p>
            ) : null}
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="surface-card p-5">
            <h2 className="font-display font-semibold">Contact</h2>
            <dl className="mt-4 space-y-3 text-sm">
              {listing.address ? (
                <div>
                  <dt className="text-[var(--text-muted)]">Address</dt>
                  <dd>{listing.address}</dd>
                </div>
              ) : null}
              {listing.phone_primary ? (
                <div>
                  <dt className="text-[var(--text-muted)]">Phone</dt>
                  <dd>
                    <a href={`tel:${listing.phone_primary.replace(/\s+/g, '')}`} className="text-brand-700 hover:underline">
                      {listing.phone_primary}
                    </a>
                  </dd>
                </div>
              ) : null}
              {listing.email ? (
                <div>
                  <dt className="text-[var(--text-muted)]">Email</dt>
                  <dd>
                    <a href={`mailto:${listing.email}`} className="text-brand-700 hover:underline">
                      {listing.email}
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>

            {listing.phone_primary ? (
              <a
                href={`tel:${listing.phone_primary.replace(/\s+/g, '')}`}
                className="mt-5 flex h-11 items-center justify-center rounded-lg bg-brand-700 font-medium text-white hover:bg-brand-800"
              >
                Call now
              </a>
            ) : null}
            {listing.website ? (
              <a
                href={listing.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex h-11 items-center justify-center rounded-lg border border-[var(--border)] font-medium hover:bg-[var(--surface-2)]"
              >
                Visit website
              </a>
            ) : null}

            {listing.social_links.length > 0 ? (
              <ul className="mt-5 flex flex-wrap gap-2">
                {listing.social_links.map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-[var(--border)] px-2.5 py-1 text-xs hover:bg-[var(--surface-2)]"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </aside>
      </div>

      {related.filter((r) => r.slug !== listing.slug).length > 0 ? (
        <section className="mt-16">
          <h2 className="text-xl font-semibold">Related businesses</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related
              .filter((r) => r.slug !== listing.slug)
              .slice(0, 4)
              .map((r) => (
                <ListingCard key={r.id} listing={r} cityName={cityNames.get(r.city_id ?? '')} />
              ))}
          </div>
        </section>
      ) : null}

      <p className="mt-16 text-sm">
        <Link href="/listings" className="text-brand-700 hover:underline">
          ← Back to all listings
        </Link>
      </p>
    </div>
  );
}
