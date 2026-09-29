import type { Metadata } from 'next';
import {
  getAllListingSlugs,
  getApprovedReviews,
  getCategories,
  getCities,
  getListing,
  getListingImages,
  getOpeningHours,
  getSettings,
  getSimilarListings,
  settingText,
  type Category,
  type City,
  type ListingDetail,
} from '@/lib/queries';
import { Breadcrumbs } from '@/components/ui';
import { SITE_URL } from '@/lib/supabase';
import { redirectOrNotFound } from '@/lib/redirects';
import { DAYS } from '@/lib/hours';
import { ListingHero } from '@/components/listing/listing-hero';
import { ListingDescription } from '@/components/listing/listing-description';
import { ListingReviews } from '@/components/listing/listing-reviews';
import { ListingGallery } from '@/components/listing/listing-gallery';
import { ListingInformation } from '@/components/listing/listing-information';
import { ListingHours } from '@/components/listing/listing-hours';
import { ListingCategories } from '@/components/listing/listing-categories';
import { ListingAuthor } from '@/components/listing/listing-author';
import { ContactAuthorForm } from '@/components/listing/contact-author-form';
import { SimilarListings } from '@/components/listing/similar-listings';
import { SubmitListingCta } from '@/components/listing/submit-listing-cta';

export const revalidate = 600;

// Prerender the newest listings only. Anything outside this window is rendered
// on first request and then cached by ISR for `revalidate` seconds, so build
// time and build-time egress stay flat as the directory grows.
const PRERENDER_LIMIT = 200;

export async function generateStaticParams() {
  const slugs = await getAllListingSlugs(PRERENDER_LIMIT);
  return slugs.map((slug) => ({ slug }));
}

/** Category and city rows for a listing. Both lists are cached per request. */
async function taxonomyFor(listing: ListingDetail) {
  const [categories, cities] = await Promise.all([getCategories(), getCities()]);
  const byId = <T extends { id: string }>(rows: T[], id: string | null) =>
    id ? rows.find((r) => r.id === id) : undefined;
  return {
    categories,
    cities,
    category: byId<Category>(categories, listing.category_id),
    subcategory: byId<Category>(categories, listing.subcategory_id),
    city: byId<City>(cities, listing.city_id),
  };
}

