import Link from 'next/link';
import { Icon } from '@/components/icon';

/** Full-width closing call to action above the footer (Stitch design). */
export function FinalCta({ brand }: { brand: string }) {
  return (
    <section className="from-tertiary via-tertiary-container to-primary-container w-full bg-linear-to-r px-6 py-20 text-center text-white lg:px-12">
      <div className="mx-auto flex max-w-4xl flex-col items-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
          <Icon name="flag" size={36} className="text-white" />
        </div>
        <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-white">
          Submit Your Listing Today!
        </h2>
        <p className="font-body-lg text-body-lg text-surface-container-high/90 mt-3 max-w-2xl">
          List your business on {brand} for free and start reaching customers who are searching for
          services like yours.
        </p>
        <div className="mt-8">
          {/* White outline: a primary-coloured ring would not show on the blue-to-green gradient. */}
          <Link
            href="/dashboard/listings/new"
            className="font-title-md text-title-md text-on-surface hover:bg-surface-container-lowest inline-flex items-center gap-2 rounded-xl bg-white px-9 py-4 shadow-xl transition-all focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            <Icon name="add_circle" size={20} className="text-primary" />
            <span>Add Your Business — It&apos;s Free</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
