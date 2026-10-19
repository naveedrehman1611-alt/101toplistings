import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon, type IconName } from '@/components/icon';

/** Button base shared with the hub hero's CTAs; add the fill and text colours. */
export const HUB_BUTTON =
  'font-display inline-flex items-center justify-center gap-1.5 rounded-[7px] px-6 py-3 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

/**
 * Full-width green band above the footer. Both lines are plain white: white on
 * #0c8226 is 5.0:1, and any translucent white drops under AA for 14px text.
 * Every piece of copy can be passed in (from Admin → Content); the defaults are
 * the band's original copy, for callers that pass only the quote link. An
 * empty label drops its button; `children` are further buttons after them.
 */
export function HubCtaBand({
  quoteHref,
  heading = 'Ready to rank your business higher?',
  body = 'Get a free SEO audit and a plan you can actually read.',
  primary = { label: 'Get Free SEO Audit', href: '/seo-audit' },
  quoteLabel = 'Request a Quote',
  primaryIcon = 'fact_check',
  quoteIcon = 'mail',
  children,
}: {
  quoteHref: string;
  heading?: string;
  body?: string;
  primary?: { label: string; href: string };
  quoteLabel?: string;
  primaryIcon?: IconName;
  quoteIcon?: IconName;
  children?: ReactNode;
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
          {body ? <p className="mt-1 text-sm font-medium text-white">{body}</p> : null}
        </div>
        <div className="flex w-full flex-col gap-3 min-[420px]:w-auto min-[420px]:flex-row min-[420px]:flex-wrap">
          {primary.label ? (
            <Link
              href={primary.href}
              className={`${HUB_BUTTON} bg-hero-navy hover:bg-ink-800 text-white`}
            >
              <Icon name={primaryIcon} size={18} />
              {primary.label}
            </Link>
          ) : null}
          {quoteLabel ? (
            <Link
              href={quoteHref}
              className={`${HUB_BUTTON} text-on-surface hover:bg-ink-100 bg-white`}
            >
              <Icon name={quoteIcon} size={18} />
              {quoteLabel}
            </Link>
          ) : null}
          {children}
        </div>
      </div>
    </section>
  );
}
