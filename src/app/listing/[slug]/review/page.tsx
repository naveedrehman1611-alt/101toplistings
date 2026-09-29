import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getListing } from '@/lib/queries';
import { getCurrentUser } from '@/lib/auth';
import { Breadcrumbs } from '@/components/ui';
import { ReviewForm } from '@/components/listing/review-form';

// Separate from the listing page so that page can stay statically cached; this
// one depends on who is signed in.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Write a review',
  robots: { index: false, follow: false },
};

export default async function ReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
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
        <h1 className="font-headline-lg text-headline-lg">Review {listing.name}</h1>

        {!user ? (
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
          <div className="mt-6">
            <ReviewForm listingId={listing.id} slug={listing.slug} />
          </div>
        )}
      </div>
    </div>
  );
}
