import Link from 'next/link';
import { Icon } from '@/components/icon';
import { ListingCard } from '@/components/listing-card';
import type { ListingCard as Card, ListingHighlight } from '@/lib/queries';

/** Featured listings on the home page. Renders nothing until something is featured. */
export function FeaturedBusinesses({
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
  if (listings.length === 0) return null;
  return (
    <section className="container-page py-20">
      <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <span className="font-label-sm text-label-sm text-primary-container font-semibold tracking-wider uppercase">
            Featured
          </span>
          <h2 className="font-headline-lg text-headline-lg-mobile text-on-surface md:text-headline-lg mt-1">
            Featured Businesses
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            Businesses that have chosen extra visibility in the directory.
          </p>
        </div>
        <Link
          href="/featured-businesses"
          className="font-label-md text-label-md text-primary-container inline-flex shrink-0 items-center gap-1 font-semibold hover:underline"
        >
          View all featured businesses
          <Icon name="arrow_forward" size={18} />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {listings.map((l) => (
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
    </section>
  );
}
