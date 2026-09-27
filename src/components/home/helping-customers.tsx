import Link from 'next/link';
import { Icon } from '@/components/icon';

/** Consumer guidance section: how to use listings and report wrong details (Stitch design). */
export function HelpingCustomers({ brand }: { brand: string }) {
  return (
    <section className="bg-surface-container-low w-full px-6 py-12 lg:px-12">
      <div className="bg-surface-card mx-auto max-w-4xl rounded-3xl p-8 text-left shadow-xs sm:p-12">
        <div className="bg-tertiary-fixed font-label-sm text-label-sm text-on-tertiary-fixed mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1">
          <Icon name="verified" size={16} />
          <span>Consumer Protection & Accuracy</span>
        </div>
        <h2 className="font-headline-lg text-headline-lg-mobile text-on-surface md:text-headline-lg">
          Helping Customers Make Better Local Choices
        </h2>
        <p className="font-title-md text-title-md text-secondary mt-2">
          Use each listing to compare your options, then confirm the details that matter before you
          visit or book.
        </p>
        <div className="font-body-md text-body-md text-on-surface-variant mt-6 space-y-4">
          <p>
            Every profile on {brand} brings together the details people usually look for across
            several websites: what a business does, where it is, when it is open and how to reach
            it. Business owners provide and update this information, so it is always worth checking
            that it is current.
          </p>
          <p>
            For medical, financial, legal and other important services, confirm opening hours,
            prices, qualifications or licences, availability and service terms with the business
            directly before you visit, book or pay.
          </p>
          <p>
            If you notice a phone number, address, opening time or any other detail that is wrong or
            out of date, let us know through our contact page so we can review and correct the
            listing.
          </p>
        </div>
        <div className="bg-surface-bg mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl p-4 pt-6">
          <div className="font-body-sm text-body-sm text-on-surface flex items-center gap-2">
            <Icon name="report" size={20} className="text-secondary" />
            <span>Spotted an out-of-date number or address?</span>
          </div>
          <Link
            href="/contact"
            className="font-label-md text-label-md text-primary-container hover:text-primary focus-visible:ring-primary-container inline-flex items-center gap-1.5 rounded-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
          >
            <span>Report incorrect information</span>
            <Icon name="arrow_forward" size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
