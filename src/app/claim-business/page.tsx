import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { Icon } from '@/components/icon';
import { JsonLd, breadcrumbSchema } from '@/components/json-ld';
import { PageHero } from '@/components/page-hero';
import { seoMetadata } from '@/lib/seo';

export const revalidate = 3600;

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

const STEPS: { title: string; body: string }[] = [
  {
    title: 'Find your business',
    body: 'Search for it by name below, or browse the business directory by category or city.',
  },
  {
    title: 'Open the listing',
    body: 'On the listing page, use the claim link ("Own this business? Claim it for free"). Listings that are already verified do not show it.',
  },
  {
    title: 'Sign in and submit your claim',
    body: 'Sign in or create an account, then tell us your role, a phone number we can reach you on, and optionally a link to proof such as your website or a business profile that names you.',
  },
  {
    title: 'We verify, then hand over control',
    body: 'Our team checks every claim before ownership is handed over, usually within a couple of days. Once approved, the account you used manages the listing.',
  },
];

export default function ClaimBusinessPage() {
  const trail = [{ label: 'Home', href: '/' }, { label: 'Claim your business' }];

  return (
    <>
      <JsonLd data={breadcrumbSchema(trail, '/claim-business')} />
      <PageHero
        trail={trail}
        eyebrow="Free ownership claim"
        heading={
          <>
            Claim your <span className="text-hero-green-light">business listing</span>
          </>
        }
        subheading="To claim a business listing means asking to take over management of a listing that already exists for your business. Once verified, you can update its details, photos and opening hours and reply to reviews. Claiming is free."
      />
      <div className="container-page py-10 md:py-12">
        <h2 className="font-headline-md text-headline-md">Find your business</h2>
        <form action="/search" method="get" role="search" className="mt-4 flex max-w-xl gap-3">
          <label htmlFor="claim-q" className="sr-only">
            Business name
          </label>
          <input
            id="claim-q"
            name="q"
            type="search"
            required
            maxLength={100}
            placeholder="Business name"
            className="focus:border-primary-container focus:ring-primary-container/20 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 outline-hidden focus:ring-2"
          />
          <button
            type="submit"
            className="bg-primary-container font-label-md text-label-md text-on-primary hover:bg-primary focus-visible:ring-primary-container inline-flex h-11 shrink-0 items-center gap-2 rounded-lg px-5 shadow-xs transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
          >
            <Icon name="search" size={20} />
            Claim Listing
          </button>
        </form>
        <p className="mt-3 text-sm text-[var(--text-muted)]">
          Or browse the{' '}
          <Link href="/business-directory" className="text-brand-700 hover:underline">
            business directory
          </Link>
          . Can&apos;t find it?{' '}
          <Link href="/add-business" className="text-brand-700 hover:underline">
            Add your business
          </Link>{' '}
          instead.
        </p>

        <h2 className="font-headline-md text-headline-md mt-16">How claiming works</h2>
        <ol className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="surface-card p-6">
              <span className="text-primary-container font-semibold">Step {i + 1}</span>
              <h3 className="font-title-md text-title-md mt-1">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{s.body}</p>
            </li>
          ))}
        </ol>

        <div className="surface-card mt-16 flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <h2 className="font-headline-sm text-headline-sm">Ready to take control?</h2>
            <p className="mt-2 text-[var(--text-muted)]">
              Search for your business to open its listing and start your claim.
            </p>
          </div>
          <Button href="/business-directory">Browse businesses</Button>
        </div>
      </div>
    </>
  );
}
