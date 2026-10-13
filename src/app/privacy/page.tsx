import type { Metadata } from 'next';
import { getSettings, settingText } from '@/lib/queries';
import { getPageContent } from '@/lib/content/get';
import { paragraphs } from '@/lib/content/schema';
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
  const [content, settings] = await Promise.all([getPageContent('privacy'), getSettings()]);
  const email = settingText(settings, 'contact.email');
  const reach = email ? `email ${email} or use the contact page` : 'use the contact page';
  const { header, policy } = content;

  return (
    <LegalPage
      path="/privacy"
      eyebrow={header.eyebrow}
      title={header.title}
      updated={header.updated}
      intro={header.intro}
      sections={policy.clauses.map((clause) => ({
        heading: clause.heading,
        body: paragraphs(clause.body.replaceAll('{contact}', reach)),
      }))}
    />
  );
}
