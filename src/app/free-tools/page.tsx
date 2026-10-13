import type { Metadata } from 'next';
import Link from 'next/link';
import { Icon } from '@/components/icon';
import { JsonLd, breadcrumbSchema } from '@/components/json-ld';
import { PageHero } from '@/components/page-hero';
import { SITE_URL } from '@/lib/supabase';
import { SHARE_IMAGE } from '@/lib/seo';
import { getPageContent } from '@/lib/content/get';
import { categoryField } from '@/lib/content/pages/tools';
import { toolsWithCopy, type HubContent } from '@/components/tools/tool-page';
import { TOOLS_BASE, TOOL_CATEGORIES, toolHref, type ShownTool } from '@/lib/free-tools';

const TITLE = 'Free SEO Tools — No Signup';
const DESCRIPTION =
  'Free SEO tools that run in your browser: speed and mobile tests, keyword density, meta tag and SERP preview, schema, robots.txt and slug generators. No signup.';

// Static on purpose: seoMetadata() would add a Supabase read to this page's metadata.
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: TOOLS_BASE },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: TOOLS_BASE,
    type: 'website',
    images: [SHARE_IMAGE],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

function ToolCard({ tool, labels }: { tool: ShownTool; labels: HubContent['tools'] }) {
  const live = tool.status === 'live';
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span
          className={`grid size-11 shrink-0 place-items-center rounded-xl ${
            live ? 'bg-brand-50 text-primary-container' : 'bg-surface-container-low text-secondary'
          }`}
        >
          <Icon name={tool.icon} size={22} />
        </span>
        {live && tool.isNew && labels.new_badge ? (
          <span className="bg-brand-50 text-primary-container rounded-full px-2 py-0.5 text-[11px] font-bold tracking-wider uppercase">
            {labels.new_badge}
          </span>
        ) : null}
        {!live && labels.soon_badge ? (
          <span className="bg-surface-container-low text-secondary rounded-full px-2 py-0.5 text-[11px] font-bold tracking-wider uppercase">
            {labels.soon_badge}
          </span>
        ) : null}
      </div>
      <h3
        className={`font-title-md text-title-md mt-4 ${live ? 'text-on-surface group-hover:text-primary-container transition-colors' : 'text-secondary'}`}
      >
        {tool.name}
      </h3>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5">{tool.summary}</p>
      {live && labels.open ? (
        <span className="font-label-md text-label-md text-primary-container mt-4 inline-flex items-center gap-1 font-semibold">
          {labels.open}
          <Icon
            name="arrow_forward"
            size={16}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </span>
      ) : null}
    </>
  );

  if (!live) {
    return (
      <div aria-disabled="true" className="surface-card flex h-full flex-col p-6 opacity-70">
        {body}
      </div>
    );
  }
  return (
    <Link
      href={toolHref(tool)}
      className="surface-card group focus-visible:outline-primary-container flex h-full flex-col p-6 transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      {body}
    </Link>
  );
}

export default async function FreeToolsPage() {
  const c = await getPageContent('free_tools');
  // Hidden cards (Admin → Content) are left out of the grid, the counts and the ItemList.
  const tools = toolsWithCopy(c).filter((t) => t.visible);
  const live = tools.filter((t) => t.status === 'live');
  const labels = c.tools as HubContent['tools'] & Record<string, string>;
  const categories = TOOL_CATEGORIES.map((category) => ({
    ...category,
    label: labels[categoryField(category.id)] ?? category.label,
    tools: tools.filter((tool) => tool.category === category.id),
  })).filter((category) => category.tools.length);
  const trail = [{ label: 'Home', href: '/' }, { label: c.hero.breadcrumb }];

  return (
    <>
      <JsonLd data={breadcrumbSchema(trail, TOOLS_BASE)} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: c.hero.breadcrumb,
          numberOfItems: live.length,
          itemListElement: live.map((tool, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `${SITE_URL}${toolHref(tool)}`,
            name: tool.name,
          })),
        }}
      />

      <PageHero
        trail={trail}
        eyebrow={c.hero.eyebrow || undefined}
        heading={
          <>
            {c.hero.heading}
            {c.hero.highlight ? (
              <>
                {' '}
                <span className="text-hero-green-light">{c.hero.highlight}</span>
              </>
            ) : null}
          </>
        }
        subheading={c.hero.intro}
        stats={[
          { value: live.length, label: c.hero.stat_tools },
          { value: categories.length, label: c.hero.stat_categories },
          { value: c.hero.stat_free_value, label: c.hero.stat_free_label },
        ]}
      >
        {c.hero.badge ? (
          <span className="font-label-sm text-label-sm inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70">
            <Icon name={c.hero.badge_icon} size={16} />
            {c.hero.badge}
          </span>
        ) : null}
      </PageHero>

      <div className="container-page py-10 md:py-12">
        {categories.map((category, i) => (
          <section
            key={category.id}
            aria-labelledby={`cat-${category.id}`}
            className={i === 0 ? '' : 'mt-14'}
          >
            <h2
              id={`cat-${category.id}`}
              className="font-headline-md text-headline-md text-on-surface"
            >
              {category.label}
            </h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {category.tools.map((tool) => (
                <li key={tool.slug}>
                  <ToolCard tool={tool} labels={c.tools} />
                </li>
              ))}
            </ul>
          </section>
        ))}

        {c.why.visible ? (
          <section aria-labelledby="why-free" className="mt-16">
            <h2 id="why-free" className="font-headline-md text-headline-md text-on-surface">
              {c.why.heading}
            </h2>
            <ul className="mt-6 grid gap-4 md:grid-cols-3">
              {c.why.items.map((item, i) => (
                <li key={i} className="surface-card p-6">
                  <span className="bg-brand-50 text-primary-container grid size-10 place-items-center rounded-xl">
                    <Icon name={item.icon} size={20} />
                  </span>
                  <h3 className="font-title-md text-title-md text-on-surface mt-4">{item.title}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {c.cta.visible ? (
          <section className="surface-card mt-16 flex flex-col items-start gap-6 p-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <h2 className="font-headline-md text-headline-md text-on-surface">{c.cta.heading}</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2">{c.cta.body}</p>
            </div>
            {c.cta.button.label && c.cta.button.href ? (
              <Link
                href={c.cta.button.href}
                className="bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary focus-visible:outline-primary-container inline-flex h-11 shrink-0 items-center gap-2 rounded-lg px-5 shadow-xs transition-all hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {c.cta.button.label}
                <Icon name="arrow_forward" size={18} />
              </Link>
            ) : null}
          </section>
        ) : null}
      </div>
    </>
  );
}
