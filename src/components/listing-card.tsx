import Image from 'next/image';
import Link from 'next/link';
import type { ListingCard as Card } from '@/lib/queries';
import { Distance, Stars } from './ui';

export function ListingCard({ listing, cityName }: { listing: Card; cityName?: string }) {
  return (
    <Link
      href={`/listing/${listing.slug}`}
      className="surface-card group flex flex-col overflow-hidden transition-shadow hover:shadow-lg"
    >
      {/* The gradient is the documented fallback for a listing with no cover
          (reference variation 1). The cover is decorative here: the name below
          is the link's accessible text, so alt is empty. */}
      <div className="from-brand-600 to-brand-800 relative aspect-[4/1] bg-gradient-to-br">
        {listing.cover_url ? (
          <Image
            src={listing.cover_url}
            alt=""
            fill
            sizes="(min-width: 1024px) 18rem, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display group-hover:text-brand-700 leading-snug font-semibold">
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
