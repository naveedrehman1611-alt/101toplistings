import Link from 'next/link';
import type { ListingsVM } from '@/lib/home-types';
import { Icon } from '@/components/icons';
import { SectionShell } from './section-shell';
import { Carousel } from './carousel';
import { BusinessCard } from './business-card';

/**
 * The business carousel ("Top-Rated Businesses"): three cards across on
 * desktop, two on tablets, one on phones, moved by dots and autoplay as on the
 * reference. The section is prerendered, so it has no client loading phase;
 * a failed read and an empty directory each get their own state instead.
 */
export function TopRated({ section }: { section: ListingsVM }) {
  return (
    <SectionShell section={section}>
      {section.status === 'ok' ? (
        <>
          <Carousel
            label={section.heading ?? 'Businesses'}
            // The vertical padding leaves room inside the scroller for the hover lift and shadow.
            slideClassName="basis-full pt-1 pb-5 sm:basis-1/2 lg:basis-1/3"
            step="slide"
            dots
            autoplayMs={section.autoplay ? 5000 : 0}
          >
            {section.listings.map((card) => (
              <BusinessCard
                key={card.id}
                card={card}
                showPhone={section.showPhone}
                showStatus={section.showStatus}
              />
            ))}
          </Carousel>
          {section.cta ? (
            <div className="mt-6 text-center">
              <Link
                href={section.cta.href}
                className="border-brand-700 text-brand-700 hover:bg-brand-700 inline-flex h-11 items-center rounded-lg border px-6 text-[0.9375rem] font-medium transition-colors hover:text-white"
              >
                {section.cta.label}
              </Link>
            </div>
          ) : null}
        </>
      ) : section.status === 'empty' ? (
        <div className="border-ink-300 mx-auto max-w-xl rounded-lg border border-dashed px-6 py-12 text-center">
          <span className="text-brand-700 mx-auto grid size-14 place-items-center rounded-full bg-[var(--surface-2)]">
            <Icon name="store" size={26} />
          </span>
          <h3 className="text-ink-900 mt-5 text-lg font-medium">{section.emptyTitle}</h3>
          <p className="text-ink-500 mt-2 text-[0.9375rem]">{section.emptyText}</p>
          <Link
            href={section.addListingHref}
            className="bg-brand-700 hover:bg-brand-800 mt-6 inline-flex h-11 items-center rounded-lg px-6 text-[0.9375rem] font-medium text-white transition-colors"
          >
            Add your business
          </Link>
        </div>
      ) : (
        <div role="status" className="mx-auto max-w-xl text-center">
          <p className="text-ink-700 text-[0.9375rem]">Businesses could not be loaded right now.</p>
          <Link
            href={section.browseHref}
            className="text-brand-700 hover:text-brand-800 mt-3 inline-flex min-h-11 items-center gap-1.5 text-[0.9375rem] font-medium underline-offset-4 hover:underline"
          >
            Browse all listings
            <Icon name="arrow-right" size={16} />
          </Link>
        </div>
      )}
    </SectionShell>
  );
}
