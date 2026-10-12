import { Icon, type IconName } from '@/components/icon';
import type { DirectoryStats } from '@/lib/queries';

const HIGHLIGHTS: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'travel_explore',
    title: 'Discover & Compare',
    body: 'Pick a city and a category, then open any listing for its address, opening hours and reviews.',
  },
  {
    icon: 'verified',
    title: 'Verified Profiles',
    body: 'Verified badges mark businesses our team has checked, and anyone can report a listing that is wrong.',
  },
  {
    icon: 'storefront',
    title: 'Free Growth for Owners',
    body: 'Listing a business is free in every country we cover. Owners manage photos, hours and services from their dashboard.',
  },
];

export function Story({ stats }: { stats: DirectoryStats }) {
  // Live counts only; a figure that failed to load, or is zero, is left out.
  const figures = [
    { label: 'Listed Businesses', value: stats.listings },
    { label: 'Cities Covered', value: stats.cities },
    { label: 'Verified Businesses', value: stats.verified },
    { label: 'Business Categories', value: stats.categories },
  ].filter((f): f is { label: string; value: number } => f.value !== null && f.value > 0);

  return (
    <section className="bg-surface-container-low w-full px-6 py-12 lg:px-12">
      <div className="bg-surface-card mx-auto max-w-5xl rounded-3xl p-6 shadow-lg sm:p-10">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="bg-secondary-container font-label-sm text-label-sm text-on-secondary-fixed mb-3 inline-flex items-center gap-2 rounded-md px-3 py-1">
              <Icon name="hub" size={16} className="text-primary" />
              <span>Global Directory Network</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg-mobile text-on-surface md:text-headline-lg tracking-tight">
              Find Trusted Local Businesses Worldwide
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-2xl">
              Local businesses in Pakistan, the UK, the US, the UAE and Europe. Search for what you
              need where you are, then contact the business directly: we do not sit in between.
            </p>
          </div>
        </div>

        {/* 3-column compact highlights grid */}
        <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-3">
          {HIGHLIGHTS.map((h) => (
            <div
              key={h.title}
              className="border-border-subtle bg-surface-bg flex items-start gap-3.5 rounded-xl border p-4"
            >
              <div className="bg-surface-container text-primary-container flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                <Icon name={h.icon} size={20} />
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

        {/* Compact stats ticker */}
        {figures.length > 0 ? (
          <dl className="border-border-subtle mt-6 grid grid-cols-2 gap-4 border-t pt-6 text-center md:grid-cols-4 md:text-left">
            {figures.map((f) => (
              <div key={f.label} className="flex flex-col-reverse">
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
