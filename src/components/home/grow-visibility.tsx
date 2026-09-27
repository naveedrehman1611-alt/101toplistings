import Link from 'next/link';
import { Icon } from '@/components/icon';

const PROFILE_CHECKLIST: string[] = [
  'Accurate business name and category',
  'Original service description',
  'Current phone number and address',
  'Opening and closing hours',
  'Clear business or service images',
  'Website and social media details',
  'Service areas and available facilities',
];

/** "Grow your local visibility" section for business owners (Stitch design). */
export function GrowVisibility({ brand }: { brand: string }) {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-12">
      <div className="bg-surface-card rounded-3xl p-8 shadow-md sm:p-14">
        <div className="mb-12 max-w-3xl">
          <span className="font-label-sm text-label-sm text-primary-container font-semibold uppercase">
            Merchant & Provider Growth
          </span>
          <h2 className="font-headline-lg text-headline-lg-mobile text-on-surface md:text-headline-lg mt-2">
            Grow your local visibility with a business listing
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            Customers search online before choosing a local service provider. A complete profile
            helps them find you first.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="bg-surface-bg flex flex-col justify-between rounded-2xl p-8">
            <div>
              <div className="text-primary-container mb-4 flex items-center gap-2">
                <Icon name="visibility" size={24} />
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Why a Complete Profile Matters
                </h3>
              </div>
              <div className="font-body-md text-body-md text-on-surface-variant space-y-4">
                <p>
                  Customers increasingly search online before choosing a local service provider. A
                  complete business profile helps potential customers understand what your business
                  offers, where it operates, and how they can contact you.
                </p>
                <p>
                  Business owners can use {brand} to present their company name, service category,
                  business description, phone number, address, operating hours, images, website, and
                  other useful details. Accurate and complete information can make a listing more
                  helpful to customers and improve confidence before they make contact.
                </p>
              </div>
            </div>
            {/* The design's "3.4x more customer calls" figure has no source, so this line
                states the benefit without a statistic. */}
            <div className="bg-surface-card mt-8 flex items-center gap-3 rounded-xl p-4 pt-6">
              <Icon name="verified" size={24} className="text-verified-teal" />
              <span className="font-body-sm text-body-sm text-on-surface">
                Complete, accurate profiles make it easier for customers to call you directly.
              </span>
            </div>
          </div>
          <div className="bg-surface-container flex flex-col justify-between rounded-2xl p-8">
            <div>
              <div className="text-primary-container mb-4 flex items-center gap-2">
                <Icon name="checklist" size={24} />
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  What Should a Complete Business Profile Include?
                </h3>
              </div>
              <ul className="font-body-md text-body-md text-on-surface space-y-3.5">
                {PROFILE_CHECKLIST.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Icon name="check_circle" size={20} className="text-primary-container mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8 pt-4">
              <Link
                href="/dashboard/listings/new"
                className="bg-tertiary-container font-title-md text-title-md text-on-tertiary hover:bg-tertiary focus-visible:ring-primary-container inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 shadow-md transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
              >
                <Icon name="add_business" size={20} />
                <span>Add Your Business — It&apos;s Free</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
