import Link from 'next/link';
import { Icon } from '@/components/icon';
import type { ListingContent } from '@/lib/content/pages/directory';

/** "Submit Your Listing Today!" band at the foot of a listing page (Stitch banner style). */
export function SubmitListingCta({ content: c }: { content: ListingContent['cta'] }) {
  return (
    <section className="bg-hero-navy relative mt-16 overflow-hidden rounded-3xl p-10 text-white shadow-xl sm:p-14">
      <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-white">
        {c.heading}
      </h2>
      <p className="font-body-lg text-body-lg mt-2 max-w-2xl text-white/90">{c.body}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        {/* Same label and icon as the header's call to action. */}
        {c.primary.label && c.primary.href ? (
          <Link
            href={c.primary.href}
            className="bg-surface-card font-title-md text-title-md text-on-background hover:bg-surface-bright inline-flex items-center gap-2 rounded-xl px-6 py-3 shadow-lg transition-all hover:shadow-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            <Icon name={c.primary_icon} size={20} className="text-primary-container" />
            {c.primary.label}
          </Link>
        ) : null}
        {c.secondary.label && c.secondary.href ? (
          <Link
            href={c.secondary.href}
            className="font-title-md text-title-md inline-flex items-center gap-2 rounded-xl border border-white/40 px-6 py-3 text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            {c.secondary.label}
            <Icon name={c.secondary_icon} size={20} />
          </Link>
        ) : null}
      </div>
    </section>
  );
}
