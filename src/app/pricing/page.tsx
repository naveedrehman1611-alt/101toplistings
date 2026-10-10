import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { Icon, type IconName } from '@/components/icon';
import { JsonLd, breadcrumbSchema } from '@/components/json-ld';
import { PageHero } from '@/components/page-hero';
import { seoMetadata } from '@/lib/seo';

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

type Plan = {
  icon: IconName;
  name: string;
  price: string;
  body: string;
  points: string[];
  actions: { label: string; href: string; ghost?: boolean }[];
};

const PLANS: Plan[] = [
  {
    icon: 'add_business',
    name: 'Free listing',
    price: 'Free',
    body: 'A standard business listing in the directory, reviewed before it goes live.',
    points: ['Your own listing page', 'Category and city placement', 'Edit your details any time'],
    actions: [{ label: 'Create listing', href: '/dashboard/listings/new' }],
  },
  {
    icon: 'star',
    name: 'Featured listing',
    price: 'Quote on request',
    body: 'Extra visibility: featured listings are shown first in the business directory.',
    points: ['Shown ahead of standard listings', 'Listed on the featured businesses page'],
    actions: [
      { label: 'Request a quote', href: '/contact?subject=Partnership%20or%20advertising' },
    ],
  },
  {
    icon: 'monitoring',
    name: 'SEO & marketing services',
    price: 'Custom quote',
    body: 'Hands-on work on your own website: audits, technical and on-page SEO, content and link building.',
    points: ['Start with an SEO audit', 'A plan scoped to your site and goals'],
    actions: [
      { label: 'Get SEO audit', href: '/seo-audit' },
      { label: 'View SEO services', href: '/seo-services', ghost: true },
    ],
  },
];

const FACTORS: { title: string; body: string }[] = [
  {
    title: 'Size and condition of the site',
    body: 'A five-page local business site and a large online store need very different amounts of work.',
  },
  {
    title: 'Competition and goals',
    body: 'Ranking in a crowded market or across several cities takes more effort than a single niche.',
  },
  {
    title: 'Scope of work',
    body: 'Technical fixes, content, local SEO and link building are separate workstreams; you pay for the ones you need.',
  },
  {
    title: 'Starting point',
    body: 'An audit shows what is already working and what is holding the site back, which sets the scope.',
  },
];

export default function PricingPage() {
  const trail = [{ label: 'Home', href: '/' }, { label: 'Pricing' }];

  return (
    <>
      <JsonLd data={breadcrumbSchema(trail, '/pricing')} />
      <PageHero
        trail={trail}
        eyebrow="Plans & Pricing"
        heading={
          <>
            Business listing and <span className="text-hero-green-light">SEO pricing</span>
          </>
        }
        subheading="Listing your business in the directory is free. Featured placement and SEO services are priced by quote, because the right scope depends on your business and website. There are no fixed prices published here."
        stats={[
          { value: PLANS.length, label: 'Plans' },
          { value: 'Free', label: 'Business Listing' },
        ]}
      />

      <div className="container-page py-12">
        <h2 className="font-headline-md text-headline-md">Choose a plan</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {PLANS.map((p) => (
            <div key={p.name} className="surface-card flex flex-col p-6">
              <div className="bg-surface-container-low text-primary-container mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                <Icon name={p.icon} size={26} />
              </div>
              <h3 className="font-title-md text-title-md">{p.name}</h3>
              <p className="font-headline-sm text-headline-sm mt-1">{p.price}</p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">{p.body}</p>
              <ul className="mt-4 space-y-2 text-sm">
                {p.points.map((pt) => (
                  <li key={pt} className="flex items-start gap-2">
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
                {p.actions.map((a) => (
                  <Button key={a.href} href={a.href} variant={a.ghost ? 'ghost' : 'primary'}>
                    {a.label}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <h2 className="font-headline-md text-headline-md mt-16">What affects SEO pricing</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {FACTORS.map((f) => (
            <div key={f.title} className="surface-card p-6">
              <h3 className="font-title-md text-title-md">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{f.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-[var(--text-muted)]">
          Not sure where to start? See{' '}
          <Link href="/featured-businesses" className="text-brand-700 hover:underline">
            featured businesses
          </Link>{' '}
          or{' '}
          <Link href="/contact" className="text-brand-700 hover:underline">
            contact us
          </Link>
          .
        </p>
      </div>
    </>
  );
}
