import Image from 'next/image';
import type { ReactNode } from 'react';
import type { ListingDetail, ListingImage } from '@/lib/queries';
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
      <div className="from-brand-600 to-brand-800 relative aspect-[4/1] overflow-hidden rounded-xl bg-gradient-to-br">
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
        ) : null}
      </div>

      {hasBadges ? (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {listing.is_featured ? (
            <span className="bg-accent-400/20 text-accent-600 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold">
              Featured
            </span>
          ) : null}
          {verified ? (
            <Badge>
              <Icon className="mr-1 size-3.5">
                <path d="M20 6 9 17l-5-5" />
              </Icon>
              Verified
            </Badge>
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
            className="size-16 shrink-0 rounded-lg border border-[var(--border)] bg-[var(--surface)] object-contain"
          />
        ) : null}
        <h1 className="text-3xl font-bold sm:text-4xl">{listing.name}</h1>
      </div>

      {listing.tagline ? (
        <p className="mt-2 text-lg text-[var(--text-muted)]">{listing.tagline}</p>
      ) : null}

      {hasMeta ? (
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
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
              className="text-brand-700 inline-flex items-center gap-1.5 hover:underline"
            >
              <Icon>
                <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
              </Icon>
              <span className="sr-only">Call </span>
              {phone}
            </a>
          ) : null}
          {cityName ? (
            <span className="inline-flex items-center gap-1.5 text-[var(--text-muted)]">
              <Icon>
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </Icon>
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

function Icon({ children, className = 'size-4' }: { children: ReactNode; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
      {children}
    </svg>
  );
}
