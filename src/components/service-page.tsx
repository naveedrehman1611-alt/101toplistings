import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon } from '@/components/icon';
import { JsonLd, breadcrumbSchema } from '@/components/json-ld';
import { PageHero } from '@/components/page-hero';
import { HubSectionHeader } from '@/components/services-hub/hub-section-header';
import { HubCtaBand, HUB_BUTTON } from '@/components/services-hub/hub-cta-band';
import { ServiceCard } from '@/components/services-hub/service-card';
import { quoteHref, servicePage, type ServicePage } from '@/lib/service-pages';
import { HUB_CATEGORIES } from '@/lib/services-hub';
import { SITE_URL } from '@/lib/supabase';

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

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/**
 * Shared layout for the SEO service pages and /digital-marketing, in the style of
 * the /seo-services hub: navy hero, white "What's included" cards, a numbered
 * process, a native <details> FAQ (no client JS), related hub cards and the green
 * CTA band. `extra` renders after "What's included", inside the page container.
 */
export function ServicePageView({
  page,
  brand,
  extra,
}: {
  page: ServicePage;
  brand: string;
  extra?: ReactNode;
}) {
  const isMarketing = page.slug === 'digital-marketing';
  const trail = isMarketing
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
  // /digital-marketing sits outside the hub sections, so it keeps its own tag.
  const eyebrow = isMarketing
    ? page.tag
    : (HUB_CATEGORIES.find((c) => c.id === page.hub)?.title ?? page.tag);
  const isAudit = page.ctaHref === '/seo-audit';

  return (
    <>
      <JsonLd data={breadcrumbSchema(trail, page.path)} />
      <JsonLd data={service} />
      <PageHero
        trail={trail}
        eyebrow={eyebrow}
        heading={page.h1}
        subheading={page.intro}
        // Counts of what the page itself lists, not marketing figures.
        stats={[
          { value: page.includes.length, label: 'Deliverables' },
          { value: steps.length, label: 'Step process' },
          { value: page.faq.length, label: 'FAQs answered' },
        ]}
      >
        <div className="mt-2 flex flex-wrap gap-3">
          <Link
            href={page.ctaHref}
            className={`${HUB_BUTTON} bg-primary-container hover:bg-primary text-white`}
          >
            <Icon name={isAudit ? 'fact_check' : 'mail'} size={18} />
            {page.ctaLabel}
          </Link>
          {/* The second button offers whichever of audit and quote the first one doesn't. */}
          {isAudit ? (
            <Link
              href={quoteHref(page.name)}
              className={`${HUB_BUTTON} border border-white/40 text-white hover:bg-white/10`}
            >
              <Icon name="mail" size={18} />
              Request a quote
            </Link>
          ) : (
            <Link
              href="/seo-audit"
              className={`${HUB_BUTTON} border border-white/40 text-white hover:bg-white/10`}
            >
              <Icon name="fact_check" size={18} />
              Free SEO audit
            </Link>
          )}
        </div>
      </PageHero>

      <div className="bg-white py-16 lg:py-20">
        <div className="container-page">
          <section aria-labelledby="sp-included">
            <HubSectionHeader
              id="sp-included"
              icon={page.icon}
              title="What's included"
              count={plural(page.includes.length, 'Deliverable', 'Deliverables')}
            />
            <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {page.includes.map((item) => (
                <li
                  key={item.title}
                  className="border-border-subtle hover:border-primary-container before:bg-primary-container relative flex flex-col gap-2.5 overflow-hidden rounded-xl border-[1.5px] bg-white px-5 py-[22px] transition duration-200 before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:origin-left before:scale-x-0 before:transition-transform before:duration-200 hover:shadow-[0_4px_20px_rgb(12_130_38/0.12)] hover:before:scale-x-100 motion-safe:hover:-translate-y-0.5"
                >
                  <Icon name="check_circle" size={22} className="text-primary-container" />
                  <h3 className="font-display text-on-surface text-[15px] leading-snug font-bold">
                    {item.title}
                  </h3>
                  <p className="text-[13px] leading-[1.65] text-[var(--text-muted)]">{item.body}</p>
                </li>
              ))}
            </ul>
          </section>

          {extra ? <div className="mt-16">{extra}</div> : null}
        </div>
      </div>

      <section aria-labelledby="sp-steps" className="bg-hero-strip py-16 lg:py-20">
        <div className="container-page">
          <HubSectionHeader
            id="sp-steps"
            icon="alt_route"
            title="How it works"
            count={plural(steps.length, 'Step', 'Steps')}
          />
          <ol
            className={`grid gap-x-6 gap-y-10 md:grid-cols-2 ${
              steps.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
            }`}
          >
            {steps.map((s, i) => (
              <li
                key={s.title}
                // Thin rule from the number to the next step, desktop only.
                className="lg:after:bg-brand-200 relative lg:after:absolute lg:after:top-5 lg:after:right-[-24px] lg:after:left-16 lg:after:h-0.5 lg:last:after:hidden"
              >
                <span
                  aria-hidden="true"
                  className="font-display text-primary-container block text-[40px] leading-none font-extrabold"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display text-on-surface mt-4 text-[17px] leading-snug font-bold">
                  <span className="sr-only">Step {i + 1}: </span>
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="sp-faq" className="bg-white py-16 lg:py-20">
        <div className="container-page">
          <HubSectionHeader
            id="sp-faq"
            icon="fact_check"
            title="Frequently asked questions"
            count={plural(page.faq.length, 'Question', 'Questions')}
          />
          {/* Visible only: no FAQPage markup (see the note on ServicePage.faq). */}
          <div className="grid max-w-3xl gap-3">
            {page.faq.map((item, i) => (
              <details
                key={item.q}
                open={i === 0}
                className="group border-border-subtle open:border-brand-200 rounded-xl border-[1.5px] bg-white transition-colors"
              >
                <summary className="focus-visible:outline-primary-container flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-5 py-4 focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-details-marker]:hidden">
                  <h3 className="font-display text-on-surface text-[15px] leading-snug font-bold">
                    {item.q}
                  </h3>
                  <Icon
                    name="expand_more"
                    size={22}
                    className="text-primary-container shrink-0 transition-transform duration-200 group-open:rotate-180"
                  />
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-[var(--text-muted)]">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <div className="bg-hero-strip py-16 lg:py-20">
        <div className="container-page">
          {related.length > 0 ? (
            <section aria-labelledby="sp-related" className="mb-12">
              <HubSectionHeader
                id="sp-related"
                icon="hub"
                title="Related services"
                count={plural(related.length, 'Service', 'Services')}
              />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {related.map((s) => (
                  <ServiceCard key={s.slug} service={s} tag={s.tag} />
                ))}
              </div>
            </section>
          ) : null}
          <section aria-labelledby="sp-guides">
            <h2
              id="sp-guides"
              className="font-display text-on-surface text-lg leading-tight font-extrabold"
            >
              Guides and tools
            </h2>
            <ul className="mt-4 flex flex-wrap gap-3">
              {page.guides.map((g) => (
                <li key={g.href}>
                  <Link
                    href={g.href}
                    className="border-border-subtle hover:border-primary-container hover:bg-brand-50 text-primary-container focus-visible:outline-primary-container inline-flex items-center gap-1.5 rounded-full border-[1.5px] bg-white px-4 py-2 text-[13px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    {g.label}
                    <Icon name="arrow_forward" size={16} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <HubCtaBand heading={`Talk to ${brand}`} quoteHref={quoteHref(page.name)} />
    </>
  );
}
