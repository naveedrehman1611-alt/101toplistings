import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon } from '@/components/icon';
import { JsonLd, breadcrumbSchema } from '@/components/json-ld';
import { PageHero } from '@/components/page-hero';
import { HubSectionHeader } from '@/components/services-hub/hub-section-header';
import { HubCtaBand, HUB_BUTTON } from '@/components/services-hub/hub-cta-band';
import { ServiceCard } from '@/components/services-hub/service-card';
import { getPageContent } from '@/lib/content/get';
import { serviceKey } from '@/lib/content/pages/services';
import { DEFAULT_AREA_SERVED, quoteHref, servicePage, type ServicePage } from '@/lib/service-pages';
import { hubTitle } from '@/lib/services-hub';
import { SITE_URL } from '@/lib/supabase';

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/**
 * Shared layout for the SEO service pages and the standalone service pages
 * (/digital-marketing, /website-development), in the style of
 * the /seo-services hub: navy hero, white "What's included" cards, a numbered
 * process, a native <details> FAQ (no client JS), related hub cards and the green
 * CTA band. `extra` renders after "What's included", inside the page container.
 *
 * The copy comes from Admin → Content: this page's own section under "Service
 * pages" (keyed by slug) and the shared labels under "Service pages: shared
 * labels". Name, path, hub, related slugs and meta stay in
 * src/lib/service-pages.ts, since routing, menus and SEO read them too. The
 * content reads are cached per request, so every page shares one query.
 */
