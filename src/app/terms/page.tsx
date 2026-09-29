import type { Metadata } from 'next';
import { getSettings, settingText } from '@/lib/queries';
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
  const settings = await getSettings();
  const brand = settingText(settings, 'brand.name', 'RankYouSite');

  return (
    <LegalPage
      path="/terms"
      title="Terms of use"
      updated="29 September 2026"
      intro={`By using ${brand} you agree to these terms. If you do not agree, please do not use the site.`}
      sections={[
        {
          heading: 'Using the directory',
          body: [
            `${brand} lists local businesses to help people find and contact them. Details are provided by business owners and checked before publication, but they can change, so confirm prices, hours and availability with the business before you rely on them.`,
            `We are not a party to any agreement between you and a business listed here, and are not responsible for the goods or services they provide.`,
          ],
        },
        {
          heading: 'Listing a business',
          body: [
            'Only list a business you own or are authorised to represent, and keep its details accurate. Every listing is reviewed before it is published, and we may edit, decline or remove a listing that is inaccurate, misleading, duplicated or breaks the law.',
          ],
        },
        {
          heading: 'Reviews',
          body: [
            'Reviews must describe a real experience. Do not post fake, paid-for, abusive or off-topic reviews, or reviews of your own business or a competitor. We may remove reviews that break these rules.',
          ],
        },
        {
          heading: 'Your content',
          body: [
            'You keep ownership of what you submit. By submitting it, you allow us to display it on the site and use it to promote the directory.',
          ],
        },
        {
          heading: 'Accounts',
          body: [
            'Keep your login details secure. We may suspend accounts used to spam, impersonate others or misuse the site.',
          ],
        },
        {
          heading: 'Changes',
          body: [
            'We may update these terms. The new version will be posted here with a new date at the top, and continuing to use the site means you accept it.',
          ],
        },
      ]}
    />
  );
}
