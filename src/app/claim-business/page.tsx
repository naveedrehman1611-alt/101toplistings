import type { Metadata } from 'next';
import { Button } from '@/components/ui';
import { Icon } from '@/components/icon';
import { JsonLd, breadcrumbSchema } from '@/components/json-ld';
import { PageHero } from '@/components/page-hero';
import { seoMetadata } from '@/lib/seo';
import { getPageContent } from '@/lib/content/get';
import type { SectionValues } from '@/lib/content/schema';
import type { CLAIM_BUSINESS_PAGE } from '@/lib/content/pages/company';
import { InlineMarkdown } from '@/components/markdown';
import { HighlightedHeading } from '@/components/company/highlighted';

export const revalidate = 3600;

type Sections = (typeof CLAIM_BUSINESS_PAGE)['sections'];
type Content = { [K in keyof Sections]: SectionValues<Sections[K]> };

const TITLE = 'Claim Your Business Listing';
const DESCRIPTION =
  'Claim your business listing to manage its details, photos and opening hours. Find your business, submit a claim, and our team verifies it before handing over control.';

export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata('/claim-business', {
    title: TITLE,
    description: DESCRIPTION,
    openGraph: { title: TITLE, description: DESCRIPTION },
    twitter: { card: 'summary_large_image', title: TITLE },
  });
}

export default async function ClaimBusinessPage() {
  const { hero, find, steps, cta } = await getPageContent('claim_business');
  const trail = [{ label: 'Home', href: '/' }, { label: 'Claim your business' }];

  return (
    <>
      <JsonLd data={breadcrumbSchema(trail, '/claim-business')} />
      <PageHero
        trail={trail}
        eyebrow={hero.eyebrow}
        heading={<HighlightedHeading c={hero} className="text-hero-green-light" />}
        subheading={hero.intro}
      />
      <div className="container-page py-10 md:py-12">
        {find.visible ? <FindSection c={find} /> : null}
        {steps.visible ? <StepsSection c={steps} /> : null}
        {cta.visible ? <CtaSection c={cta} /> : null}
      </div>
    </>
  );
}

function FindSection({ c }: { c: Content['find'] }) {
  return (
    <>
      <h2 className="font-headline-md text-headline-md">{c.heading}</h2>
      <form action="/search" method="get" role="search" className="mt-4 flex max-w-xl gap-3">
        <label htmlFor="claim-q" className="sr-only">
          {c.placeholder}
        </label>
        <input
          id="claim-q"
          name="q"
          type="search"
          required
          maxLength={100}
          placeholder={c.placeholder}
          className="focus:border-primary-container focus:ring-primary-container/20 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 outline-hidden focus:ring-2"
        />
        <button
          type="submit"
          className="bg-primary-container font-label-md text-label-md text-on-primary hover:bg-primary focus-visible:ring-primary-container inline-flex h-11 shrink-0 items-center gap-2 rounded-lg px-5 shadow-xs transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
        >
          <Icon name="search" size={20} />
          {c.button}
        </button>
      </form>
      {c.note ? (
        <p className="mt-3 text-sm text-[var(--text-muted)]">
          <InlineMarkdown text={c.note} linkClassName="text-brand-700 hover:underline" />
        </p>
      ) : null}
    </>
  );
}

function StepsSection({ c }: { c: Content['steps'] }) {
  return (
    <>
      <h2 className="font-headline-md text-headline-md mt-16">{c.heading}</h2>
      <ol className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {c.items.map((s, i) => (
          <li key={i} className="surface-card p-6">
            <span className="text-primary-container font-semibold">
              {c.step_label} {i + 1}
            </span>
            <h3 className="font-title-md text-title-md mt-1">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{s.body}</p>
          </li>
        ))}
      </ol>
    </>
  );
}

function CtaSection({ c }: { c: Content['cta'] }) {
  return (
    <div className="surface-card mt-16 flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center">
      <div className="max-w-2xl">
        <h2 className="font-headline-sm text-headline-sm">{c.heading}</h2>
        <p className="mt-2 text-[var(--text-muted)]">{c.text}</p>
      </div>
      {c.button.label && c.button.href ? (
        <Button href={c.button.href}>{c.button.label}</Button>
      ) : null}
    </div>
  );
}