export async function ServicePageView({
  page,
  extra,
  directory = [],
}: {
  page: ServicePage;
  extra?: ReactNode;
  /** Matching directory categories, for industry pages (src/lib/service-directory.ts). */
  directory?: { label: string; href: string }[];
}) {
  const [pages, t, hub] = await Promise.all([
    getPageContent('service'),
    getPageContent('service_template'),
    getPageContent('seo_services'),
  ]);
  // Every service has a section; the fallbacks only cover a slug added without one.
  const c = pages[serviceKey(page.slug)] as (typeof pages)[string] | undefined;
  const h1 = c?.h1 ?? page.h1;
  const intro = c?.intro ?? page.intro;
  const tag = c?.tag ?? page.tag;
  const cta = c?.cta ?? { label: page.ctaLabel, href: page.ctaHref };
  const includes = c?.includes ?? page.includes;
  const steps = c?.steps ?? page.steps ?? [];
  const faq = c?.faq ?? page.faq;
  const guides = c?.guides.map((g) => g.link) ?? page.guides;
  const tagOf = (s: ServicePage) =>
    (pages[serviceKey(s.slug)] as (typeof pages)[string] | undefined)?.tag ?? s.tag;

  // Standalone pages sit at the top level, outside /seo-services.
  const standalone = !page.path.startsWith('/seo-services/');
  const trail = standalone
    ? [
        { label: t.hero.crumb_home, href: '/' },
        { label: page.slug === 'digital-marketing' ? t.hero.crumb_marketing : page.name },
      ]
    : [
        { label: t.hero.crumb_home, href: '/' },
        { label: t.hero.crumb_hub, href: '/seo-services' },
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
    areaServed: page.areaServed ?? DEFAULT_AREA_SERVED,
  };
  const related = page.related.flatMap((slug) => servicePage(slug) ?? []);
  // Standalone pages are not under a hub section heading, so they keep their own tag.
  const eyebrow = standalone || !page.hub ? tag : hubTitle(hub, page.hub) || tag;
  const isAudit = cta.href === '/seo-audit';
  const quote = quoteHref(page.name, page.quoteSubject);
  // A list emptied in the admin drops its figure and its block.
  const stats = [
    { value: includes.length, label: t.hero.stat_includes },
    { value: steps.length, label: t.hero.stat_steps },
    { value: faq.length, label: t.hero.stat_faq },
  ].filter((s) => s.value > 0);
  const showIncluded = t.included.visible && includes.length > 0;
  const showRelated = t.related.visible && related.length > 0;
  const links = [...directory, ...guides];
  const showGuides = t.guides.visible && links.length > 0;

  return (
    <>
      <JsonLd data={breadcrumbSchema(trail, page.path)} />
      <JsonLd data={service} />
      <PageHero trail={trail} eyebrow={eyebrow} heading={h1} subheading={intro} stats={stats}>
        <div className="mt-2 flex flex-wrap gap-3">
          <Link
            href={cta.href}
            className={`${HUB_BUTTON} bg-primary-container hover:bg-primary text-white`}
          >
            <Icon name={isAudit ? t.hero.audit_icon : t.hero.quote_icon} size={18} />
            {cta.label}
          </Link>
          {/* The second button offers whichever of audit and quote the first one doesn't. */}
          {isAudit ? (
            <Link
              href={quote}
              className={`${HUB_BUTTON} border border-white/40 text-white hover:bg-white/10`}
            >
              <Icon name={t.hero.quote_icon} size={18} />
              {t.hero.quote_button}
            </Link>
          ) : (
            <Link
              href={t.hero.audit_button.href}
              className={`${HUB_BUTTON} border border-white/40 text-white hover:bg-white/10`}
            >
              <Icon name={t.hero.audit_icon} size={18} />
              {t.hero.audit_button.label}
            </Link>
          )}
        </div>
      </PageHero>

      {showIncluded || extra ? (
        <div className="bg-white py-16 lg:py-20">
          <div className="container-page">
            {showIncluded ? (
              <section aria-labelledby="sp-included">
                <HubSectionHeader
                  id="sp-included"
                  icon={page.icon}
                  title={t.included.heading}
                  count={plural(includes.length, t.included.count_one, t.included.count_many)}
                />
                <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {includes.map((item, i) => (
                    <li
                      key={`${i}-${item.title}`}
                      className="border-border-subtle hover:border-primary-container before:bg-primary-container relative flex flex-col gap-2.5 overflow-hidden rounded-xl border-[1.5px] bg-white px-5 py-[22px] transition duration-200 before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:origin-left before:scale-x-0 before:transition-transform before:duration-200 hover:shadow-[0_4px_20px_rgb(12_130_38/0.12)] hover:before:scale-x-100 motion-safe:hover:-translate-y-0.5"
                    >
                      <Icon
                        name={t.included.card_icon}
                        size={22}
                        className="text-primary-container"
                      />
                      <h3 className="font-display text-on-surface text-[15px] leading-snug font-bold">
                        {item.title}
                      </h3>
                      <p className="text-[13px] leading-[1.65] text-[var(--text-muted)]">
                        {item.body}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {extra ? <div className={showIncluded ? 'mt-16' : undefined}>{extra}</div> : null}
          </div>
        </div>
      ) : null}

      {t.steps.visible && steps.length > 0 ? (
        <section aria-labelledby="sp-steps" className="bg-hero-strip py-16 lg:py-20">
          <div className="container-page">
            <HubSectionHeader
              id="sp-steps"
              icon={t.steps.icon}
              title={t.steps.heading}
              count={plural(steps.length, t.steps.count_one, t.steps.count_many)}
            />
            <ol
              className={`grid gap-x-6 gap-y-10 md:grid-cols-2 ${
                steps.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
              }`}
            >
              {steps.map((s, i) => (
                <li
                  key={`${i}-${s.title}`}
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
      ) : null}

      {t.faq.visible && faq.length > 0 ? (
        <section aria-labelledby="sp-faq" className="bg-white py-16 lg:py-20">
          <div className="container-page">
            <HubSectionHeader
              id="sp-faq"
              icon={t.faq.icon}
              title={t.faq.heading}
              count={plural(faq.length, t.faq.count_one, t.faq.count_many)}
            />
            {/* Visible only: no FAQPage markup (see the note on ServicePage.faq). */}
            <div className="grid max-w-3xl gap-3">
              {faq.map((item, i) => (
                <details
                  key={`${i}-${item.q}`}
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
      ) : null}

      {showRelated || showGuides ? (
        <div className="bg-hero-strip py-16 lg:py-20">
          <div className="container-page">
            {showRelated ? (
              <section aria-labelledby="sp-related" className={showGuides ? 'mb-12' : undefined}>
                <HubSectionHeader
                  id="sp-related"
                  icon={t.related.icon}
                  title={t.related.heading}
                  count={plural(related.length, t.related.count_one, t.related.count_many)}
                />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {related.map((s) => (
                    <ServiceCard
                      key={s.slug}
                      service={s}
                      tag={tagOf(s)}
                      learnMore={t.related.learn_more}
                    />
                  ))}
                </div>
              </section>
            ) : null}
            {showGuides ? (
              <section aria-labelledby="sp-guides">
                <h2
                  id="sp-guides"
                  className="font-display text-on-surface text-lg leading-tight font-extrabold"
                >
                  {directory.length > 0 ? t.guides.heading_directory : t.guides.heading}
                </h2>
                <ul className="mt-4 flex flex-wrap gap-3">
                  {links.map((g, i) => (
                    <li key={`${i}-${g.href}`}>
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
            ) : null}
          </div>
        </div>
      ) : null}

      {t.cta.visible ? (
        <HubCtaBand
          heading={t.cta.heading}
          body={t.cta.body}
          primary={t.cta.primary}
          primaryIcon={t.cta.primary_icon}
          quoteLabel={t.cta.secondary_label}
          quoteIcon={t.cta.secondary_icon}
          quoteHref={quote}
        />
      ) : null}
    </>
  );
}
