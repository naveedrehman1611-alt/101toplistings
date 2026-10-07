import { Icon, type IconName } from '@/components/icon';

type Step = { icon: IconName; title: string; body: string };

// Rendered in order; the step number is the position in this array.
const STEPS: Step[] = [
  {
    icon: 'search',
    title: 'Search & Discover',
    body: "Type in what you're looking for — a restaurant, doctor, lawyer, or any local service. Filter by city, category, or rating to find exactly what you need.",
  },
  {
    icon: 'reviews',
    title: 'Read Reviews & Compare',
    body: 'Browse detailed business profiles with real customer reviews, contact info, and location maps — all in one place. Fast, free, and built for businesses worldwide.',
  },
  {
    icon: 'near_me',
    title: 'Connect & Visit',
    body: 'Call, message, or get directions to the business directly from the listing. No middleman, no hassle — just direct connection.',
  },
];

/** "How does it work?" three-step section of the home page (Stitch design). */
export function HowItWorks({ brand }: { brand: string }) {
  return (
    <section className="bg-surface-card w-full px-6 py-20 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="font-label-sm text-label-sm text-primary-container font-semibold uppercase">
            Step-by-Step Flow
          </span>
          <h2 className="font-headline-lg text-headline-lg-mobile text-on-surface md:text-headline-lg mt-2">
            How Does {brand} Work?
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-3">
            {brand} is a global business directory — helping users search, compare, and connect with
            local businesses quickly and easily.
          </p>
        </div>
        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="bg-surface-bg relative flex flex-col rounded-2xl p-8 shadow-xs"
            >
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
