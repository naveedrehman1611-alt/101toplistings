import Link from 'next/link';
import { Icon } from '@/components/icon';

/** Button base shared with the hub hero's CTAs; add the fill and text colours. */
export const HUB_BUTTON =
  'font-display inline-flex items-center justify-center gap-1.5 rounded-[7px] px-6 py-3 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

/**
 * Full-width green band above the footer. Both lines are plain white: white on
 * #0c8226 is 5.0:1, and any translucent white drops under AA for 14px text.
 */
export function HubCtaBand({
  quoteHref,
  heading = 'Ready to rank your business higher?',
}: {
  quoteHref: string;
  heading?: string;
}) {
  return (
    <section aria-labelledby="hub-cta-heading" className="bg-primary-container py-7">
      <div className="container-page flex flex-col items-start justify-between gap-5 md:flex-row md:flex-wrap md:items-center">
        <div>
          <h2
            id="hub-cta-heading"
            className="font-display text-lg leading-snug font-extrabold text-white"
          >
            {heading}
          </h2>
          <p className="mt-1 text-sm font-medium text-white">
            Get a free SEO audit and a plan you can actually read.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 min-[420px]:w-auto min-[420px]:flex-row min-[420px]:flex-wrap">
          <Link
            href="/seo-audit"
            className={`${HUB_BUTTON} bg-hero-navy hover:bg-ink-800 text-white`}
          >
            <Icon name="fact_check" size={18} />
            Get Free SEO Audit
          </Link>
          <Link
            href={quoteHref}
            className={`${HUB_BUTTON} text-on-surface hover:bg-ink-100 bg-white`}
          >
            <Icon name="mail" size={18} />
            Request a Quote
          </Link>
        </div>
      </div>
    </section>
  );
}
