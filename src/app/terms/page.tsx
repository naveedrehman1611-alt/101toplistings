import type { Metadata } from 'next';
import { getSettings, settingText } from '@/lib/queries';
import { Breadcrumbs } from '@/components/ui';
import { seoMetadata } from '@/lib/seo';

export const revalidate = 3600;
export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata('/terms', {
    title: 'Terms of Service',
    description: 'The rules for using this directory.',
    openGraph: { title: 'Terms of Service', description: 'The rules for using this directory.' },
    twitter: { card: 'summary_large_image', title: 'Terms of Service' },
  });
}

const h2 = 'mt-10 text-2xl font-semibold';
const p = 'mt-4 leading-relaxed text-[var(--text-muted)]';

export default async function TermsPage() {
  const settings = await getSettings();
  const brand = settingText(settings, 'brand.name', 'RankYouSite');
  return (
    <div className="container-page py-12">
      <Breadcrumbs trail={[{ label: 'Home', href: '/' }, { label: 'Terms of Service' }]} />
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold sm:text-4xl">Terms of Service</h1>
        <p className={p}>Last updated: 27 September 2026</p>

        <h2 className={h2}>Using {brand}</h2>
        <p className={p}>
          {brand} is a directory of local businesses. By using the site or creating an account you
          agree to these terms. If you do not agree, please do not use the site.
        </p>

        <h2 className={h2}>Your account</h2>
        <p className={p}>
          Keep your sign-in details to yourself; you are responsible for what is done with your
          account. We may suspend accounts that break these terms.
        </p>

        <h2 className={h2}>Listings and reviews</h2>
        <p className={p}>
          Only add a business you own or are authorised to represent, and keep its details accurate.
          Reviews must reflect a genuine experience. Do not post anything unlawful, misleading,
          abusive or that infringes someone else&apos;s rights. Every submission is reviewed, and we
          may edit, decline or remove content at our discretion.
        </p>
        <p className={p}>
          You keep ownership of what you submit, and give us permission to display it on the site.
        </p>

        <h2 className={h2}>No guarantees</h2>
        <p className={p}>
          Listing information comes largely from business owners. We try to keep it accurate but do
          not guarantee it, and we are not responsible for dealings between you and any business
          listed here. The site is provided as is.
        </p>

        <h2 className={h2}>Changes</h2>
        <p className={p}>
          We may update these terms; the date above shows the latest version. Continuing to use the
          site after a change means you accept it.
        </p>
      </div>
    </div>
  );
}
