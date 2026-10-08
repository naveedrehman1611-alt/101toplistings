import Image from 'next/image';
import type { ListingDetail, ListingImage } from '@/lib/queries';
import { Icon } from '@/components/icon';
import { Badge, Stars } from '@/components/ui';
import { ListingActions } from './listing-actions';

/**
 * Cover, badges, name and the at-a-glance facts at the top of a listing page.
 * Rendered into the ISR-cached page, so it reads nothing per visitor: anything
 * that depends on who is looking (the saved state) lives in ListingActions.
 * Every row is omitted when its data is missing rather than shown empty.
 */
export function ListingHero({
  listing,
  categoryName,
  cityName,
  cover,
  logo,
  shareUrl,
}: {
  listing: ListingDetail;
  categoryName: string | null;
  cityName: string | null;
  cover: ListingImage | null;
  logo: ListingImage | null;
  shareUrl: string;
}) {
  const verified = listing.verification === 'verified';
  const hasBadges = listing.is_featured || verified || Boolean(categoryName);
  const rating = listing.review_count > 0 ? listing.rating_average : null;
  const phone = listing.phone_primary?.trim() || null;
  const hasMeta = rating !== null || phone !== null || Boolean(cityName);

  return (
    <div>
      {/* The gradient stays as the fallback for a listing with no cover. */}
      <div className="bg-surface-container-low relative aspect-[4/1] overflow-hidden rounded-2xl">
        {cover ? (
          <Image
            src={cover.url}
            alt={cover.alt ?? listing.name}
            fill
            // The cover is the LCP element on this page, so fetch it first.
            preload
            sizes="(min-width: 1280px) 1200px, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="bg-hero-navy flex size-full items-center justify-center">
            <Icon name="storefront" size={48} className="text-white/60" />
          </div>
        )}
      </div>

      {hasBadges ? (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {listing.is_featured ? (
            <span className="bg-badge-gold font-badge text-badge text-on-secondary-fixed inline-flex items-center gap-1 rounded-full px-3 py-1 tracking-wider uppercase shadow-xs">
              <Icon name="star" size={14} />
              Featured
            </span>
          ) : null}
          {verified ? (
            <span className="bg-verified-teal font-badge text-badge inline-flex items-center gap-1 rounded-full px-3 py-1 tracking-wider text-white uppercase shadow-xs">
              <Icon name="verified" size={14} />
              Verified
            </span>
          ) : null}
          {categoryName ? <Badge>{categoryName}</Badge> : null}
        </div>
      ) : null}

      <div className={`${hasBadges ? 'mt-3' : 'mt-6'} flex items-center gap-4`}>
        {logo ? (
          <Image
            src={logo.url}
            alt={logo.alt ?? `${listing.name} logo`}
            width={64}
            height={64}
            className="border-border-subtle bg-surface-card size-16 shrink-0 rounded-lg border object-contain"
          />
        ) : null}
        <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
          {listing.name}
        </h1>
      </div>

      {listing.tagline ? (
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">{listing.tagline}</p>
      ) : null}

      {hasMeta ? (
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
          {rating !== null ? (
            <span
              role="img"
              aria-label={`Rated ${rating.toFixed(1)} out of 5 from ${listing.review_count} ${
                listing.review_count === 1 ? 'review' : 'reviews'
              }`}
            >
              <Stars value={rating} count={listing.review_count} />
            </span>
          ) : null}
          {phone ? (
            <a
              href={`tel:${phone.replace(/\s+/g, '')}`}
              className="font-label-md text-label-md text-primary-container inline-flex items-center gap-1.5 hover:underline"
            >
              <Icon name="call" size={16} />
              <span className="sr-only">Call </span>
              {phone}
            </a>
          ) : null}
          {cityName ? (
            <span className="font-body-sm text-body-sm text-secondary inline-flex items-center gap-1.5">
              <Icon name="location_on" size={16} />
              {cityName}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="mt-5">
        <ListingActions
          listingId={listing.id}
          slug={listing.slug}
          name={listing.name}
          shareUrl={shareUrl}
        />
      </div>
    </div>
  );
}
