import type { SimilarListing } from '@/lib/queries';
import { ListingCard } from '@/components/listing-card';
import { OpenStatusBadge } from './open-status-badge';

/**
 * "Similar Listings" under a listing. Uses the site's standard listing card, so
 * the neighbours look exactly like search results, plus the live open/closed
 * badge when the listing has hours. Hidden when there is nothing similar.
 */
export function SimilarListings({
  listings,
  cityNames,
  categories,
}: {
  listings: SimilarListing[];
  cityNames: Map<string, string>;
  categories: Map<string, { name: string; slug: string }>;
}) {
  if (listings.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="font-headline-sm text-headline-sm text-on-surface">Similar Listings</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((l) => (
          <ListingCard
            key={l.id}
            listing={l}
            cityName={l.city_id ? cityNames.get(l.city_id) : undefined}
            categoryName={l.category_id ? categories.get(l.category_id)?.name : undefined}
            highlight={{
              description: null,
              phone: l.phone_primary,
              verified: l.verification === 'verified',
            }}
            status={l.hours.length > 0 ? <OpenStatusBadge hours={l.hours} /> : undefined}
          />
        ))}
      </div>
    </section>
  );
}
