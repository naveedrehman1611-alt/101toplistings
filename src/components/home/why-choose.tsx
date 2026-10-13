import { Icon } from '@/components/icon';
import type { SectionValues } from '@/lib/content/schema';
import type { HOME_PAGE } from '@/lib/content/pages/home';

export type WhyChooseContent = SectionValues<(typeof HOME_PAGE)['sections']['why_choose']>;

/** "Why choose" section of the home page (Stitch design). */
export function WhyChoose({ content: c }: { content: WhyChooseContent }) {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-12">
      <div className="mx-auto mb-16 max-w-3xl text-center">
        <span className="font-label-sm text-label-sm text-primary-container font-semibold uppercase">
          {c.eyebrow}
        </span>
        <h2 className="font-headline-lg text-headline-lg-mobile text-on-surface md:text-headline-lg mt-2">
          {c.heading}
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-3">{c.intro}</p>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {c.cards.map((feature, i) => (
          <div
            key={i}
            className="bg-surface-card flex flex-col items-center rounded-2xl p-8 text-center shadow-xs transition-shadow duration-300 hover:shadow-md"
          >
            <div className="bg-surface-container text-primary-container mb-6 flex h-16 w-16 items-center justify-center rounded-2xl">
              <Icon name={feature.icon} size={32} />
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">{feature.title}</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mt-3">{feature.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
