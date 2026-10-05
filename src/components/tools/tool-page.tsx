import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Breadcrumbs } from '@/components/ui';
import { Icon } from '@/components/icon';
import { JsonLd, breadcrumbSchema } from '@/components/json-ld';
import { SITE_URL } from '@/lib/supabase';
import { SHARE_IMAGE } from '@/lib/seo';
import { TOOLS_BASE, getTool, relatedTools, toolHref } from '@/lib/free-tools';

/**
 * Static metadata for a tool page. Deliberately not seoMetadata(): that reads
 * seo_meta from Supabase, and these pages should add no database reads.
 */
export function toolMetadata(slug: string, title: string, description: string): Metadata {
  const path = toolHref(getTool(slug));
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type: 'website', images: [SHARE_IMAGE] },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export type ToolFaq = { q: string; a: string };

/**
 * The frame every free tool page shares: breadcrumbs, H1 and intro, the
 * interactive tool (children, a client component), how-it-works steps, a
 * guide, FAQ and related tools, plus WebApplication, FAQPage and
 * BreadcrumbList JSON-LD built from the same content that is shown.
 */
export function ToolPage({
  slug,
  h1,
  intro,
  children,
  steps,
  guide,
  faqs,
}: {
  slug: string;
  h1: string;
  intro: string;
  children: ReactNode;
  steps: { title: string; body: string }[];
  /** Long-form explainer sections below the tool. */
  guide?: { heading: string; body: ReactNode }[];
  faqs: ToolFaq[];
}) {
  const tool = getTool(slug);
  const path = toolHref(tool);
  const trail = [
    { label: 'Home', href: '/' },
    { label: 'Free SEO Tools', href: TOOLS_BASE },
    { label: tool.name },
  ];
  const related = relatedTools(slug);

  return (
    <div className="container-page py-10 md:py-12">
      <JsonLd data={breadcrumbSchema(trail, path)} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: tool.name,
          url: `${SITE_URL}${path}`,
          description: intro,
          applicationCategory: 'SEO tool',
          operatingSystem: 'Any (runs in the browser)',
          isAccessibleForFree: true,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        }}
      />
      {faqs.length ? (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }}
        />
      ) : null}

      <Breadcrumbs trail={trail} />

      <header className="max-w-3xl">
        <span className="bg-brand-50 font-label-sm text-label-sm text-primary-container inline-flex items-center gap-1.5 rounded-full px-3 py-1">
          <Icon name={tool.icon} size={16} />
          Free · No signup
        </span>
        <h1 className="font-headline-lg text-headline-lg-mobile text-on-surface md:text-headline-lg mt-4">
          {h1}
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-3">{intro}</p>
      </header>

      <section aria-label={tool.name} className="mt-8">
        {children}
      </section>

      {steps.length ? (
        <section className="mt-16">
          <h2 className="font-headline-md text-headline-md text-on-surface">How it works</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {steps.map((step, i) => (
              <li key={step.title} className="surface-card p-6">
                <span className="bg-primary-container text-on-primary font-label-md text-label-md grid size-8 place-items-center rounded-full">
                  {i + 1}
                </span>
                <h3 className="font-title-md text-title-md text-on-surface mt-4">{step.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {guide?.length ? (
        <section className="mt-16 max-w-3xl">
          {guide.map((section) => (
            <div key={section.heading} className="mt-10 first:mt-0">
              <h2 className="font-headline-md text-headline-md text-on-surface">
                {section.heading}
              </h2>
              <div className="font-body-md text-body-md text-on-surface-variant mt-4 space-y-4 leading-relaxed">
                {section.body}
              </div>
            </div>
          ))}
        </section>
      ) : null}

      {faqs.length ? (
        <section className="mt-16 max-w-3xl">
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Frequently asked questions
          </h2>
          <div className="mt-6 flex flex-col gap-3">
            {faqs.map((f) => (
              <details key={f.q} className="surface-card group p-5">
                <summary className="font-title-md text-title-md text-on-surface flex cursor-pointer list-none items-center justify-between gap-4">
                  {f.q}
                  <Icon
                    name="expand_more"
                    className="text-secondary transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="font-body-md text-body-md text-on-surface-variant mt-3">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      {related.length ? (
        <section className="mt-16">
          <h2 className="font-headline-md text-headline-md text-on-surface">More free SEO tools</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((t) => (
              <li key={t.slug}>
                <Link
                  href={toolHref(t)}
                  className="surface-card hover:border-primary-container focus-visible:outline-primary-container flex h-full flex-col gap-3 p-5 transition-colors focus-visible:outline-2"
                >
                  <span className="bg-surface-container-low text-primary-container grid size-10 place-items-center rounded-lg">
                    <Icon name={t.icon} size={20} />
                  </span>
                  <span className="font-title-md text-title-md text-on-surface">{t.name}</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {t.summary}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={TOOLS_BASE}
            className="font-label-md text-label-md text-primary-container hover:text-primary mt-6 inline-flex items-center gap-1 font-semibold"
          >
            View all free tools <Icon name="north_east" size={16} />
          </Link>
        </section>
      ) : null}
    </div>
  );
}
