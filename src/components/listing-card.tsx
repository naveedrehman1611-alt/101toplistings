import Link from 'next/link';
import type { ListingCard as Card } from '@/lib/queries';
import { Distance, Stars } from './ui';

export function ListingCard({ listing, cityName }: { listing: Card; cityName?: string }) {
  return (
    <Link
      href={`/listing/${listing.slug}`}
      className="surface-card group flex flex-col overflow-hidden transition-shadow hover:shadow-lg"
    >
      {/* No cover image in the data model yet — the gradient is the documented
          fallback for a listing with no cover (reference variation 1). */}
      <div className="aspect-[4/1] bg-gradient-to-br from-brand-600 to-brand-800" />
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display font-semibold leading-snug group-hover:text-brand-700">
          {listing.name}
        </h3>
        {listing.tagline ? (
          <p className="mt-1 line-clamp-2 text-sm text-[var(--text-muted)]">{listing.tagline}</p>
        ) : null}
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-3">
          <Stars value={listing.rating_average} count={listing.review_count} />
          <Distance km={listing.distance_km} />
          {cityName ? <span className="text-sm text-[var(--text-muted)]">{cityName}</span> : null}
        </div>
      </div>
    </Link>
  );
}
