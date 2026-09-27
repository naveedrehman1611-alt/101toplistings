import type { Metadata } from 'next';
import Link from 'next/link';
import { getSettings, settingText } from '@/lib/queries';
import { Breadcrumbs } from '@/components/ui';
import { seoMetadata } from '@/lib/seo';

export const revalidate = 3600;
export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata('/privacy', {
    title: 'Privacy Policy',
    description: 'What we collect, why, and how to have it removed.',
    openGraph: {
      title: 'Privacy Policy',
      description: 'What we collect, why, and how to have it removed.',
    },
    twitter: { card: 'summary_large_image', title: 'Privacy Policy' },
  });
}

const h2 = 'mt-10 text-2xl font-semibold';
const p = 'mt-4 leading-relaxed text-[var(--text-muted)]';

export default async function PrivacyPage() {
  const settings = await getSettings();
  const brand = settingText(settings, 'brand.name', 'RankYouSite');
  const email = settingText(settings, 'contact.email');
  return (
    <div className="container-page py-12">
      <Breadcrumbs trail={[{ label: 'Home', href: '/' }, { label: 'Privacy Policy' }]} />
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold sm:text-4xl">Privacy Policy</h1>
        <p className={p}>Last updated: 27 September 2026</p>

        <h2 className={h2}>What we collect</h2>
        <p className={p}>
          When you create an account we store your email address and a display name. If you sign in
          with Google, Google shares your name, email address and profile picture with us; we do not
          receive your Google password or access to anything else in your Google account.
        </p>
        <p className={p}>
          If you add a business, write a review or send a message through the contact form, we store
          what you submit. Business listings and reviews are public once approved.
        </p>

        <h2 className={h2}>Why we use it</h2>
        <p className={p}>
          To sign you in, show your listings and reviews under your name, moderate submissions, and
          reply to messages. We do not sell your data or use it for advertising.
        </p>

        <h2 className={h2}>Cookies</h2>
        <p className={p}>
          We use only the cookies needed to keep you signed in. There are no advertising or tracking
          cookies.
        </p>

        <h2 className={h2}>Who processes it</h2>
        <p className={p}>
          {brand} is hosted on Vercel and stores accounts and content with Supabase. Google handles
          Google sign-in. These providers process data only to run the service.
        </p>

        <h2 className={h2}>Your choices</h2>
        <p className={p}>
          You can edit your listings and reviews from your dashboard. To have your account and data
          deleted, or to ask what we hold about you,{' '}
          {email ? (
            <>
              email{' '}
              <a href={`mailto:${email}`} className="text-brand-700 hover:underline">
                {email}
              </a>
            </>
          ) : (
            <>
              use the{' '}
              <Link href="/contact" className="text-brand-700 hover:underline">
                contact page
              </Link>
            </>
          )}
          .
        </p>
      </div>
    </div>
  );
}
