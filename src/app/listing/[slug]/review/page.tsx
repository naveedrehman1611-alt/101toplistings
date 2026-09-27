import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getListing } from '@/lib/queries';
import { getCurrentUser } from '@/lib/auth';
import { submitReview } from '@/lib/public-actions';
import { Breadcrumbs } from '@/components/ui';

// Separate from the listing page so that page can stay statically cached; this
// one depends on who is signed in.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Write a review',
  robots: { index: false, follow: false },
};

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const listing = await getListing(slug);
  if (!listing) notFound();
  const user = await getCurrentUser();
  const here = `/listing/${listing.slug}/review`;

  return (
    <div className="container-page py-12">
      <Breadcrumbs
        trail={[
          { label: 'Home', href: '/' },
          { label: listing.name, href: `/listing/${listing.slug}` },
          { label: 'Write a review' },
        ]}
      />
      <div className="max-w-xl">
        <h1 className="text-3xl font-bold">Review {listing.name}</h1>

        {sp.sent ? (
          <div className="border-brand-500/40 bg-brand-50 text-brand-800 mt-6 rounded-lg border px-4 py-3 text-sm">
            <p role="status">
              Thanks — your review was received. It will appear once our team has checked it.
            </p>
            <Link
              href={`/listing/${listing.slug}`}
              className="mt-2 inline-block font-medium hover:underline"
            >
              ← Back to {listing.name}
            </Link>
          </div>
        ) : !user ? (
          <p className="mt-6 text-[var(--text-muted)]">
            Please{' '}
            <Link
              href={`/login?next=${encodeURIComponent(here)}`}
              className="text-brand-700 hover:underline"
            >
              sign in
            </Link>{' '}
            or{' '}
            <Link
              href={`/register?next=${encodeURIComponent(here)}`}
              className="text-brand-700 hover:underline"
            >
              create an account
            </Link>{' '}
            to write a review. One review per person, per business.
          </p>
        ) : (
          <form action={submitReview} className="mt-6 space-y-5">
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
            <fieldset>
              <legend className="text-sm font-medium">Your rating</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {[5, 4, 3, 2, 1].map((n) => (
                  <label
                    key={n}
                    className="has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
                  >
                    <input type="radio" name="rating" value={n} required className="size-4" />
                    <span aria-hidden className="text-accent-500">
                      {'★'.repeat(n)}
                    </span>
                    <span className="sr-only">{n} stars</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="block text-sm">
              <span className="font-medium">Title (optional)</span>
              <input
                name="title"
                maxLength={120}
                className="focus:border-brand-500 mt-1 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 outline-none"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Your review</span>
              <textarea
                name="body"
                required
                minLength={10}
                maxLength={3000}
                rows={6}
                className="focus:border-brand-500 mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-none"
              />
            </label>
            <button
              type="submit"
              className="bg-brand-700 hover:bg-brand-800 h-11 rounded-lg px-6 font-medium text-white"
            >
              Submit review
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
