import type { Metadata } from 'next';
import Link from 'next/link';
import { Icon } from '@/components/icon';
import { JsonLd, breadcrumbSchema } from '@/components/json-ld';
import { PageHero } from '@/components/page-hero';
import { getPageContent } from '@/lib/content/get';
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
  fd.set('source', 'audit');
  await submitContact(fd);
}

export default async function SeoAuditPage() {
  const trail = [{ label: 'Home', href: '/' }, { label: 'SEO audit' }];
  const { hero, quick_check: quick, covers, form } = await getPageContent('seo_audit');

  return (
    <>
      <JsonLd data={breadcrumbSchema(trail, '/seo-audit')} />
      <PageHero
        trail={trail}
        eyebrow={hero.eyebrow}
        heading={
          <>
            {hero.heading_start ? `${hero.heading_start} ` : null}
            {hero.heading_highlight ? (
              <span className="text-hero-green-light">{hero.heading_highlight}</span>
            ) : null}
            {hero.heading_end ? ` ${hero.heading_end}` : null}
          </>
        }
        subheading={hero.intro}
        stats={[
          ...(quick.visible ? [{ value: quickTools.length, label: hero.stat_checks }] : []),
          ...(covers.visible && covers.cards.length > 0
            ? [{ value: covers.cards.length, label: hero.stat_areas }]
            : []),
        ]}
      >
        <div className="flex flex-wrap gap-3">
          <a
            href={hero.primary.href}
            className="bg-primary-container text-on-primary hover:bg-primary inline-flex items-center gap-2 rounded-xl px-6 py-3.5 font-semibold shadow-md transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-hidden"
          >
            <Icon name={hero.primary_icon} size={20} />
            {hero.primary.label}
          </a>
          <a
            href={hero.secondary.href}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-hidden"
          >
            <Icon name={hero.secondary_icon} size={20} />
            {hero.secondary.label}
          </a>
        </div>
      </PageHero>

      <div className="container-page py-12">
        {quick.visible ? (
          <>
            <h2 id="quick-check" className="font-headline-md text-headline-md scroll-mt-24">
              {quick.heading}
            </h2>
            {quick.intro ? (
              <p className="mt-2 max-w-3xl text-[var(--text-muted)]">{quick.intro}</p>
            ) : null}
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
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                    {t.summary}
                  </p>
                </Link>
              ))}
            </div>
          </>
        ) : null}

        {covers.visible ? (
          <>
            <h2
              className={
                quick.visible
                  ? 'font-headline-md text-headline-md mt-16'
                  : 'font-headline-md text-headline-md'
              }
            >
              {covers.heading}
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {covers.cards.map((c, i) => (
                <div key={`${i}-${c.title}`} className="surface-card flex flex-col p-6">
                  <div className="bg-surface-container-low text-primary-container mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                    <Icon name={c.icon} size={26} />
                  </div>
                  <h3 className="font-title-md text-title-md">{c.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{c.body}</p>
                </div>
              ))}
            </div>
          </>
        ) : null}

        {form.visible ? (
          <section
            id="full-audit"
            aria-labelledby="full-audit-heading"
            className={
              quick.visible || covers.visible
                ? 'surface-card mt-16 max-w-3xl scroll-mt-24 p-6 shadow-sm sm:p-10'
                : 'surface-card max-w-3xl scroll-mt-24 p-6 shadow-sm sm:p-10'
            }
          >
            <h2 id="full-audit-heading" className="font-headline-sm text-headline-sm">
              {form.heading}
            </h2>
            {form.intro ? (
              <p className="mt-2 text-sm text-[var(--text-muted)]">{form.intro}</p>
            ) : null}
            <form action={submitAudit} className="mt-6 space-y-5">
              <input type="hidden" name="subject" value="SEO services" />
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="audit-name" className="mb-1.5 block text-sm font-medium">
                    {form.name_label}
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
                    {form.email_label}
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
                  {form.site_label}
                </label>
                <input
                  id="audit-site"
                  name="site_url"
                  type="url"
                  required
                  maxLength={300}
                  placeholder={form.site_placeholder}
                  className={FIELD}
                />
              </div>
              <div>
                <label htmlFor="audit-message" className="mb-1.5 block text-sm font-medium">
                  {form.message_label}
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
                {form.submit}
                <Icon name={form.submit_icon} size={18} />
              </button>
            </form>
          </section>
        ) : null}
      </div>
    </>
  );
}
