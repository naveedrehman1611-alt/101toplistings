import Link from 'next/link';
import { Icon } from '@/components/icon';
import { ListingCard } from '@/components/listing-card';
import { EmptyState } from '@/components/ui';
import type { ListingCard as Card, ListingHighlight } from '@/lib/queries';
import type { SectionValues } from '@/lib/content/schema';
import type { HOME_PAGE } from '@/lib/content/pages/home';

export type TopRatedContent = SectionValues<(typeof HOME_PAGE)['sections']['top_rated']>;

export function TopRated({
  content: c,
  listings,
  highlights,
  categoryNames,
  cityNames,
}: {
  content: TopRatedContent;
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
            {c.eyebrow}
          </span>
          <h2 className="font-headline-lg text-headline-lg-mobile text-on-surface md:text-headline-lg mt-1">
            {c.heading}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">{c.intro}</p>
        </div>
        {anyVerified && c.verified_badge ? (
          <div className="flex shrink-0 items-center gap-3">
            <span className="bg-surface-container font-label-sm text-label-sm text-on-surface inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5">
              <span
                aria-hidden
                className="bg-primary-container h-2 w-2 animate-pulse rounded-full"
              />
              <span>{c.verified_badge}</span>
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
          title={c.empty_title}
          body={c.empty_body}
          action={
            c.empty_button.label && c.empty_button.href ? (
              <Link
                href={c.empty_button.href}
                className="bg-primary-container font-label-md text-label-md text-on-primary hover:bg-primary focus-visible:ring-primary-container inline-flex items-center gap-2 rounded-lg px-5 py-2.5 shadow-xs transition-all hover:shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
              >
                <Icon name={c.empty_button_icon} size={18} />
                <span>{c.empty_button.label}</span>
              </Link>
            ) : undefined
          }
        />
      )}
    </section>
  );
}
