import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon } from '@/components/icon';
import { JsonLd, breadcrumbSchema } from '@/components/json-ld';
import { PageHero } from '@/components/page-hero';
import { SITE_URL } from '@/lib/supabase';
import { pageMetadata } from '@/lib/seo';
import type { SectionValues } from '@/lib/content/schema';
import type { TOOLS_PAGES } from '@/lib/content/pages/tools';
import {
  FREE_TOOLS,
  TOOLS_BASE,
  cardKey,
  getTool,
  relatedTools,
  toolHref,
  withCardCopy,
  type ShownTool,
  type ToolCardCopy,
} from '@/lib/free-tools';
import { RichBlocks, type RichClasses } from './rich-text';

/**
 * Metadata for a tool page. Deliberately not seoMetadata(): that reads seo_meta
 * from Supabase. pageMetadata() only adds the cached Settings read the root
 * layout already makes, for the site name and X account, and fills in the
 * self canonical and the rest of the share tags (SHARE_IMAGE included).
 */
export function toolMetadata(slug: string, title: string, description: string): Promise<Metadata> {
  return pageMetadata(toolHref(getTool(slug)), {
    title,
    description,
    openGraph: { title, description },
    twitter: { card: 'summary_large_image', title, description },
  });
}

type Values<P extends keyof typeof TOOLS_PAGES> = {
  [S in keyof (typeof TOOLS_PAGES)[P]['sections']]: SectionValues<
    (typeof TOOLS_PAGES)[P]['sections'][S]
  >;
};

/** The resolved /free-tools hub content (getPageContent('free_tools')). */
export type HubContent = Values<'free_tools'>;

/** A tool page's own labels (its `tool` section), for the client component. */
export type ToolLabels<P extends keyof typeof TOOLS_PAGES> =
  Values<P> extends {
    tool: infer T;
  }
    ? T
    : never;

/** The sections every tool page shares; `tool` (the tool's own labels) differs per page. */
export type ToolPageContent = Omit<Values<'tool_robots_txt'>, 'tool'>;

/** Every tool with its card copy from the hub content (names, summaries, icons). */
export function toolsWithCopy(hub: HubContent): ShownTool[] {
  // The card sections are generated from FREE_TOOLS (see pages/tools.ts), so
  // their keys are not spelled out in the type.
  const cards = hub as unknown as Record<string, ToolCardCopy | undefined>;
  return FREE_TOOLS.map((t) => withCardCopy(t, cards[cardKey(t.slug)]));
}

/**
 * The frame every free tool page shares: a navy hero (breadcrumbs, H1, intro), the
 * interactive tool (children, a client component), how-it-works steps, a
 * guide, FAQ and related tools, plus WebApplication, FAQPage and
 * BreadcrumbList JSON-LD built from the same content that is shown.
 * Copy comes from Admin → Content: the tool's own page (`content`) and the hub
 * (`hub`: tool names, summaries and icons, and the hub's breadcrumb name).
 */
export function ToolPage({
  slug,
  content: c,
  hub,
  children,
  rich,
}: {
  slug: string;
  content: ToolPageContent;
  hub: HubContent;
  children: ReactNode;
  /** Classes for `code`, **bold** and links in the guide, matching each page's design. */
  rich?: RichClasses;
}) {
  const tools = toolsWithCopy(hub);
  const tool = tools.find((t) => t.slug === slug) ?? withCardCopy(getTool(slug), undefined);
  const path = toolHref(tool);
  const trail = [
    { label: 'Home', href: '/' },
    { label: hub.hero.breadcrumb, href: TOOLS_BASE },
    { label: tool.name },
  ];
  const related = c.related.visible ? relatedTools(slug, 4, tools) : [];
  const steps = c.steps.visible ? c.steps.items : [];
  const guide = c.guide.visible ? c.guide.parts : [];
  // A hidden FAQ is left out of the FAQPage data too, so the data matches the page.
  const faqs = c.faq.visible ? c.faq.items : [];

  return (
    <>
      <JsonLd data={breadcrumbSchema(trail, path)} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: tool.name,
          url: `${SITE_URL}${path}`,
          description: c.hero.intro,
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
              name: f.question,
              acceptedAnswer: { '@type': 'Answer', text: f.answer },
            })),
          }}
        />
      ) : null}

      <PageHero
        trail={trail}
        eyebrow={c.hero.eyebrow || undefined}
        heading={c.hero.heading}
        subheading={c.hero.intro}
      >
        {c.hero.badge ? (
          <span className="font-label-sm text-label-sm inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70">
            <Icon name={tool.icon} size={16} />
            {c.hero.badge}
          </span>
        ) : null}
      </PageHero>

      <div className="container-page py-10 md:py-12">
        <section aria-label={tool.name}>{children}</section>

        {steps.length ? (
          <section className="mt-16">
            <h2 className="font-headline-md text-headline-md text-on-surface">{c.steps.heading}</h2>
            <ol className="mt-6 grid gap-4 md:grid-cols-3">
              {steps.map((step, i) => (
                <li key={i} className="surface-card p-6">
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

        {guide.length ? (
          <section className="mt-16 max-w-3xl">
            {guide.map((section, i) => (
              <div key={i} className="mt-10 first:mt-0">
                <h2 className="font-headline-md text-headline-md text-on-surface">
                  {section.heading}
                </h2>
                <div className="font-body-md text-body-md text-on-surface-variant mt-4 space-y-4 leading-relaxed">
                  <RichBlocks text={section.body} classes={rich} />
                </div>
              </div>
            ))}
          </section>
        ) : null}

        {faqs.length ? (
          <section className="mt-16 max-w-3xl">
            <h2 className="font-headline-md text-headline-md text-on-surface">{c.faq.heading}</h2>
            <div className="mt-6 flex flex-col gap-3">
              {faqs.map((f, i) => (
                <details key={i} className="surface-card group p-5">
                  <summary className="font-title-md text-title-md text-on-surface flex cursor-pointer list-none items-center justify-between gap-4">
                    {f.question}
                    <Icon
                      name="expand_more"
                      className="text-secondary transition-transform group-open:rotate-180"
                    />
                  </summary>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-3">
                    {f.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        ) : null}

        {related.length ? (
          <section className="mt-16">
            <h2 className="font-headline-md text-headline-md text-on-surface">
              {c.related.heading}
            </h2>
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
            {c.related.all.label && c.related.all.href ? (
              <Link
                href={c.related.all.href}
                className="font-label-md text-label-md text-primary-container hover:text-primary mt-6 inline-flex items-center gap-1 font-semibold"
              >
                {c.related.all.label} <Icon name="north_east" size={16} />
              </Link>
            ) : null}
          </section>
        ) : null}
      </div>
    </>
  );
}
