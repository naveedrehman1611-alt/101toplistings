import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui';
import { Icon, type IconName } from '@/components/icon';
import { JsonLd, breadcrumbSchema } from '@/components/json-ld';
import { LIVE_TOOLS, toolHref } from '@/lib/free-tools';
import { submitContact } from '@/lib/public-actions';
import { seoMetadata } from '@/lib/seo';

export const revalidate = 3600;

const TITLE = 'SEO Audit | Find & Fix Website SEO Issues';
const DESCRIPTION =
  'Check technical, on-page, content, internal linking, and authority issues with a practical SEO audit built for growth.';

export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata('/seo-audit', {
    title: TITLE,
    description: DESCRIPTION,
    openGraph: { title: TITLE, description: DESCRIPTION },
    twitter: { card: 'summary_large_image', title: TITLE },
  });
}

// The live free tools that cover speed, mobile, meta tags, robots, schema and keywords.
const QUICK_CHECKS = [
  'website-speed-test',
  'mobile-friendly-test',
  'meta-tag-generator',
  'robots-txt-generator',
  'schema-markup-generator',
  'keyword-density-checker',
];
const quickTools = QUICK_CHECKS.flatMap((slug) => LIVE_TOOLS.find((t) => t.slug === slug) ?? []);

const COVERS: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'build',
    title: 'Technical',
    body: 'Crawling, indexing, redirects, sitemaps, site speed, Core Web Vitals and mobile usability.',
  },
  {
    icon: 'fact_check',
    title: 'On-page',
    body: 'Titles, descriptions, headings, keyword targeting and structured data on your key pages.',
  },
  {
    icon: 'manage_search',
    title: 'Content',
    body: 'Whether pages match search intent, where content is thin or duplicated, and which topics are missing.',
  },
  {
    icon: 'lan',
    title: 'Internal linking',
    body: 'How pages link to each other, orphaned pages and the anchor text that points to important ones.',
  },
  {
    icon: 'public',
    title: 'Authority',
    body: 'Your backlink profile, brand mentions and citations compared with the sites you compete with.',
  },
];

const FIELD =
  'block w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm outline-hidden transition-colors hover:border-brand-300 focus:border-primary-container focus:bg-[var(--surface)] focus:ring-4 focus:ring-primary-container/20';

/** Folds the website URL into the message, then hands off to the contact action. */
async function submitAudit(fd: FormData) {
  'use server';
  const site = String(fd.get('site_url') ?? '').trim();
  const message = String(fd.get('message') ?? '').trim();
  fd.set('subject', 'SEO services');
  fd.set('message', `SEO audit request\nWebsite: ${site || 'not given'}\n\n${message}`);
  fd.delete('site_url');
  await submitContact(fd);
}

export default function SeoAuditPage() {
  const trail = [{ label: 'Home', href: '/' }, { label: 'SEO audit' }];

  return (
    <div className="container-page py-12">
      <JsonLd data={breadcrumbSchema(trail, '/seo-audit')} />
      <Breadcrumbs trail={trail} />
      <div className="max-w-3xl">
        <h1 className="font-headline-lg text-headline-lg">SEO audit</h1>
        <p className="mt-4 text-lg text-[var(--text-muted)]">
          A website SEO audit finds what is holding your site back in search: technical faults, weak
          pages, thin content, poor internal links and a lack of authority. Start with the free SEO
          audit tools below, or request a full audit from our team.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#quick-check"
            className="bg-primary-container text-on-primary hover:bg-primary focus-visible:ring-primary-container inline-flex items-center gap-2 rounded-xl px-6 py-3.5 font-semibold shadow-md transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
          >
            <Icon name="speed" size={20} />
            Run a quick check
          </a>
          <a
            href="#full-audit"
            className="bg-surface-card text-on-surface hover:border-primary-container inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-6 py-3.5 font-semibold transition-colors"
          >
            <Icon name="mail" size={20} />
            Request a full audit
          </a>
        </div>
      </div>

      <h2 id="quick-check" className="font-headline-md text-headline-md mt-16 scroll-mt-24">
        Run a quick check now
      </h2>
      <p className="mt-2 max-w-3xl text-[var(--text-muted)]">
        These free SEO audit tools run in your browser. Each one checks a single area, so they are a
        starting point rather than a complete audit.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {quickTools.map((t) => (
          <Link
            key={t.slug}
            href={toolHref(t)}
            className="surface-card hover:border-primary-container flex flex-col p-6 transition-colors"
          >
            <div className="bg-surface-container-low text-primary-container mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
              <Icon name={t.icon} size={26} />
            </div>
            <h3 className="font-title-md text-title-md">{t.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{t.summary}</p>
          </Link>
        ))}
      </div>

      <h2 className="font-headline-md text-headline-md mt-16">What the full audit covers</h2>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {COVERS.map((c) => (
          <div key={c.title} className="surface-card flex flex-col p-6">
            <div className="bg-surface-container-low text-primary-container mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
              <Icon name={c.icon} size={26} />
            </div>
            <h3 className="font-title-md text-title-md">{c.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{c.body}</p>
          </div>
        ))}
      </div>

      <section
        id="full-audit"
        aria-labelledby="full-audit-heading"
        className="surface-card mt-16 max-w-3xl scroll-mt-24 p-6 shadow-sm sm:p-10"
      >
        <h2 id="full-audit-heading" className="font-headline-sm text-headline-sm">
          Request a full website SEO audit
        </h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Tell us about your site and what you want from search. We will reply by email with the
          next step. After you send the form you will see a confirmation on our contact page.
        </p>
        <form action={submitAudit} className="mt-6 space-y-5">
          <input type="hidden" name="subject" value="SEO services" />
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="audit-name" className="mb-1.5 block text-sm font-medium">
                Your name
              </label>
              <input
                id="audit-name"
                name="name"
                required
                maxLength={120}
                autoComplete="name"
                className={FIELD}
              />
            </div>
            <div>
              <label htmlFor="audit-email" className="mb-1.5 block text-sm font-medium">
                Email address
              </label>
              <input
                id="audit-email"
                name="email"
                type="email"
                required
                maxLength={200}
                autoComplete="email"
                className={FIELD}
              />
            </div>
          </div>
          <div>
            <label htmlFor="audit-site" className="mb-1.5 block text-sm font-medium">
              Website URL
            </label>
            <input
              id="audit-site"
              name="site_url"
              type="url"
              required
              maxLength={300}
              placeholder="https://example.com"
              className={FIELD}
            />
          </div>
          <div>
            <label htmlFor="audit-message" className="mb-1.5 block text-sm font-medium">
              What would you like us to look at?
            </label>
            <textarea
              id="audit-message"
              name="message"
              required
              rows={5}
              maxLength={4000}
              className={`${FIELD} resize-y`}
            />
          </div>
          {/* Honeypot: hidden from people and assistive tech, filled in by bots. */}
          <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label>
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <button
            type="submit"
            className="bg-primary-container font-label-md text-label-md text-on-primary hover:bg-primary focus-visible:ring-primary-container inline-flex h-12 items-center justify-center gap-2 rounded-xl px-7 shadow-xs transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
          >
            Request SEO audit
            <Icon name="arrow_forward" size={18} />
          </button>
        </form>
      </section>
    </div>
  );
}
