import type { Metadata } from 'next';
import { Button } from '@/components/ui';
import { Icon } from '@/components/icon';
import { JsonLd, breadcrumbSchema } from '@/components/json-ld';
import { PageHero } from '@/components/page-hero';
import { seoMetadata } from '@/lib/seo';
import { getPageContent } from '@/lib/content/get';
import type { SectionValues } from '@/lib/content/schema';
import type { ADD_BUSINESS_PAGE } from '@/lib/content/pages/company';
import { HighlightedHeading } from '@/components/company/highlighted';

export const revalidate = 3600;

const TITLE = 'Add Your Business Online';
const DESCRIPTION =
  'Create a free business listing and help customers discover your company, services, location, and website. Every listing is reviewed before it goes live.';

export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata('/add-business', {
    title: TITLE,
    description: DESCRIPTION,
    openGraph: { title: TITLE, description: DESCRIPTION },
    twitter: { card: 'summary_large_image', title: TITLE },
  });
}

type Sections = (typeof ADD_BUSINESS_PAGE)['sections'];
type Content = { [K in keyof Sections]: SectionValues<Sections[K]> };

export default async function AddBusinessPage() {
  const { hero, why, good_listing, review } = await getPageContent('add_business');
  const trail = [{ label: 'Home', href: '/' }, { label: 'Add your business' }];

  return (
    <>
      <JsonLd data={breadcrumbSchema(trail, '/add-business')} />
      <PageHero
        trail={trail}
        eyebrow={hero.eyebrow}
        heading={<HighlightedHeading c={hero} className="text-hero-green-light" />}
        subheading={hero.intro}
      >
        {(hero.primary.label && hero.primary.href) ||
        (hero.secondary.label && hero.secondary.href) ? (
          <div className="flex flex-wrap gap-3">
            {hero.primary.label && hero.primary.href ? (
              <Button href={hero.primary.href}>
                <Icon name={hero.primary_icon} size={20} />
                {hero.primary.label}
              </Button>
            ) : null}
            {hero.secondary.label && hero.secondary.href ? (
              <Button href={hero.secondary.href} variant="ghost">
                {hero.secondary.label}
              </Button>
            ) : null}
          </div>
        ) : null}
      </PageHero>
      <div className="container-page py-10 md:py-12">
        {why.visible ? <WhySection c={why} /> : null}
        {good_listing.visible ? <GoodListingSection c={good_listing} /> : null}
        {review.visible ? <ReviewSection c={review} /> : null}
      </div>
    </>
  );
}

function WhySection({ c }: { c: Content['why'] }) {
  return (
    <>
      <h2 className="font-headline-md text-headline-md">{c.heading}</h2>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        {c.items.map((w, i) => (
          <div key={i} className="surface-card flex flex-col p-6">
            <div className="bg-surface-container-low text-primary-container mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
              <Icon name={w.icon} size={26} />
            </div>
            <h3 className="font-title-md text-title-md">{w.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{w.body}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function GoodListingSection({ c }: { c: Content['good_listing'] }) {
  return (
    <>
      <h2 className="font-headline-md text-headline-md mt-16">{c.heading}</h2>
      {c.intro ? <p className="mt-3 max-w-3xl text-[var(--text-muted)]">{c.intro}</p> : null}
      <ul className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
        {c.items.map((item, i) => (
          <li key={i} className="surface-card flex items-start gap-3 p-4 text-sm">
            <Icon
              name="check_circle"
              size={20}
              className="text-primary-container mt-0.5 shrink-0"
            />
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

function ReviewSection({ c }: { c: Content['review'] }) {
  return (
    <>
      <h2 className="font-headline-md text-headline-md mt-16">{c.heading}</h2>
      <p className="mt-3 max-w-3xl leading-relaxed text-[var(--text-muted)]">{c.body}</p>
    </>
  );
}
