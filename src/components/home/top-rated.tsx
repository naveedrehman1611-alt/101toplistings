import Link from 'next/link';
import { Icon } from '@/components/icon';
import { ListingCard } from '@/components/listing-card';
import { EmptyState } from '@/components/ui';
import type { ListingCard as Card, ListingHighlight } from '@/lib/queries';

export function TopRated({
  listings,
  highlights,
  categoryNames,
  cityNames,
}: {
  listings: Card[];
  highlights: Map<string, ListingHighlight>;
  categoryNames: Map<string, string>;
  cityNames: Map<string, string>;
}) {
  // The "Live Verified Registry" chip is a verification claim, so it only shows
  // when a card below is actually verified.
  const anyVerified = listings.some((l) => highlights.get(l.id)?.verified);

  return (
    <section className="container-page py-20">
      <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <span className="font-label-sm text-label-sm text-primary-container font-semibold tracking-wider uppercase">
            Curated Recommendations
          </span>
          <h2 className="font-headline-lg text-headline-lg-mobile text-on-surface md:text-headline-lg mt-1">
            Top-Rated Businesses in Your Area
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            Find trusted local businesses reviewed by real customers across Karachi, Lahore,
            Islamabad, Rawalpindi, Faisalabad, and other cities of Pakistan.
          </p>
        </div>
        {anyVerified ? (
          <div className="flex shrink-0 items-center gap-3">
            <span className="bg-surface-container font-label-sm text-label-sm text-on-surface inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5">
              <span
                aria-hidden
                className="bg-primary-container h-2 w-2 animate-pulse rounded-full"
              />
              <span>Live Verified Registry</span>
            </span>
          </div>
        ) : null}
      </div>

      {listings.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {listings.slice(0, 3).map((l) => (
            <ListingCard
              key={l.id}
              variant="featured"
              listing={l}
              highlight={highlights.get(l.id)}
              categoryName={l.category_id ? categoryNames.get(l.category_id) : undefined}
              cityName={l.city_id ? cityNames.get(l.city_id) : undefined}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No businesses to show yet"
          body="Published listings appear here as soon as they are approved. Add yours for free and be among the first."
          action={
            <Link
              href="/dashboard/listings/new"
              className="bg-primary-container font-label-md text-label-md text-on-primary hover:bg-primary focus-visible:ring-primary-container inline-flex items-center gap-2 rounded-lg px-5 py-2.5 shadow-xs transition-all hover:shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
            >
              <Icon name="add_business" size={18} />
              <span>Add your business</span>
            </Link>
          }
        />
      )}
    </section>
  );
}
