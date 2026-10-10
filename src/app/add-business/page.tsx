import type { Metadata } from 'next';
import { getSettings, settingText } from '@/lib/queries';
import { Button } from '@/components/ui';
import { Icon, type IconName } from '@/components/icon';
import { JsonLd, breadcrumbSchema } from '@/components/json-ld';
import { PageHero } from '@/components/page-hero';
import { seoMetadata } from '@/lib/seo';

export const revalidate = 3600;

const TITLE = 'Add Your Business Online';
const DESCRIPTION =
  'Create a free business listing and help customers discover your company, services, location, and website. Every listing is reviewed before it goes live.';

export async function generateMetadata(): Promise<Metadata> {
  return seoMetadata('/add-business', {
    title: TITLE,
    description: DESCRIPTION,
    openGraph: { title: TITLE, description: DESCRIPTION },
    twitter: { card: 'summary_large_image', title: TITLE },
  });
}

const WHY: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'travel_explore',
    title: 'Get found by customers',
    body: 'People browse the directory by category and by city. A listing puts your business in front of them with the details they need to choose.',
  },
  {
    icon: 'language',
    title: 'A page that points to your website',
    body: 'Your listing is its own page with your website, contact details and services, so searchers can reach you directly.',
  },
  {
    icon: 'sell',
    title: 'Free to list',
    body: 'Adding a business listing costs nothing. Optional paid promotion exists, but a standard listing is free.',
  },
];

const GOOD_LISTING: string[] = [
  'A unique description written for customers, not copied from your website',
  'Your business name, address and phone number, exactly as they appear elsewhere',
  'Your website and a contact email',
  'The category that best matches what you do',
  'Your city and location',
  'The services you offer',
  'Clear photos, such as a logo and your premises or work',
  'Opening hours',
];

export default async function AddBusinessPage() {
  const settings = await getSettings();
  const brand = settingText(settings, 'brand.name', 'RankYouSite');
  const trail = [{ label: 'Home', href: '/' }, { label: 'Add your business' }];

  return (
    <>
      <JsonLd data={breadcrumbSchema(trail, '/add-business')} />
      <PageHero
        trail={trail}
        eyebrow="Free business listing"
        heading={
          <>
            Add your business <span className="text-hero-green-light">online</span>
          </>
        }
        subheading={
          <>
            Adding your business to {brand} creates a free business listing: a page with your
            description, services, location, contact details and website that customers can find by
            category or city. Want to list your business online? You will need an account, and the
            form takes a few minutes.
          </>
        }
      >
        <div className="flex flex-wrap gap-3">
          <Button href="/dashboard/listings/new">
            <Icon name="add_business" size={20} />
            Create listing
          </Button>
          <Button href="/claim-business" variant="ghost">
            Claim an existing listing
          </Button>
        </div>
      </PageHero>
      <div className="container-page py-10 md:py-12">
        <h2 className="font-headline-md text-headline-md">Why add a business listing</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {WHY.map((w) => (
            <div key={w.title} className="surface-card flex flex-col p-6">
              <div className="bg-surface-container-low text-primary-container mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                <Icon name={w.icon} size={26} />
              </div>
              <h3 className="font-title-md text-title-md">{w.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{w.body}</p>
            </div>
          ))}
        </div>

        <h2 className="font-headline-md text-headline-md mt-16">What a good listing contains</h2>
        <p className="mt-3 max-w-3xl text-[var(--text-muted)]">
          The more complete your submit business listing form is, the easier it is for customers to
          trust and contact you.
        </p>
        <ul className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
          {GOOD_LISTING.map((item) => (
            <li key={item} className="surface-card flex items-start gap-3 p-4 text-sm">
              <Icon
                name="check_circle"
                size={20}
                className="text-primary-container mt-0.5 shrink-0"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <h2 className="font-headline-md text-headline-md mt-16">How review works</h2>
        <p className="mt-3 max-w-3xl leading-relaxed text-[var(--text-muted)]">
          Every listing is reviewed before it goes live. You can edit your listing afterwards, but
          its published status is decided by our team, not by the owner. If the business already
          appears in the directory, claim it instead of adding a duplicate.
        </p>
      </div>
    </>
  );
}
