import Link from 'next/link';
import { Icon } from '@/components/icon';
import type { SectionValues } from '@/lib/content/schema';
import type { HOME_PAGE } from '@/lib/content/pages/home';

export type CtaBannerContent = SectionValues<(typeof HOME_PAGE)['sections']['cta_banner']>;

/** Mid-page "add your business" banner (Stitch design). */
export function CtaBanner({ content: c }: { content: CtaBannerContent }) {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-12">
      <div className="bg-hero-navy relative flex flex-col items-center justify-between gap-8 overflow-hidden rounded-3xl p-10 text-white shadow-xl sm:p-14 md:flex-row">
        <div className="relative z-10 max-w-2xl">
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-white">
            {c.heading}
          </h2>
          <p className="font-body-lg text-body-lg mt-2 text-white/90">{c.body}</p>
        </div>
        {c.button.label && c.button.href ? (
          <div className="relative z-10 shrink-0">
            {/* White outline: a primary-coloured ring would not show on the navy band. */}
            <Link
              href={c.button.href}
              className="bg-surface-card font-title-md text-title-md text-on-background hover:bg-surface-bright inline-flex items-center gap-2 rounded-xl px-8 py-4 shadow-lg transition-all hover:shadow-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              <Icon name="rocket_launch" size={22} className="text-primary-container" />
              <span>{c.button.label}</span>
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
