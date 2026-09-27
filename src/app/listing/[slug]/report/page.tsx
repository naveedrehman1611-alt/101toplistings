import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getListing } from '@/lib/queries';
import { submitReport } from '@/lib/public-actions';
import { REPORT_REASONS } from '@/lib/report-reasons';
import { Breadcrumbs } from '@/components/ui';

// Reads ?sent / ?error, so it renders per request; the listing page stays cached.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Report a problem',
  robots: { index: false, follow: false },
};

export default async function ReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const listing = await getListing(slug);
  if (!listing) notFound();

  return (
    <div className="container-page py-12">
      <Breadcrumbs
        trail={[
          { label: 'Home', href: '/' },
          { label: listing.name, href: `/listing/${listing.slug}` },
          { label: 'Report a problem' },
        ]}
      />
      <div className="max-w-xl">
        <h1 className="text-3xl font-bold">Report a problem</h1>
        <p className="mt-3 text-[var(--text-muted)]">
          Something wrong with <span className="font-medium">{listing.name}</span>? Let us know and
          our team will look into it.
        </p>

        {sp.sent ? (
          <div className="border-brand-500/40 bg-brand-50 text-brand-800 mt-6 rounded-lg border px-4 py-3 text-sm">
            <p role="status">Thanks — we&apos;ve received your report and will check it.</p>
            <Link
              href={`/listing/${listing.slug}`}
              className="mt-2 inline-block font-medium hover:underline"
            >
              ← Back to {listing.name}
            </Link>
          </div>
        ) : (
          <form action={submitReport} className="mt-6 space-y-5">
            {sp.error ? (
              <p
                role="alert"
                className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
              >
                {sp.error}
              </p>
            ) : null}
            <input type="hidden" name="listing_id" value={listing.id} />
            <input type="hidden" name="slug" value={listing.slug} />
            <input type="hidden" name="listing_name" value={listing.name} />
            <fieldset>
              <legend className="text-sm font-medium">What&apos;s wrong?</legend>
              <div className="mt-2 space-y-2">
                {Object.entries(REPORT_REASONS).map(([value, label]) => (
                  <label
                    key={value}
                    className="has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
                  >
                    <input type="radio" name="reason" value={value} required className="size-4" />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="block text-sm">
              <span className="font-medium">Details</span>
              <textarea
                name="details"
                maxLength={3000}
                rows={4}
                placeholder="For example, the correct phone number or address."
                className="focus:border-brand-500 mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-none"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Your email (optional)</span>
              <input
                name="email"
                type="email"
                maxLength={200}
                autoComplete="email"
                className="focus:border-brand-500 mt-1 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 outline-none"
              />
              <span className="mt-1 block text-xs text-[var(--text-muted)]">
                Only if you&apos;d like us to follow up with you.
              </span>
            </label>
            {/* Honeypot: hidden from people, filled in by bots. */}
            <div aria-hidden className="hidden">
              <label>
                Website
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            <button
              type="submit"
              className="bg-brand-700 hover:bg-brand-800 h-11 rounded-lg px-6 font-medium text-white"
            >
              Send report
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
