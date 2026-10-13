import Link from 'next/link';
import { Icon } from '@/components/icon';
import type { SectionValues } from '@/lib/content/schema';
import { isSafeHref } from '@/lib/content/schema';
import type { HOME_PAGE } from '@/lib/content/pages/home';
import { categoryHref } from './hero';

export type ServicesContent = SectionValues<(typeof HOME_PAGE)['sections']['services']>;
type ServiceCard = ServicesContent['cards'][number];

/**
 * A card's category page, or a keyword search when the directory lacks that
 * category; a card with no category uses its own link, else the category index.
 */
function cardHref(s: ServiceCard, categorySlugs: ReadonlySet<string>): string {
  const slug = s.category.trim();
  if (slug) return categoryHref(categorySlugs, slug, s.keyword.trim() || slug);
  const href = s.href.trim();
  return href && isSafeHref(href) ? href : '/business-categories';
}

export function Services({
  content: c,
  categorySlugs,
}: {
  content: ServicesContent;
  categorySlugs: ReadonlySet<string>;
}) {
  return (
    <section className="container-page py-20">
      <div className="mx-auto mb-16 max-w-3xl text-center">
        <span className="font-label-sm text-label-sm text-primary-container font-semibold uppercase">
          {c.eyebrow}
        </span>
        <h2 className="font-headline-lg text-headline-lg-mobile text-on-surface md:text-headline-lg mt-2">
          {c.heading}
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-3">{c.intro}</p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {c.cards.map((s, i) => (
          <Link
            key={i}
            href={cardHref(s, categorySlugs)}
            className="group bg-surface-card focus-visible:ring-primary-container flex flex-col rounded-2xl p-7 shadow-xs transition-all duration-300 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
          >
            <div className="bg-surface-container-low text-primary-container group-hover:bg-primary group-hover:text-on-primary mb-5 flex h-14 w-14 items-center justify-center rounded-xl transition-colors">
              <Icon name={s.icon} size={28} />
            </div>
            <h3 className="font-title-md text-title-md text-on-surface group-hover:text-primary-container transition-colors">
              {s.title}
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 flex-1">
              {s.body}
            </p>
            {c.link_label ? (
              <span className="font-label-sm text-label-sm text-primary-container mt-4 inline-flex items-center gap-1 font-semibold">
                <span>{c.link_label}</span>
                <Icon
                  name="arrow_forward"
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </span>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  );
}
