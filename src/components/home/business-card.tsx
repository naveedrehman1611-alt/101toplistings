import Image from 'next/image';
// Prefetch on intent, not on sight: see hover-prefetch-link.tsx.
import { HoverPrefetchLink as Link } from '@/components/hover-prefetch-link';
import type { BusinessCardVM } from '@/lib/home-types';
import { Icon } from '@/components/icons';
import { OpenStatus } from './open-status';
import { FavouriteButton } from './favourite-button';

/**
 * A business as the reference draws it: inset cover with the Open / Closed pill
 * and a round logo on its edge, name, a short description, phone and city, then
 * the category with "view" and "save" buttons. The name's link is stretched over
 * the whole card; every other control sits above it (relative z-10).
 */

// 36px circles, with the hit area grown to 44px for touch.
const CIRCLE =
  'relative z-10 grid size-9 place-items-center rounded-full bg-[var(--surface-2)] transition-colors before:absolute before:-inset-1 hover:bg-brand-50 hover:text-brand-700';

/** Digits only, keeping a leading + so international numbers still dial. */
function telHref(phone: string): string | null {
  const digits = phone.replace(/\D/g, '');
  return digits ? `tel:${phone.trim().startsWith('+') ? '+' : ''}${digits}` : null;
}

export function BusinessCard({
  card,
  showPhone,
  showStatus,
}: {
  card: BusinessCardVM;
  showPhone: boolean;
  showStatus: boolean;
}) {
  const summary = card.excerpt ?? card.tagline;
  const tagline = card.excerpt ? card.tagline : null;
  const tel = showPhone && card.phone ? telHref(card.phone) : null;
  const rating = card.rating?.toFixed(1);

  return (
    <article className="group/card border-ink-200 relative flex h-full flex-col rounded-lg border bg-white transition duration-200 hover:shadow-[var(--shadow-card-hover)] motion-safe:hover:-translate-y-0.5">
      <div className="relative px-2.5 pt-2.5">
        <div className="relative aspect-[3/2] overflow-hidden rounded-md bg-[var(--surface-2)]">
          {card.coverUrl ? (
            <Image
              src={card.coverUrl}
              alt=""
              fill
              sizes="(min-width:1024px) 370px, (min-width:640px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="text-ink-300 grid size-full place-items-center">
              <Icon name="store" size={40} strokeWidth={1.5} />
            </div>
          )}
          {showStatus ? <OpenStatus hours={card.hours} className="absolute top-3 left-3" /> : null}
        </div>
        {card.logoUrl ? (
          <Image
            src={card.logoUrl}
            alt=""
            width={48}
            height={48}
            className="absolute right-5.5 bottom-0 size-12 translate-y-1/2 rounded-full bg-white object-cover shadow-md ring-3 ring-white"
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-4 pt-3 pb-4">
        <h3
          className={`text-ink-900 line-clamp-1 text-lg leading-7 font-medium ${card.logoUrl ? 'pr-16' : ''}`}
        >
          <Link
            href={card.href}
            className="group-hover/card:text-brand-700 transition-colors after:absolute after:inset-0 after:rounded-lg"
          >
            {card.name}
          </Link>
        </h3>
        {tagline ? <p className="text-ink-500 mt-0.5 line-clamp-1 text-sm">{tagline}</p> : null}
        <p className="text-ink-500 mt-1 line-clamp-2 min-h-10 text-sm leading-5">{summary}</p>

        {/* Pinned to the bottom so phone and city line up across a row of cards. */}
        <div className="mt-auto flex flex-col gap-2 pt-3">
          {rating ? (
            <p className="flex items-center gap-1 text-sm">
              <Icon name="star" size={16} fill="currentColor" className="text-accent-500" />
              <span aria-hidden className="text-ink-900 font-medium">
                {rating}
              </span>
              <span aria-hidden className="text-ink-500">
                ({card.reviewCount})
              </span>
              <span className="sr-only">
                Rated {rating} out of 5 from {card.reviewCount}{' '}
                {card.reviewCount === 1 ? 'review' : 'reviews'}
              </span>
            </p>
          ) : null}
          {tel || card.city ? (
            <div className="text-ink-500 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.8125rem]">
              {tel ? (
                <a
                  href={tel}
                  aria-label={`Call ${card.name} on ${card.phone}`}
                  className="hover:text-brand-700 relative z-10 -my-3 inline-flex items-center gap-1.5 py-3 transition-colors"
                >
                  <Icon name="phone" size={14} />
                  {card.phone}
                </a>
              ) : null}
              {card.city ? (
                <Link
                  href={card.city.href}
                  className="hover:text-brand-700 relative z-10 -my-3 inline-flex items-center gap-1.5 py-3 transition-colors"
                >
                  <Icon name="map-pin" size={14} />
                  {card.city.label}
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="border-ink-200 flex items-center gap-3 border-t px-4 py-3">
        {card.category ? (
          <Link
            href={card.category.href}
            className="text-ink-700 hover:text-brand-700 relative z-10 -my-3 min-w-0 truncate py-3 text-sm transition-colors"
          >
            {card.category.label}
          </Link>
        ) : null}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Link
            href={card.href}
            aria-label={`View ${card.name}`}
            className={`${CIRCLE} text-ink-700`}
          >
            <Icon name="search" size={16} />
          </Link>
          <FavouriteButton listingId={card.id} name={card.name} className={CIRCLE} />
        </div>
      </div>
    </article>
  );
}
