import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon } from '@/components/icon';
import { JsonLd, breadcrumbSchema } from '@/components/json-ld';
import { PageHero } from '@/components/page-hero';
import { servicePage, type ServiceCategoryId, type ServicePage } from '@/lib/service-pages';
import { SITE_URL } from '@/lib/supabase';

const PRIMARY_BTN =
  'bg-primary-container text-on-primary hover:bg-primary focus-visible:ring-primary-container inline-flex items-center gap-2 rounded-xl px-6 py-3.5 font-semibold shadow-md transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden';
// Light-on-navy companion to PRIMARY_BTN, for the hero.
const HERO_SECONDARY_BTN =
  'inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

const EYEBROW: Record<ServiceCategoryId, string> = {
  seo: 'SEO Service',
  links: 'Link Building Service',
  marketing: 'Digital Marketing Service',
};

const DEFAULT_STEPS = [
  {
    title: 'Free audit',
    body: 'Tell us about your business and website. We look at where you stand today and what is holding you back.',
  },
  {
    title: 'A plan you can read',
    body: 'You get a short, prioritised plan: what we will do, what it is for, and what you can expect.',
  },
  {
    title: 'Work and reporting',
    body: 'We do the work and report on what changed, so you can see what your budget is doing.',
  },
];

/** Shared layout for the SEO service pages and /digital-marketing. `extra` renders after "What's included". */
export function ServicePageView({
  page,
  brand,
  extra,
}: {
  page: ServicePage;
  brand: string;
  extra?: ReactNode;
}) {
  const trail =
    page.slug === 'digital-marketing'
      ? [{ label: 'Home', href: '/' }, { label: 'Digital marketing' }]
      : [
          { label: 'Home', href: '/' },
          { label: 'SEO services', href: '/seo-services' },
          { label: page.name },
        ];
  const service = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: page.name,
    serviceType: page.name,
    description: page.description,
    url: `${SITE_URL}${page.path}`,
    provider: { '@id': `${SITE_URL}/#organization` },
    areaServed: 'Worldwide',
  };
  const steps = page.steps ?? DEFAULT_STEPS;
  const related = page.related.flatMap((slug) => servicePage(slug) ?? []);

  return (
    <>
      <JsonLd data={breadcrumbSchema(trail, page.path)} />
      <JsonLd data={service} />
      <PageHero
        trail={trail}
        eyebrow={EYEBROW[page.category]}
        heading={page.h1}
        subheading={page.intro}
        stats={[
          { value: page.includes.length, label: 'Areas Covered' },
          { value: steps.length, label: 'Step Process' },
          { value: 'Free', label: 'SEO Audit' },
        ]}
      >
        <div className="flex flex-wrap gap-3">
          <Link href={page.ctaHref} className={PRIMARY_BTN}>
            <Icon name="mail" size={20} />
            {page.ctaLabel}
          </Link>
          <Link href="/seo-audit" className={HERO_SECONDARY_BTN}>
            <Icon name="fact_check" size={20} />
            Free SEO audit
          </Link>
        </div>
      </PageHero>
      <div className="container-page py-10 md:py-12">
        <h2 className="font-headline-md text-headline-md">What&apos;s included</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {page.includes.map((item) => (
            <div key={item.title} className="surface-card flex flex-col p-6">
              <div className="bg-surface-container-low text-primary-container mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                <Icon name={page.icon} size={26} />
              </div>
              <h3 className="font-title-md text-title-md">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{item.body}</p>
            </div>
          ))}
        </div>

        {extra}

        <h2 className="font-headline-md text-headline-md mt-16">How it works</h2>
        <ol className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="surface-card p-6">
              <span className="text-primary-container font-semibold">Step {i + 1}</span>
              <h3 className="font-title-md text-title-md mt-1">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{s.body}</p>
            </li>
          ))}
        </ol>

        <h2 className="font-headline-md text-headline-md mt-16">Frequently asked questions</h2>
        <div className="mt-6 grid max-w-3xl gap-4">
          {page.faq.map((item) => (
            <div key={item.q} className="surface-card p-6">
              <h3 className="font-title-md text-title-md">{item.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{item.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-2">
          {related.length > 0 ? (
            <div>
              <h2 className="font-headline-md text-headline-md">Related services</h2>
              <ul className="mt-4 space-y-2">
                {related.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={s.path}
                      className="text-primary-container font-semibold hover:underline"
                    >
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div>
            <h2 className="font-headline-md text-headline-md">Guides</h2>
            <ul className="mt-4 space-y-2">
              {page.guides.map((g) => (
                <li key={g.href}>
                  <Link
                    href={g.href}
                    className="text-primary-container font-semibold hover:underline"
                  >
                    {g.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="surface-card mt-16 flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <h2 className="font-headline-sm text-headline-sm">Talk to {brand}</h2>
            <p className="mt-2 text-[var(--text-muted)]">
              Send us your website and what you want to achieve. We will reply with what we would do
              first.
            </p>
          </div>
          <Link href={page.ctaHref} className={`${PRIMARY_BTN} shrink-0`}>
            {page.ctaLabel}
            <Icon name="arrow_forward" size={20} />
          </Link>
        </div>
      </div>
    </>
  );
}
