import { Icon, type IconName } from '@/components/icon';
import type { DirectoryStats } from '@/lib/queries';
import type { SectionValues } from '@/lib/content/schema';
import type { HOME_PAGE } from '@/lib/content/pages/home';

export type StoryContent = SectionValues<(typeof HOME_PAGE)['sections']['story']>;

/** Highlight icons by position, cycled when the admin adds more cards. */
const HIGHLIGHT_ICONS: IconName[] = ['travel_explore', 'verified', 'storefront'];

export function Story({ content: c, stats }: { content: StoryContent; stats: DirectoryStats }) {
  // Live counts only; a figure that failed to load, or is zero, is left out.
  const figures = [
    { key: 'listings', label: c.listings_label, value: stats.listings },
    { key: 'cities', label: c.cities_label, value: stats.cities },
    { key: 'verified', label: c.verified_label, value: stats.verified },
    { key: 'categories', label: c.categories_label, value: stats.categories },
  ].filter(
    (f): f is { key: string; label: string; value: number } => f.value !== null && f.value > 0,
  );

  return (
    <section className="bg-surface-container-low w-full px-6 py-12 lg:px-12">
      <div className="bg-surface-card mx-auto max-w-5xl rounded-3xl p-6 shadow-lg sm:p-10">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            {c.badge ? (
              <div className="bg-secondary-container font-label-sm text-label-sm text-on-secondary-fixed mb-3 inline-flex items-center gap-2 rounded-md px-3 py-1">
                <Icon name="hub" size={16} className="text-primary" />
                <span>{c.badge}</span>
              </div>
            ) : null}
            <h2 className="font-headline-lg text-headline-lg-mobile text-on-surface md:text-headline-lg tracking-tight">
              {c.heading}
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-2xl">
              {c.intro}
            </p>
          </div>
        </div>

        {/* 3-column compact highlights grid */}
        {c.highlights.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-3">
            {c.highlights.map((h, i) => (
              <div
                key={i}
                className="border-border-subtle bg-surface-bg flex items-start gap-3.5 rounded-xl border p-4"
              >
                <div className="bg-surface-container text-primary-container flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                  <Icon name={HIGHLIGHT_ICONS[i % HIGHLIGHT_ICONS.length]} size={20} />
                </div>
                <div>
                  <h3 className="font-title-md text-title-md text-on-surface">{h.title}</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-snug">
                    {h.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Compact stats ticker */}
        {figures.length > 0 ? (
          <dl className="border-border-subtle mt-6 grid grid-cols-2 gap-4 border-t pt-6 text-center md:grid-cols-4 md:text-left">
            {figures.map((f) => (
              <div key={f.key} className="flex flex-col-reverse">
                <dt className="font-body-sm text-body-sm text-secondary">{f.label}</dt>
                <dd className="font-headline-md text-headline-md text-on-surface block">
                  {f.value.toLocaleString('en-US')}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </section>
  );
}
