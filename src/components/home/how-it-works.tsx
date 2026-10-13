import { Icon } from '@/components/icon';
import type { SectionValues } from '@/lib/content/schema';
import type { HOME_PAGE } from '@/lib/content/pages/home';

export type HowItWorksContent = SectionValues<(typeof HOME_PAGE)['sections']['how_it_works']>;

/** "How does it work?" step section of the home page (Stitch design). */
export function HowItWorks({ content: c }: { content: HowItWorksContent }) {
  return (
    <section className="bg-surface-card w-full px-6 py-20 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="font-label-sm text-label-sm text-primary-container font-semibold uppercase">
            {c.eyebrow}
          </span>
          <h2 className="font-headline-lg text-headline-lg-mobile text-on-surface md:text-headline-lg mt-2">
            {c.heading}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-3">{c.intro}</p>
        </div>
        {/* Rendered in order; the step number is the position in the list. */}
        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
          {c.steps.map((step, i) => (
            <div key={i} className="bg-surface-bg relative flex flex-col rounded-2xl p-8 shadow-xs">
              <div className="mb-6 flex items-center justify-between">
                <span className="bg-primary-container font-headline-sm text-headline-sm text-on-primary flex h-12 w-12 items-center justify-center rounded-xl">
                  {i + 1}
                </span>
                <Icon name={step.icon} size={32} className="text-primary" />
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">{step.title}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mt-3">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
