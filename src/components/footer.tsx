import Link from 'next/link';
import { Icon } from '@/components/icon';
import { NewsletterForm } from '@/components/newsletter-form';
import type { City, MenuItem } from '@/lib/queries';

/** The design's five cities lead the Locations column; other featured cities follow. */
const PREFERRED_CITIES = ['karachi', 'lahore', 'multan', 'rawalpindi', 'islamabad'];

function footerCities(cities: City[]): City[] {
  const rank = (slug: string) => {
    const i = PREFERRED_CITIES.indexOf(slug);
    return i === -1 ? PREFERRED_CITIES.length : i;
  };
  // sort is stable, so the rest keep the query's alphabetical order.
  return [...cities].sort((a, b) => rank(a.slug) - rank(b.slug)).slice(0, 5);
}

const FAQ_LINK: MenuItem = { label: 'FAQ', url: '/#faq', sort_order: 0 };

const linkClass =
  'font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface rounded-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container';

/** Same split as the header: "RankYouSite" -> "RankYou" + accented "Site". */
function Wordmark({ name }: { name: string }) {
  const parts = /^(.+?)([A-Z][a-z0-9]*)$/.exec(name);
  if (!parts) return <>{name}</>;
  return (
    <>
      {parts[1]}
      <span className="text-primary-container">{parts[2]}</span>
    </>
  );
}

export function Footer({
  brand,
  about,
  copyright,
  email,
  cities,
  explore,
  company,
}: {
  brand: string;
  about: string;
  copyright: string;
  email: string;
  /** Featured cities. */
  cities: City[];
  /** Footer "Explore" menu, shown as Useful Links. */
  explore: MenuItem[];
  /** Footer "Company" menu, shown in the bottom bar. */
  company: MenuItem[];
}) {
  const locations = footerCities(cities);
  const usefulLinks = explore.some((item) => item.url === FAQ_LINK.url)
    ? explore
    : [...explore, FAQ_LINK];

  return (
    <footer className="bg-surface-card w-full shadow-[0_-1px_8px_rgba(0,0,0,0.02)]">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-12 lg:px-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12">
          <div className={`space-y-4 ${locations.length > 0 ? 'lg:col-span-4' : 'lg:col-span-6'}`}>
            <div className="flex items-center gap-3">
              <div className="bg-primary flex h-9 w-9 items-center justify-center rounded-xl">
                <Icon name="verified" size={20} className="text-on-primary" />
              </div>
              <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight">
                <Wordmark name={brand} />
              </span>
            </div>
            {about ? (
              <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">{about}</p>
            ) : null}
            {email ? (
              <div className="text-secondary flex items-center gap-2 pt-2">
                <Icon name="mail" size={18} />
                <a
                  href={`mailto:${email}`}
                  className="font-label-md text-label-md hover:text-on-surface focus-visible:outline-primary-container rounded-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  {email}
                </a>
              </div>
            ) : null}
          </div>

          {locations.length > 0 ? (
            <div className="space-y-4 lg:col-span-2">
              <h2 className="font-title-md text-title-md text-on-surface">Locations</h2>
              <ul className="space-y-2.5">
                {locations.map((city) => (
                  <li key={city.id} className="flex items-center gap-2">
                    <Link href={`/city/${city.slug}`} className={linkClass}>
                      {city.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="space-y-4 lg:col-span-2">
            <h2 className="font-title-md text-title-md text-on-surface">Useful Links</h2>
            <ul className="space-y-2.5">
              {usefulLinks.map((item) => (
                <li key={`${item.url}|${item.label}`}>
                  <Link href={item.url} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4 lg:col-span-4">
            <h2 className="font-title-md text-title-md text-on-surface">Newsletter</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Subscribe for updates on new businesses, cities and guides added to the directory
              across Pakistan.
            </p>
            <NewsletterForm />
            <p className="font-label-sm text-label-sm text-secondary">
              No spam, just occasional local business updates.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 pt-8 sm:flex-row">
          <p className="font-body-sm text-body-sm text-on-surface-variant text-center sm:text-left">
            Copyright © {new Date().getFullYear()} {copyright.replace(/\.+$/, '')}. All rights
            reserved.
          </p>
          {company.length > 0 ? (
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {company.map((item) => (
                <Link key={`${item.url}|${item.label}`} href={item.url} className={linkClass}>
                  {item.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
