import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getListing } from '@/lib/queries';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase-server';
import { submitClaim } from '@/lib/public-actions';
import { Breadcrumbs } from '@/components/ui';

// Depends on who is signed in, so it is rendered per request like the review page.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Claim this business',
  robots: { index: false, follow: false },
};

const inputCls =
  'focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 mt-1 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 outline-hidden';

export default async function ClaimPage({
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
  const here = `/listing/${listing.slug}/claim`;

  // RLS lets a user read a listing row only if they own it (or are staff), and
  // only their own claims, so both checks are safe with the cookie client.
  let owns = false;
  let existing: { status: string } | null = null;
  if (user) {
    const supabase = await createClient();
    const [{ data: own }, { data: claim }] = await Promise.all([
      supabase
        .from('listings')
        .select('id')
        .eq('id', listing.id)
        .eq('owner_user_id', user.id)
        .maybeSingle(),
      supabase
        .from('claims')
        .select('status')
        .eq('listing_id', listing.id)
        .eq('claimant_id', user.id)
        .maybeSingle(),
    ]);
    owns = Boolean(own);
    existing = claim;
  }

  return (
    <div className="container-page py-12">
      <Breadcrumbs
        trail={[
          { label: 'Home', href: '/' },
          { label: listing.name, href: `/listing/${listing.slug}` },
          { label: 'Claim this business' },
        ]}
      />
      <div className="max-w-xl">
        <h1 className="font-headline-lg text-headline-lg">Claim {listing.name}</h1>
        <p className="mt-3 text-[var(--text-muted)]">
          Own or manage this business? Claim it to update its details, photos and opening hours and
          reply to reviews. It&apos;s free. We check every claim before handing over control.
        </p>

        {sp.sent ? (
          <Box>
            <p role="status">
              Thanks — your claim was received. We&apos;ll contact you to verify it, usually within
              a couple of days.
            </p>
            <BackLink slug={listing.slug} name={listing.name} />
          </Box>
        ) : owns ? (
          <Box>
            <p>You already manage this business.</p>
            <Link href="/dashboard" className="mt-2 inline-block font-medium hover:underline">
              Go to your dashboard →
            </Link>
          </Box>
        ) : existing ? (
          <Box>
            <p>
              {existing.status === 'resolved'
                ? 'We have reviewed your claim for this business. If you think we got it wrong, please contact us.'
                : 'You have already claimed this business. We will be in touch once we have checked it.'}
            </p>
            <BackLink slug={listing.slug} name={listing.name} />
          </Box>
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
            to claim this business. The account becomes the one that manages the listing.
          </p>
        ) : (
          <form action={submitClaim} className="mt-6 space-y-5">
            {sp.error ? (
              <p
                role="alert"
                className="border-error/30 bg-error-container/40 text-on-error-container rounded-lg border px-4 py-3 text-sm"
              >
                {sp.error}
              </p>
            ) : null}
            <input type="hidden" name="listing_id" value={listing.id} />
            <input type="hidden" name="slug" value={listing.slug} />
            <label className="block text-sm">
              <span className="font-medium">Your role at the business</span>
              <select name="role" required defaultValue="" className={inputCls}>
                <option value="" disabled>
                  Choose one
                </option>
                <option>Owner</option>
                <option>Manager</option>
                <option>Employee</option>
                <option>Marketing agency</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="font-medium">Phone number</span>
              <input
                name="phone"
                type="tel"
                required
                maxLength={40}
                autoComplete="tel"
                className={inputCls}
              />
              <span className="mt-1 block text-xs text-[var(--text-muted)]">
                Ideally the business number shown on the listing, so we can confirm quickly.
              </span>
            </label>
            <label className="block text-sm">
              <span className="font-medium">Link to proof (optional)</span>
              <input
                name="evidence_url"
                type="url"
                maxLength={500}
                placeholder="https://"
                className={inputCls}
              />
              <span className="mt-1 block text-xs text-[var(--text-muted)]">
                Your business website, Facebook page or Google profile that names you.
              </span>
            </label>
            <label className="block text-sm">
              <span className="font-medium">Anything else? (optional)</span>
              <textarea
                name="message"
                maxLength={2000}
                rows={4}
                className="focus:border-primary-container focus:ring-primary-container/20 mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-hidden focus:ring-2"
              />
            </label>
            <button
              type="submit"
              className="bg-primary-container font-label-md text-label-md text-on-primary hover:bg-primary focus-visible:ring-primary-container h-11 rounded-lg px-6 shadow-xs transition hover:shadow-[0_4px_12px_rgba(12,130,38,0.25)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
            >
              Submit claim
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Box({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-brand-500/40 bg-brand-50 text-brand-800 mt-6 rounded-lg border px-4 py-3 text-sm">
      {children}
    </div>
  );
}

function BackLink({ slug, name }: { slug: string; name: string }) {
  return (
    <Link href={`/listing/${slug}`} className="mt-2 inline-block font-medium hover:underline">
      ← Back to {name}
    </Link>
  );
}
