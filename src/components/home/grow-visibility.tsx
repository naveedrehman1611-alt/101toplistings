import Link from 'next/link';
import { Icon } from '@/components/icon';
import type { SectionValues } from '@/lib/content/schema';
import { paragraphs } from '@/lib/content/schema';
import type { HOME_PAGE } from '@/lib/content/pages/home';

export type GrowVisibilityContent = SectionValues<
  (typeof HOME_PAGE)['sections']['grow_visibility']
>;

/** "Grow your local visibility" section for business owners (Stitch design). */
export function GrowVisibility({ content: c }: { content: GrowVisibilityContent }) {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-12">
      <div className="bg-surface-card rounded-3xl p-6 shadow-md sm:p-14">
        <div className="mb-12 max-w-3xl">
          <span className="font-label-sm text-label-sm text-primary-container font-semibold uppercase">
            {c.eyebrow}
          </span>
          <h2 className="font-headline-lg text-headline-lg-mobile text-on-surface md:text-headline-lg mt-2">
            {c.heading}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">{c.intro}</p>
        </div>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="bg-surface-bg flex flex-col justify-between rounded-2xl p-5 sm:p-8">
            <div>
              <div className="text-primary-container mb-4 flex items-center gap-2">
                <Icon name={c.why_icon} size={24} />
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  {c.why_heading}
                </h3>
              </div>
              <div className="font-body-md text-body-md text-on-surface-variant space-y-4">
                {paragraphs(c.why_body).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
            {/* The design's "3.4x more customer calls" figure has no source, so this line
                states the benefit without a statistic. */}
            {c.why_note ? (
              <div className="bg-surface-card mt-8 flex items-center gap-3 rounded-xl p-4 pt-6">
                <Icon name={c.why_note_icon} size={24} className="text-verified-teal" />
                <span className="font-body-sm text-body-sm text-on-surface">{c.why_note}</span>
              </div>
            ) : null}
          </div>
          <div className="bg-surface-container flex flex-col justify-between rounded-2xl p-5 sm:p-8">
            <div>
              <div className="text-primary-container mb-4 flex items-center gap-2">
                <Icon name={c.checklist_icon} size={24} />
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  {c.checklist_heading}
                </h3>
              </div>
              <ul className="font-body-md text-body-md text-on-surface space-y-3.5">
                {c.checklist.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Icon
                      name={c.checklist_bullet}
                      size={20}
                      className="text-primary-container mt-0.5"
                    />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            {c.button.label && c.button.href ? (
              <div className="mt-8 pt-4">
                <Link
                  href={c.button.href}
                  className="bg-primary-container font-title-md text-title-md text-on-primary hover:bg-primary focus-visible:ring-primary-container inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 shadow-md transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden sm:px-6"
                >
                  <Icon name={c.button_icon} size={20} />
                  <span className="text-center text-balance">{c.button.label}</span>
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
