import Link from 'next/link';
import { Icon, type IconName } from '@/components/icon';
import { categoryHref } from './hero';

/** `slug` is the category page, `keyword` the search used when it does not exist. */
const SERVICES: {
  href: { slug: string; keyword: string } | string;
  icon: IconName;
  title: string;
  body: string;
}[] = [
  {
    href: { slug: 'restaurants', keyword: 'restaurant' },
    icon: 'restaurant',
    title: 'Restaurants and Food Services',
    body: 'Find restaurants, cafés, bakeries, fast-food outlets, caterers, home chefs, and other food businesses in your city.',
  },
  {
    href: { slug: 'doctors', keyword: 'doctor' },
    icon: 'medical_services',
    title: 'Health and Medical Services',
    body: 'Explore doctors, clinics, dental practices, laboratories, pharmacies, physiotherapists, and other healthcare-related listings.',
  },
  {
    href: { slug: 'home-services', keyword: 'plumber' },
    icon: 'home_repair_service',
    title: 'Home Repair and Maintenance',
    body: 'Find plumbers, electricians, AC technicians, carpenters, painters, and other home service providers near you.',
  },
  {
    href: { slug: 'schools', keyword: 'school' },
    icon: 'school',
    title: 'Education and Training',
    body: 'Discover schools, colleges, tuition centers, language institutes, and training academies for every stage of learning.',
  },
  {
    href: { slug: 'travel-agents', keyword: 'travel' },
    icon: 'flight_takeoff',
    title: 'Travel and Accommodation',
    body: 'Compare hotels, guest houses, travel agencies, tour operators, and Umrah and Hajj services for your next trip.',
  },
  {
    // A mix of several categories, so it opens the full category index.
    href: '/business-categories',
    icon: 'business_center',
    title: 'Professional and Business Services',
    body: 'Connect with consultants, designers, recruitment agencies, translators, and other professionals who help businesses grow.',
  },
];

export function Services({ categorySlugs }: { categorySlugs: ReadonlySet<string> }) {
  return (
    <section className="container-page py-20">
      <div className="mx-auto mb-16 max-w-3xl text-center">
        <span className="font-label-sm text-label-sm text-primary-container font-semibold uppercase">
          High-Demand Sectors
        </span>
        <h2 className="font-headline-lg text-headline-lg-mobile text-on-surface md:text-headline-lg mt-2">
          Popular Services People Search for Worldwide
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-3">
          From daily essentials to specialized services, these are the categories people search for
          most often in cities worldwide.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s) => (
          <Link
            key={s.title}
            href={
              typeof s.href === 'string'
                ? s.href
                : categoryHref(categorySlugs, s.href.slug, s.href.keyword)
            }
            className="group bg-surface-card focus-visible:ring-primary-container flex flex-col rounded-2xl p-7 shadow-xs transition-all duration-300 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
          >
            <div className="bg-surface-container-low text-primary-container group-hover:bg-primary group-hover:text-on-primary mb-5 flex h-14 w-14 items-center justify-center rounded-xl transition-colors">
              <Icon name={s.icon} size={28} />
            </div>
            <h3 className="font-title-md text-title-md text-on-surface group-hover:text-primary-container transition-colors">
              {s.title}
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 flex-1">
              {s.body}
            </p>
            <span className="font-label-sm text-label-sm text-primary-container mt-4 inline-flex items-center gap-1 font-semibold">
              <span>Explore directory</span>
              <Icon
                name="arrow_forward"
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
