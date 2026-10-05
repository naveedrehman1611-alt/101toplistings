import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui';
import { Icon, type IconName } from '@/components/icon';
import { JsonLd, breadcrumbSchema } from '@/components/json-ld';
import { SITE_URL } from '@/lib/supabase';
import { SHARE_IMAGE } from '@/lib/seo';
import { LIVE_TOOLS, TOOLS_BASE, toolHref, toolsByCategory, type FreeTool } from '@/lib/free-tools';

const TITLE = 'Free SEO Tools — No Signup';
const DESCRIPTION =
  'Free SEO tools that run in your browser: speed and mobile tests, keyword density, meta tag and SERP preview, schema, robots.txt and slug generators. No signup.';

// Static on purpose: seoMetadata() would add a Supabase read to this page.
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

const TRAIL = [{ label: 'Home', href: '/' }, { label: 'Free SEO Tools' }];

const WHY: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'speed',
    title: 'They run on your device',
    body: 'Text tools and generators work entirely in your browser tab. The speed and mobile tests ask Google’s public PageSpeed Insights service directly from your browser, so nothing passes through our servers.',
  },
  {
    icon: 'verified_user',
    title: 'Nothing is stored',
    body: 'We do not save the URLs, text or settings you enter. Close the tab and it is gone — there is no account, history or tracking pixel tied to what you check.',
  },
  {
    icon: 'check_circle',
    title: 'Free with no catch',
    body: 'Because the work happens in your browser, the tools cost us almost nothing to run. They exist to be useful; if you want a hand applying what they find, our SEO team is there.',
  },
];

function ToolCard({ tool }: { tool: FreeTool }) {
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
        {live && tool.isNew ? (
          <span className="bg-brand-50 text-primary-container rounded-full px-2 py-0.5 text-[11px] font-bold tracking-wider uppercase">
            New
          </span>
        ) : null}
        {!live ? (
          <span className="bg-surface-container-low text-secondary rounded-full px-2 py-0.5 text-[11px] font-bold tracking-wider uppercase">
            Coming soon
          </span>
        ) : null}
      </div>
      <h3
        className={`font-title-md text-title-md mt-4 ${live ? 'text-on-surface group-hover:text-primary-container transition-colors' : 'text-secondary'}`}
      >
        {tool.name}
      </h3>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5">{tool.summary}</p>
      {live ? (
        <span className="font-label-md text-label-md text-primary-container mt-4 inline-flex items-center gap-1 font-semibold">
          Open tool
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

export default function FreeToolsPage() {
  const categories = toolsByCategory();

  return (
    <div className="container-page py-10 md:py-12">
      <JsonLd data={breadcrumbSchema(TRAIL, TOOLS_BASE)} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Free SEO Tools',
          numberOfItems: LIVE_TOOLS.length,
          itemListElement: LIVE_TOOLS.map((tool, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `${SITE_URL}${toolHref(tool)}`,
            name: tool.name,
          })),
        }}
      />

      <Breadcrumbs trail={TRAIL} />

      <header className="max-w-3xl">
        <span className="bg-brand-50 font-label-sm text-label-sm text-primary-container inline-flex items-center gap-1.5 rounded-full px-3 py-1">
          <Icon name="rocket_launch" size={16} />
          Free · No signup · Nothing stored
        </span>
        <h1 className="font-headline-lg text-headline-lg-mobile text-on-surface md:text-headline-lg mt-4">
          Free SEO Tools
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-3">
          Quick, practical checks and generators for small businesses and SEOs. Every tool runs in
          your browser, so there is no account to create, no limit to hit and nothing saved on our
          side. Test a page’s speed, preview how it looks in Google, check keyword use or generate
          schema and robots.txt in seconds.
        </p>
      </header>

      {categories.map((category) => (
        <section key={category.id} aria-labelledby={`cat-${category.id}`} className="mt-14">
          <h2
            id={`cat-${category.id}`}
            className="font-headline-md text-headline-md text-on-surface"
          >
            {category.label}
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {category.tools.map((tool) => (
              <li key={tool.slug}>
                <ToolCard tool={tool} />
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section aria-labelledby="why-free" className="mt-16">
        <h2 id="why-free" className="font-headline-md text-headline-md text-on-surface">
          Why these tools are free and private
        </h2>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {WHY.map((item) => (
            <li key={item.title} className="surface-card p-6">
              <span className="bg-brand-50 text-primary-container grid size-10 place-items-center rounded-xl">
                <Icon name={item.icon} size={20} />
              </span>
              <h3 className="font-title-md text-title-md text-on-surface mt-4">{item.title}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2">{item.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="surface-card mt-16 flex flex-col items-start gap-6 p-8 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Want the fixes done for you?
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            The tools show what needs attention. Our SEO services handle the rest — technical fixes,
            on-page optimisation and local SEO for businesses in Pakistan and beyond.
          </p>
        </div>
        <Link
          href="/services"
          className="bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary focus-visible:outline-primary-container inline-flex h-11 shrink-0 items-center gap-2 rounded-lg px-5 shadow-xs transition-all hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          See SEO services
          <Icon name="arrow_forward" size={18} />
        </Link>
      </section>
    </div>
  );
}