/** Cuts at a word boundary so a meta description never ends mid-word. */
function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 0 ? cut.lastIndexOf(' ') : cut.length)}…`;
}

/**
 * "{Name} – {Category} in {City}. {Tagline} Address, phone, opening hours and
 * reviews." A template rather than a raw cut of the description, which can
 * start anywhere and read as nothing in a search result.
 */
function metaDescription(listing: ListingDetail, category?: string, city?: string): string {
  if (listing.seo_description) return listing.seo_description;
  const what = [category, city ? `in ${city}` : null].filter(Boolean).join(' ');
  const tagline = listing.tagline?.trim();
  const parts = [
    what ? `${listing.name} – ${what}.` : `${listing.name}.`,
    tagline ? (/[.!?]$/.test(tagline) ? tagline : `${tagline}.`) : null,
    'Address, phone, opening hours and reviews.',
  ];
  return clip(parts.filter(Boolean).join(' '), 160);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListing(slug);
  if (!listing) return { title: 'Not found' };
  const [{ category, city }, images, settings] = await Promise.all([
    taxonomyFor(listing),
    getListingImages(listing.id),
    getSettings(),
  ]);

  const title = listing.seo_title ?? listing.name;
  const description = metaDescription(listing, category?.name, city?.name);
  const url = `${SITE_URL}/listing/${listing.slug}`;
  const image = images.cover ?? images.logo ?? images.gallery[0] ?? null;
  const ogImage = image
    ? {
        url: image.url,
        alt: image.alt ?? listing.name,
        ...(image.width && image.height ? { width: image.width, height: image.height } : {}),
      }
    : null;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
    // Page-level openGraph replaces the layout's rather than merging, so the
    // site name is repeated here.
    openGraph: {
      type: 'website',
      title,
      description,
      url,
      siteName: settingText(settings, 'brand.name', 'RankYouSite'),
      locale: 'en_US',
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(ogImage ? { images: [ogImage.url] } : {}),
    },
  };
}

/** Owner- and visitor-written text goes inside a script tag; "<" must not close it. */
function jsonLdHtml(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, '\\u003c') };
}

export default async function ListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = await getListing(slug);
  // A retired slug may have a stored redirect; otherwise this renders the 404.
  if (!listing) return redirectOrNotFound(`/listing/${encodeURIComponent(slug)}`);

  const [{ categories, cities, category, subcategory, city }, hours, reviews, images, similar] =
    await Promise.all([
      taxonomyFor(listing),
      getOpeningHours(listing.id),
      getApprovedReviews(listing.id),
      getListingImages(listing.id),
      getSimilarListings(listing),
    ]);

  const url = `${SITE_URL}/listing/${listing.slug}`;
  const cityNames = new Map(cities.map((c) => [c.id, c.name]));
  const categoryLinks = new Map(categories.map((c) => [c.id, { name: c.name, slug: c.slug }]));

  // Home › Category › City › Business — the same trail is emitted as BreadcrumbList.
  const trail = [
    { label: 'Home', href: '/' },
    ...(category ? [{ label: category.name, href: `/category/${category.slug}` }] : []),
    ...(city ? [{ label: city.name, href: `/city/${city.slug}` }] : []),
    { label: listing.name },
  ];

  // §7.5.8 / criterion 48: emit only what is real and visible on the page.
  const business: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${url}#business`,
    name: listing.name,
    url,
  };
  if (listing.description) business.description = listing.description;
  if (listing.phone_primary) business.telephone = listing.phone_primary;
  if (listing.email) business.email = listing.email.toLowerCase();
  if (listing.address) {
    business.address = {
      '@type': 'PostalAddress',
      streetAddress: listing.address,
      addressLocality: city?.name,
      postalCode: listing.postal_code ?? undefined,
    };
  }
  if (listing.latitude !== null && listing.longitude !== null) {
    business.geo = {
      '@type': 'GeoCoordinates',
      latitude: listing.latitude,
      longitude: listing.longitude,
    };
  }
  if (hours.length > 0) {
    business.openingHoursSpecification = hours
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
    business.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: listing.rating_average,
      reviewCount: listing.review_count,
      bestRating: 5,
      worstRating: 1,
    };
  }
  // Only reviews shown on the page, and only those with a named author, which
  // Review markup requires.
  const namedReviews = reviews.filter((r) => r.author_name).slice(0, 10);
  if (namedReviews.length > 0) {
    business.review = namedReviews.map((r) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.author_name },
      datePublished: r.created_at.slice(0, 10),
      reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5, worstRating: 1 },
      ...(r.title ? { name: r.title } : {}),
      ...(r.body ? { reviewBody: r.body } : {}),
    }));
  }
  if (images.cover || images.gallery.length > 0) {
    business.image = [images.cover, ...images.gallery].flatMap((m) => (m ? [m.url] : []));
  }
  if (images.logo) business.logo = images.logo.url;
  if (listing.social_links.length > 0) {
    business.sameAs = listing.social_links.map((s) => s.url);
  }

  const breadcrumbList = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      item: c.href ? `${SITE_URL}${c.href}` : url,
    })),
  };

  return (
    <div className="container-page py-8 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(business)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(breadcrumbList)} />
      <Breadcrumbs trail={trail} />

      <ListingHero
        listing={listing}
        categoryName={category?.name ?? null}
        cityName={city?.name ?? null}
        cover={images.cover}
        logo={images.logo}
        shareUrl={url}
      />

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Main column, in the reference order: description, reviews, gallery. */}
        <div className="min-w-0 [&>section:first-child]:mt-0">
          <ListingDescription text={listing.description} />
          <ListingReviews listing={listing} reviews={reviews} />
          <ListingGallery images={images.gallery} name={listing.name} />
        </div>

        <aside className="space-y-5">
          <ListingInformation listing={listing} cityName={city?.name ?? null} />
          <ListingHours hours={hours} />
          <ListingCategories
            categories={[category, subcategory].flatMap((c) =>
              c ? [{ name: c.name, slug: c.slug }] : [],
            )}
          />
          <ListingAuthor listing={listing} logo={images.logo} />
          <ContactAuthorForm listingId={listing.id} slug={listing.slug} name={listing.name} />
        </aside>
      </div>

      <SimilarListings listings={similar} cityNames={cityNames} categories={categoryLinks} />
      <SubmitListingCta />
    </div>
  );
}
