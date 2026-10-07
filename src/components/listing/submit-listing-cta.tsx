import Link from 'next/link';
import { Icon } from '@/components/icon';

/** "Submit Your Listing Today!" band at the foot of a listing page (Stitch banner style). */
export function SubmitListingCta({ brand }: { brand: string }) {
  return (
    <section className="relative mt-16 overflow-hidden rounded-3xl bg-linear-to-r from-[#071328] via-[#0b1c30] to-[#047857] p-10 text-white shadow-xl sm:p-14">
      <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-white">
        Submit Your Listing Today!
      </h2>
      <p className="font-body-lg text-body-lg mt-2 max-w-2xl text-white/90">
        Add your business to {brand} and get found by customers searching in your city, wherever you
        are in the world.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        {/* Same label and icon as the header's call to action. */}
        <Link
          href="/add-business"
          className="bg-surface-card font-title-md text-title-md text-on-background hover:bg-surface-bright inline-flex items-center gap-2 rounded-xl px-6 py-3 shadow-lg transition-all hover:shadow-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          <Icon name="add_circle" size={20} className="text-primary-container" />
          Add Listing
        </Link>
        <Link
          href="/business-directory"
          className="font-title-md text-title-md inline-flex items-center gap-2 rounded-xl border border-white/40 px-6 py-3 text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          Browse listings
          <Icon name="arrow_forward" size={20} />
        </Link>
      </div>
    </section>
  );
}
