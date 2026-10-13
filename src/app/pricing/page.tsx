import type { Metadata } from 'next';
import { Button } from '@/components/ui';
import { Icon } from '@/components/icon';
import { JsonLd, breadcrumbSchema } from '@/components/json-ld';
import { PageHero } from '@/components/page-hero';
import { seoMetadata } from '@/lib/seo';
import { getPageContent } from '@/lib/content/get';
import { lines, type SectionValues } from '@/lib/content/schema';
import type { PRICING_PAGE } from '@/lib/content/pages/company';
import { InlineMarkdown } from '@/components/markdown';
import { HighlightedHeading } from '@/components/company/highlighted';

export const revalidate = 3600;

const TITLE = 'Business Listing & SEO Pricing | Choose a Plan';
const DESCRIPTION =
  'Business listing and SEO pricing: list your business free, ask for a quote on a featured listing, or get a custom quote for SEO and marketing services.';

export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata('/pricing', {
    title: TITLE,
    description: DESCRIPTION,
    openGraph: { title: TITLE, description: DESCRIPTION },
    twitter: { card: 'summary_large_image', title: TITLE },
  });
}

type Sections = (typeof PRICING_PAGE)['sections'];
type Content = { [K in keyof Sections]: SectionValues<Sections[K]> };

export default async function PricingPage() {
  const { hero, plans, factors } = await getPageContent('pricing');
  const trail = [{ label: 'Home', href: '/' }, { label: 'Pricing' }];

  return (
    <>
      <JsonLd data={breadcrumbSchema(trail, '/pricing')} />
      <PageHero
        trail={trail}
        eyebrow={hero.eyebrow}
        heading={<HighlightedHeading c={hero} className="text-hero-green-light" />}
        subheading={hero.intro}
        stats={[
          { value: plans.plans.length, label: hero.stat_plans },
          { value: hero.stat_value, label: hero.stat_label },
        ].filter((s) => s.label)}
      />

      <div className="container-page py-12">
        {plans.visible ? <PlansSection c={plans} /> : null}
        {factors.visible ? <FactorsSection c={factors} first={!plans.visible} /> : null}
      </div>
    </>
  );
}

function PlansSection({ c }: { c: Content['plans'] }) {
  return (
    <>
      <h2 className="font-headline-md text-headline-md">{c.heading}</h2>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {c.plans.map((p, i) => {
          const actions = [
            { ...p.primary, ghost: false },
            { ...p.secondary, ghost: true },
          ].filter((a) => a.label && a.href);
          return (
            <div key={i} className="surface-card flex flex-col p-6">
              <div className="bg-surface-container-low text-primary-container mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                <Icon name={p.icon} size={26} />
              </div>
              <h3 className="font-title-md text-title-md">{p.name}</h3>
              <p className="font-headline-sm text-headline-sm mt-1">{p.price}</p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">{p.body}</p>
              <ul className="mt-4 space-y-2 text-sm">
                {lines(p.points).map((pt, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <Icon
                      name="check_circle"
                      size={18}
                      className="text-primary-container mt-0.5 shrink-0"
                    />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-3 pt-2 lg:mt-auto">
                {actions.map((a, j) => (
                  <Button key={j} href={a.href} variant={a.ghost ? 'ghost' : 'primary'}>
                    {a.label}
                  </Button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function FactorsSection({ c, first }: { c: Content['factors']; first: boolean }) {
  return (
    <>
      <h2
        className={
          first ? 'font-headline-md text-headline-md' : 'font-headline-md text-headline-md mt-16'
        }
      >
        {c.heading}
      </h2>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {c.items.map((f, i) => (
          <div key={i} className="surface-card p-6">
            <h3 className="font-title-md text-title-md">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{f.body}</p>
          </div>
        ))}
      </div>
      {c.note ? (
        <p className="mt-6 text-sm text-[var(--text-muted)]">
          <InlineMarkdown text={c.note} linkClassName="text-brand-700 hover:underline" />
        </p>
      ) : null}
    </>
  );
}
