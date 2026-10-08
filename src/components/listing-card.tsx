import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { ListingCard as Card, ListingHighlight } from '@/lib/queries';
import { Icon } from './icon';
import { Distance } from './ui';

/**
 * The Stitch "featured" listing card. `featured` is the home page's
 * top-rated card (tall image, description); `compact` is the same card for
 * result grids. Every badge and contact line renders only from real data: no
 * rating without reviews, no "verified" without a verified listing.
 *
 * The whole card is clickable without nesting links: the name's link is
 * stretched over the card with a pseudo-element, and the phone and profile
 * links sit above it (relative z-10).
 */
export function ListingCard({
  listing,
  cityName,
  categoryName,
  highlight,
  status,
  variant = 'compact',
}: {
  listing: Card;
  cityName?: string;
  categoryName?: string;
  highlight?: ListingHighlight;
  /** Extra badge in the top-left corner, e.g. the listing page's live open/closed status. */
  status?: ReactNode;
  variant?: 'featured' | 'compact';
}) {
  const featured = variant === 'featured';
  const href = `/listing/${listing.slug}`;
  const rating = listing.rating_average;
  const rated = rating !== null && rating !== undefined && listing.review_count > 0;
  const ratingText = rated ? Number(rating).toFixed(1) : '';
  const reviewText = listing.review_count.toLocaleString('en-US');
  const km = listing.distance_km;
  const showDistance = !featured && km !== null && !Number.isNaN(km);
  const phone = highlight?.phone?.trim();

  return (
    <article className="group bg-surface-card relative flex flex-col justify-between overflow-hidden rounded-2xl shadow-md transition-all duration-300 hover:shadow-xl">
      <div
        className={`bg-surface-container-low relative overflow-hidden ${featured ? 'h-56' : 'h-40'}`}
      >
        {/* Decorative: the name below is the link's accessible text. */}
        {listing.cover_url ? (
          <Image
            src={listing.cover_url}
            alt=""
            fill
            sizes={
              featured
                ? '(min-width: 1280px) 24rem, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw'
                : '(min-width: 1280px) 18rem, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
            }
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="bg-hero-navy flex size-full items-center justify-center transition-transform duration-500 group-hover:scale-105">
            <Icon name="storefront" size={48} className="text-white/60" />
          </div>
        )}
        {highlight?.verified || status ? (
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            {status}
            {highlight?.verified ? (
              <span className="bg-verified-teal font-badge text-badge inline-flex items-center gap-1 rounded-full px-3 py-1 tracking-wider text-white uppercase shadow-xs">
                <Icon name="verified" size={14} />
                <span>Verified Business</span>
              </span>
            ) : null}
          </div>
        ) : null}
        {rated ? (
          <div className="absolute top-4 right-4">
            <span className="bg-badge-gold font-badge text-badge text-on-secondary-fixed inline-flex items-center gap-1 rounded-full px-2.5 py-1 shadow-xs">
              <Icon name="star" size={14} />
              <span aria-hidden>
                {ratingText} ({reviewText})
              </span>
              <span className="sr-only">
                Rated {ratingText} out of 5 from {reviewText}{' '}
                {listing.review_count === 1 ? 'review' : 'reviews'}
              </span>
            </span>
          </div>
        ) : null}
      </div>

      <div className={`flex flex-1 flex-col ${featured ? 'p-6' : 'p-5'}`}>
        <div className="flex-1">
          {categoryName || cityName ? (
            <div className="mb-2 flex items-center justify-between gap-2">
              {categoryName ? (
                <span className="font-label-sm text-label-sm text-primary-container font-semibold uppercase">
                  {categoryName}
                </span>
              ) : null}
              {cityName ? (
                <span className="font-body-sm text-body-sm text-secondary flex items-center gap-1">
                  <Icon name="location_on" size={16} /> {cityName}
                </span>
              ) : null}
            </div>
          ) : null}
          <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary-container transition-colors">
            <Link
              href={href}
              className="focus-visible:after:ring-primary-container outline-hidden after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-inset"
            >
              {listing.name}
            </Link>
          </h3>
          {listing.tagline ? (
            <p className="font-title-md text-title-md text-secondary mt-0.5 line-clamp-2">
              {listing.tagline}
            </p>
          ) : null}
          {featured && highlight?.description ? (
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-3 line-clamp-3">
              {highlight.description}
            </p>
          ) : null}
          {showDistance ? (
            <p className="text-secondary mt-2 flex items-center gap-1">
              <Icon name="near_me" size={16} />
              <Distance km={km} />
            </p>
          ) : null}
        </div>

        <div className="bg-surface-bg/50 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl p-3 pt-5">
          {phone ? (
            <div className="flex min-w-0 items-center gap-2">
              <span className="bg-surface-container text-primary-container flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                <Icon name="call" size={18} />
              </span>
              <a
                href={`tel:${phone.replace(/\s+/g, '')}`}
                className="font-label-md text-label-md text-on-surface hover:text-primary-container focus-visible:ring-primary-container relative z-10 rounded-sm font-semibold whitespace-nowrap focus-visible:ring-2 focus-visible:outline-hidden"
              >
                {phone}
              </a>
            </div>
          ) : null}
          <Link
            href={href}
            aria-label={`View Profile: ${listing.name}`}
            className="bg-primary-container font-label-sm text-label-sm text-on-primary hover:bg-primary focus-visible:ring-primary-container relative z-10 ml-auto inline-flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
          >
            <span>View Profile</span>
            <Icon name="arrow_forward" size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}
