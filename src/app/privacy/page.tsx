import type { Metadata } from 'next';
import { getSettings, settingText } from '@/lib/queries';
import { LegalPage } from '@/components/legal-page';
import { seoMetadata } from '@/lib/seo';

export const revalidate = 3600;

const DESCRIPTION = 'What we collect, why we collect it, and how to have it corrected or removed.';

export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata('/privacy', {
    title: 'Privacy policy',
    description: DESCRIPTION,
    openGraph: { title: 'Privacy policy', description: DESCRIPTION },
    twitter: { card: 'summary_large_image', title: 'Privacy policy' },
  });
}

export default async function PrivacyPage() {
  const settings = await getSettings();
  const brand = settingText(settings, 'brand.name', 'RankYouSite');
  const email = settingText(settings, 'contact.email');
  const reach = email ? `email ${email} or use the contact page` : 'use the contact page';

  return (
    <LegalPage
      path="/privacy"
      title="Privacy policy"
      updated="29 September 2026"
      intro={`This policy explains what information ${brand} collects when you browse the directory, create an account, list a business or contact us, and what we do with it.`}
      sections={[
        {
          heading: 'What we collect',
          body: [
            'Account details: your email address and password when you register. Passwords are handled by our authentication provider and are never visible to us.',
            'Google sign-in: if you continue with Google, Google shares your name, email address and profile picture with us. We never receive your Google password or access to anything else in your Google account.',
            'Business listings: the details you submit for a business, such as its name, address, phone number, opening hours, photos and website. Once approved, these are shown publicly.',
            'Reviews, reports and claims: what you write, and the name you choose to show with a review.',
            'Messages: what you send through the contact form or newsletter sign-up, including your name and email address.',
          ],
        },
        {
          heading: 'How we use it',
          body: [
            'To run the directory: publishing listings and reviews, letting owners manage their own listings, and moderating submissions before they go live.',
            'To reply to your messages and, if you asked for it, send you updates. We do not sell your personal information.',
          ],
        },
        {
          heading: 'Cookies',
          body: [
            'We use cookies that are needed to keep you signed in. We do not use advertising cookies.',
          ],
        },
        {
          heading: 'Where it is stored',
          body: [
            'Data is stored with our hosting and database providers, who process it only to provide their service to us.',
          ],
        },
        {
          heading: 'Your choices',
          body: [
            `You can edit your listings from your dashboard at any time. To have your account, a listing or a review corrected or deleted, ${reach}.`,
          ],
        },
        {
          heading: 'Changes',
          body: [
            'If this policy changes, the new version will be posted here with a new date at the top.',
          ],
        },
      ]}
    />
  );
}
