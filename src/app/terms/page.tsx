import type { Metadata } from 'next';
import { getPageContent } from '@/lib/content/get';
import { paragraphs } from '@/lib/content/schema';
import { LegalPage } from '@/components/legal-page';
import { seoMetadata } from '@/lib/seo';

export const revalidate = 3600;

const DESCRIPTION = 'The rules for using the directory, listing a business and posting reviews.';

export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata('/terms', {
    title: 'Terms of use',
    description: DESCRIPTION,
    openGraph: { title: 'Terms of use', description: DESCRIPTION },
    twitter: { card: 'summary_large_image', title: 'Terms of use' },
  });
}

export default async function TermsPage() {
  const { header, terms } = await getPageContent('terms');

  return (
    <LegalPage
      path="/terms"
      eyebrow={header.eyebrow}
      title={header.title}
      updated={header.updated}
      intro={header.intro}
      sections={terms.clauses.map((clause) => ({
        heading: clause.heading,
        body: paragraphs(clause.body),
      }))}
    />
  );
}
