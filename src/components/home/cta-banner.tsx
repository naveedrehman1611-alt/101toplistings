import Link from 'next/link';
import { Icon } from '@/components/icon';

/** Mid-page "add your business" banner (Stitch design). */
export function CtaBanner({ brand }: { brand: string }) {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-12">
      <div className="relative flex flex-col items-center justify-between gap-8 overflow-hidden rounded-3xl bg-linear-to-r from-[#071328] via-[#0b1c30] to-[#047857] p-10 text-white shadow-xl sm:p-14 md:flex-row">
        <div className="relative z-10 max-w-2xl">
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-white">
            Get Your Business in Front of Thousands
          </h2>
          <p className="font-body-lg text-body-lg mt-2 text-white/90">
            Create a free profile on {brand} and reach customers worldwide who are already searching
            for businesses like yours.
          </p>
        </div>
        <div className="relative z-10 shrink-0">
          {/* White outline: a primary-coloured ring would vanish against the green end of the gradient. */}
          <Link
            href="/add-business"
            className="bg-surface-card font-title-md text-title-md text-on-background hover:bg-surface-bright inline-flex items-center gap-2 rounded-xl px-8 py-4 shadow-lg transition-all hover:shadow-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            <Icon name="rocket_launch" size={22} className="text-primary-container" />
            <span>Add Your Business — It&apos;s Free</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
