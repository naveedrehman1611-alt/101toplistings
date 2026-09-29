import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  getAllListingSlugs,
  getCategories,
  getCities,
  getListing,
  getListingImages,
  getApprovedReviews,
  getOpeningHours,
  searchListings,
} from '@/lib/queries';
import { Badge, Breadcrumbs, Stars } from '@/components/ui';
import { Icon } from '@/components/icon';
import { ListingCard } from '@/components/listing-card';
import { SITE_URL } from '@/lib/supabase';
import { SHARE_IMAGE } from '@/lib/seo';
import { redirectOrNotFound } from '@/lib/redirects';

export const revalidate = 600;

// Prerender the newest listings only. Anything outside this window is rendered
// on first request and then cached by ISR for `revalidate` seconds, so build
// time and build-time egress stay flat as the directory grows.
const PRERENDER_LIMIT = 200;

export async function generateStaticParams() {
  const slugs = await getAllListingSlugs(PRERENDER_LIMIT);
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
    openGraph: { title, description, url, type: 'profile', images: [SHARE_IMAGE] },
    twitter: { card: 'summary_large_image', title, description, images: [SHARE_IMAGE] },
  };
}

export default async function ListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = await getListing(slug);
  // A retired slug may have a stored redirect; otherwise this renders the 404.
  if (!listing) return redirectOrNotFound(`/listing/${encodeURIComponent(slug)}`);

  const [hours, categories, cities, reviews, images] = await Promise.all([
    getOpeningHours(listing.id),
    getCategories(),
    getCities(),
    getApprovedReviews(listing.id),
    getListingImages(listing.id),
  ]);

  const category = categories.find((c) => c.id === listing.category_id);
  const city = cities.find((c) => c.id === listing.city_id);
  const related = await searchListings({ categoryId: listing.category_id ?? undefined, limit: 4 });
  const cityNames = new Map(cities.map((c) => [c.id, c.name]));

  // Google Maps directions: the exact coordinates when the listing has them,
  // otherwise its written address. No location at all means no link.
  const directionsUrl =
    listing.latitude !== null && listing.longitude !== null
      ? `https://www.google.com/maps/dir/?api=1&destination=${listing.latitude},${listing.longitude}`
      : listing.address
        ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
            `${listing.address}${city ? `, ${city.name}` : ''}, Pakistan`,
          )}`
        : null;

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
  if (images.cover || images.gallery.length > 0) {
    jsonLd.image = [images.cover, ...images.gallery].flatMap((m) => (m ? [m.url] : []));
  }
  if (images.logo) jsonLd.logo = images.logo.url;
  if (listing.social_links.length > 0) {
    jsonLd.sameAs = listing.social_links.map((s) => s.url);
  }

  return (
    <div className="container-page py-12">
      <script
        type="application/ld+json"
        // Names and descriptions come from business owners; escaping < stops a
        // "</script>" in them from closing the tag and injecting markup.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <Breadcrumbs
        trail={[
          { label: 'Home', href: '/' },
          { label: 'Listings', href: '/listings' },
          ...(category ? [{ label: category.name, href: `/category/${category.slug}` }] : []),
          { label: listing.name },
        ]}
      />

      {/* The gradient stays as the fallback for a listing with no cover. */}
      <div className="from-brand-600 to-brand-800 relative aspect-[4/1] overflow-hidden rounded-xl bg-gradient-to-br">
        {images.cover ? (
          <Image
            src={images.cover.url}
            alt={images.cover.alt ?? ''}
            fill
            // The cover is the LCP element on this page, so fetch it first.
            preload
            sizes="(min-width: 1280px) 1200px, 100vw"
            className="object-cover"
          />
        ) : null}
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_20rem]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            {category ? <Badge>{category.name}</Badge> : null}
            {listing.verification === 'verified' ? <Badge>Verified</Badge> : null}
          </div>
          <div className="mt-3 flex items-center gap-4">
            {images.logo ? (
              <Image
                src={images.logo.url}
                alt={images.logo.alt ?? `${listing.name} logo`}
                width={64}
                height={64}
                className="size-16 shrink-0 rounded-lg border border-[var(--border)] bg-[var(--surface)] object-contain"
              />
            ) : null}
            <h1 className="font-headline-lg text-headline-lg">{listing.name}</h1>
          </div>
          {listing.tagline ? (
            <p className="mt-2 text-lg text-[var(--text-muted)]">{listing.tagline}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <Stars value={listing.rating_average} count={listing.review_count} />
            {city ? <span className="text-sm text-[var(--text-muted)]">{city.name}</span> : null}
          </div>

          {listing.description ? (
            <section className="mt-10">
              <h2 className="font-headline-sm text-headline-sm">About</h2>
              <p className="mt-3 leading-relaxed whitespace-pre-line text-[var(--text-muted)]">
                {listing.description}
              </p>
            </section>
          ) : null}

          {images.gallery.length > 0 ? (
            <section className="mt-10">
              <h2 className="font-headline-sm text-headline-sm">Photos</h2>
              <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {images.gallery.map((g) => (
                  <li key={g.id}>
                    <a
                      href={g.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative block aspect-[4/3] overflow-hidden rounded-lg bg-[var(--surface-2)]"
                    >
                      <Image
                        src={g.url}
                        alt={g.alt ?? ''}
                        fill
                        sizes="(min-width: 1024px) 16rem, (min-width: 640px) 33vw, 50vw"
                        className="object-cover transition-transform hover:scale-105"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {hours.length > 0 ? (
            <section className="mt-10">
              <h2 className="font-headline-sm text-headline-sm">Opening hours</h2>
              <table className="mt-4 w-full max-w-md text-sm">
                <tbody>
                  {hours.map((h) => (
                    <tr
                      key={h.day_of_week}
                      className="border-b border-[var(--border)] last:border-0"
                    >
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
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-headline-sm text-headline-sm">Reviews</h2>
              <Link
                href={`/listing/${listing.slug}/review`}
                className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm hover:bg-[var(--surface-2)]"
              >
                Write a review
              </Link>
            </div>
            {reviews.length === 0 ? (
              <p className="mt-3 text-[var(--text-muted)]">
                No reviews yet. Be the first to review this business.
              </p>
            ) : (
              <ul className="mt-4 space-y-4">
                {reviews.map((r) => (
                  <li key={r.id} className="surface-card p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span aria-label={`${r.rating} out of 5 stars`} className="text-badge-gold">
                        {'★'.repeat(r.rating)}
                        <span className="text-[var(--border)]">{'★'.repeat(5 - r.rating)}</span>
                      </span>
                      {r.title ? <span className="font-medium">{r.title}</span> : null}
                    </div>
                    {r.body ? (
                      <p className="mt-2 text-sm leading-relaxed whitespace-pre-line">{r.body}</p>
                    ) : null}
                    <p className="mt-2 text-xs text-[var(--text-muted)]">
                      {r.author_name ?? 'Visitor'} ·{' '}
                      {new Date(r.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                    {r.reply_body ? (
                      <div className="border-brand-500 mt-3 border-l-2 pl-3 text-sm">
                        <p className="font-medium">Reply from the business</p>
                        <p className="mt-1 whitespace-pre-line text-[var(--text-muted)]">
                          {r.reply_body}
                        </p>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="surface-card p-5">
            <h2 className="font-title-md text-title-md">Contact</h2>
            <dl className="mt-4 space-y-3 text-sm">
              {listing.address || directionsUrl ? (
                <div>
                  <dt className="text-[var(--text-muted)]">
                    {listing.address ? 'Address' : 'Location'}
                  </dt>
                  {listing.address ? <dd>{listing.address}</dd> : null}
                  {directionsUrl ? (
                    <dd className={listing.address ? 'mt-1' : undefined}>
                      <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-700 inline-flex items-center gap-1 hover:underline"
                      >
                        <Icon name="near_me" size={16} />
                        Get directions
                      </a>
                    </dd>
                  ) : null}
                </div>
              ) : null}
              {listing.phone_primary ? (
                <div>
                  <dt className="text-[var(--text-muted)]">Phone</dt>
                  <dd>
                    <a
                      href={`tel:${listing.phone_primary.replace(/\s+/g, '')}`}
                      className="text-brand-700 hover:underline"
                    >
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
                className="bg-primary-container font-label-md text-label-md text-on-primary hover:bg-primary focus-visible:ring-primary-container mt-5 flex h-11 items-center justify-center rounded-lg shadow-xs transition hover:shadow-[0_4px_12px_rgba(4,120,87,0.25)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
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

          <div className="mt-4 space-y-2 px-1 text-sm">
            <p>
              <span className="text-[var(--text-muted)]">Own this business? </span>
              <Link
                href={`/listing/${listing.slug}/claim`}
                className="text-brand-700 font-medium hover:underline"
              >
                Claim it for free
              </Link>
            </p>
            <p>
              <Link
                href={`/listing/${listing.slug}/report`}
                className="text-[var(--text-muted)] hover:underline"
              >
                Report a problem with this listing
              </Link>
            </p>
          </div>
        </aside>
      </div>

      {related.filter((r) => r.slug !== listing.slug).length > 0 ? (
        <section className="mt-16">
          <h2 className="font-headline-sm text-headline-sm">Related businesses</h2>
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
