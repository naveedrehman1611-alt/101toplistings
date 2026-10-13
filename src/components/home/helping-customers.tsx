import Link from 'next/link';
import { Icon } from '@/components/icon';
import type { SectionValues } from '@/lib/content/schema';
import { paragraphs } from '@/lib/content/schema';
import type { HOME_PAGE } from '@/lib/content/pages/home';

export type HelpingCustomersContent = SectionValues<
  (typeof HOME_PAGE)['sections']['helping_customers']
>;

/** Consumer guidance section: how to use listings and report wrong details (Stitch design). */
export function HelpingCustomers({ content: c }: { content: HelpingCustomersContent }) {
  const hasLink = Boolean(c.report_link.label && c.report_link.href);
  return (
    <section className="bg-surface-container-low w-full px-6 py-12 lg:px-12">
      <div className="bg-surface-card mx-auto max-w-4xl rounded-3xl p-8 text-left shadow-xs sm:p-12">
        {c.badge ? (
          <div className="bg-tertiary-fixed font-label-sm text-label-sm text-on-tertiary-fixed mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1">
            <Icon name={c.badge_icon} size={16} />
            <span>{c.badge}</span>
          </div>
        ) : null}
        <h2 className="font-headline-lg text-headline-lg-mobile text-on-surface md:text-headline-lg">
          {c.heading}
        </h2>
        {c.subheading ? (
          <p className="font-title-md text-title-md text-secondary mt-2">{c.subheading}</p>
        ) : null}
        <div className="font-body-md text-body-md text-on-surface-variant mt-6 space-y-4">
          {paragraphs(c.body).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        {c.report_text || hasLink ? (
          <div className="bg-surface-bg mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl p-4 pt-6">
            <div className="font-body-sm text-body-sm text-on-surface flex items-center gap-2">
              <Icon name={c.report_icon} size={20} className="text-secondary" />
              <span>{c.report_text}</span>
            </div>
            {hasLink ? (
              <Link
                href={c.report_link.href}
                className="font-label-md text-label-md text-primary-container hover:text-primary focus-visible:ring-primary-container inline-flex items-center gap-1.5 rounded-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
              >
                <span>{c.report_link.label}</span>
                <Icon name="arrow_forward" size={16} />
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
