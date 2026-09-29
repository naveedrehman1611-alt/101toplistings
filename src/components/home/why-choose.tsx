import { Icon, type IconName } from '@/components/icon';

type Feature = { icon: IconName; title: string; body: string };

const FEATURES: Feature[] = [
  {
    icon: 'manage_search',
    title: 'Filter by Location and Service',
    body: "Select the exact service you're looking for along with your city or nearby area. This helps you skip unrelated listings and reach businesses that actually match your needs.",
  },
  {
    icon: 'fact_check',
    title: 'Check Complete Business Info',
    body: 'View contact numbers, categories, addresses, current opening status, photos, and other profile details — all before you decide to reach out.',
  },
  {
    icon: 'contact_phone',
    title: 'Reach Out Directly',
    body: 'Contact the business by phone, visit their website, or check their exact location on the map. No third-party booking or unnecessary steps involved in the process.',
  },
];

/** "Why choose" section of the home page (Stitch design). */
export function WhyChoose({ brand }: { brand: string }) {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-12">
      <div className="mx-auto mb-16 max-w-3xl text-center">
        <span className="font-label-sm text-label-sm text-primary-container font-semibold uppercase">
          User Experience Advantage
        </span>
        <h2 className="font-headline-lg text-headline-lg-mobile text-on-surface md:text-headline-lg mt-2">
          Why Choose {brand} for Local Business Search?
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-3">
          Looking for a business shouldn&apos;t mean scrolling through endless results. {brand}{' '}
          sorts listings by category and location for faster, more relevant results.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
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
