import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getListing } from '@/lib/queries';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase-server';
import { submitClaim } from '@/lib/public-actions';
import { Breadcrumbs } from '@/components/ui';
import { getPageContent } from '@/lib/content/get';
import { fill, fillNodes } from '@/components/browse/fill';
import { signInHref } from '@/lib/legacy-redirects';

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
  const [user, { claim: t }] = await Promise.all([
    getCurrentUser(),
    getPageContent('listing_page'),
  ]);
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
          { label: t.crumb },
        ]}
      />
      <div className="max-w-xl">
        <h1 className="font-headline-lg text-headline-lg">
          {fill(t.heading, { name: listing.name })}
        </h1>
        {t.intro ? <p className="mt-3 text-[var(--text-muted)]">{t.intro}</p> : null}

        {sp.sent ? (
          <Box>
            <p role="status">{t.sent}</p>
            <BackLink slug={listing.slug} label={fill(t.back, { name: listing.name })} />
          </Box>
        ) : owns ? (
          <Box>
            <p>{t.owns}</p>
            {t.dashboard.label && t.dashboard.href ? (
              <Link
                href={t.dashboard.href}
                className="mt-2 inline-block font-medium hover:underline"
              >
                {t.dashboard.label}
              </Link>
            ) : null}
          </Box>
        ) : existing ? (
          <Box>
            <p>{existing.status === 'resolved' ? t.resolved : t.pending}</p>
            <BackLink slug={listing.slug} label={fill(t.back, { name: listing.name })} />
          </Box>
        ) : !user ? (
          <p className="mt-6 text-[var(--text-muted)]">
            {fillNodes(t.signin, {
              signin: (
                <Link href={signInHref(here)} className="text-brand-700 hover:underline">
                  {t.signin_link}
                </Link>
              ),
              register: (
                <Link
                  href={signInHref(here, '/register')}
                  className="text-brand-700 hover:underline"
                >
                  {t.register_link}
                </Link>
              ),
            })}
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
              <span className="font-medium">{t.role}</span>
              <select name="role" required defaultValue="" className={inputCls}>
                <option value="" disabled>
                  {t.role_placeholder}
                </option>
                {t.roles
                  .filter((r) => r.label)
                  .map((r, i) => (
                    <option key={i}>{r.label}</option>
                  ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="font-medium">{t.phone}</span>
              <input
                name="phone"
                type="tel"
                required
                maxLength={40}
                autoComplete="tel"
                className={inputCls}
              />
              <span className="mt-1 block text-xs text-[var(--text-muted)]">{t.phone_hint}</span>
            </label>
            <label className="block text-sm">
              <span className="font-medium">{t.proof}</span>
              <input
                name="evidence_url"
                type="url"
                maxLength={500}
                placeholder="https://"
                className={inputCls}
              />
              <span className="mt-1 block text-xs text-[var(--text-muted)]">{t.proof_hint}</span>
            </label>
            <label className="block text-sm">
              <span className="font-medium">{t.message}</span>
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
              {t.submit}
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

function BackLink({ slug, label }: { slug: string; label: string }) {
  return (
    <Link href={`/listing/${slug}`} className="mt-2 inline-block font-medium hover:underline">
      {label}
    </Link>
  );
}
