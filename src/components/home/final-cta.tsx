import Link from 'next/link';
import { Icon } from '@/components/icon';
import type { SectionValues } from '@/lib/content/schema';
import type { HOME_PAGE } from '@/lib/content/pages/home';

export type FinalCtaContent = SectionValues<(typeof HOME_PAGE)['sections']['final_cta']>;

/** Full-width closing call to action above the footer (Stitch design). */
export function FinalCta({ content: c }: { content: FinalCtaContent }) {
  return (
    <section className="bg-hero-navy w-full px-6 py-20 text-center text-white lg:px-12">
      <div className="mx-auto flex max-w-4xl flex-col items-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
          <Icon name={c.icon} size={36} className="text-white" />
        </div>
        <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-white">
          {c.heading}
        </h2>
        <p className="font-body-lg text-body-lg mt-3 max-w-2xl text-white/90">{c.body}</p>
        {c.button.label && c.button.href ? (
          <div className="mt-8">
            {/* White outline: a primary-coloured ring would not show on the navy band. */}
            <Link
              href={c.button.href}
              className="font-title-md text-title-md text-on-surface hover:bg-surface-container-lowest inline-flex items-center gap-2 rounded-xl bg-white px-9 py-4 shadow-xl transition-all focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              <Icon name={c.button_icon} size={20} className="text-primary" />
              <span>{c.button.label}</span>
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
