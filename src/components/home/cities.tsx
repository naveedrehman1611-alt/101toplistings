import Image from 'next/image';
import Link from 'next/link';
import { Icon, type IconName } from '@/components/icon';
import type { City } from '@/lib/queries';
import { CityTabs } from './city-tabs';

/**
 * The markets the section has a tab for, in tab order, each with its top cities
 * in tile order. Later slugs stand in when an earlier one is missing, so a
 * market still fills its row; a market with none of its cities gets no tab.
 */
const MARKETS: { key: string; label: string; cities: string[] }[] = [
  {
    key: 'pakistan',
    label: 'Pakistan',
    cities: ['lahore', 'karachi', 'multan', 'islamabad', 'rawalpindi', 'faisalabad'],
  },
  {
    key: 'uk',
    label: 'UK',
    cities: ['london', 'manchester', 'birmingham', 'edinburgh', 'glasgow'],
  },
  {
    key: 'usa',
    label: 'USA',
    cities: ['new-york', 'los-angeles', 'chicago', 'miami', 'houston'],
  },
  {
    key: 'uae',
    label: 'UAE',
    cities: ['dubai', 'abu-dhabi', 'sharjah', 'ajman', 'ras-al-khaimah'],
  },
  {
    key: 'europe',
    label: 'Europe',
    cities: ['paris', 'berlin', 'madrid', 'rome', 'amsterdam', 'barcelona', 'milan', 'munich'],
  },
];
const TILES_PER_MARKET = 4;

/** The design's photos (hosted by Stitch), keyed by city slug. */
const IMAGES: Record<string, string> = {
  lahore:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAVHv-_6xPIm8XIMyMneBhQH0HjJpngZWp6Ll8jTWtmyHriiD4yGXSNMVNg5tHgTVoHy2ZYSRPFZkNu2C_nXKXgikLoe5KZ3NWn6LGclNrMXq1Q5SYh8mC6C-kGvUB_zdoIhKsRA_eE84Zd_7olNTWTUyKONUiUSsZpRkntc8VK0TdcYOZQj_ExVu5QTaHa7a1L6Cxc97piEWEx3UBAubrItZ1EqF-z7cY-TRA_Q-oWddZtqBDRXGqQNA',
  karachi:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDFPXoXI_DerNbVWY66DJ11ivDhSJSk5gucROSbO9Du0x_wN6GV7qHYOQ_9QCFNjCFJ4BPoVCRO0zsOL6SUwCzvHEzJwadndJ8fYr60np3lcjVGPwCcQsYYwBR6W8I_kxUFklsy54sonvafqPR4Vbwqk7s57nUFlN5hCBroKRh3mRu5PYk0ioxJ1De3wD6czCDOZL2yAU48W78AylBFKX3Xg4r8pWSg6nzO6UT1w-GEKUC1oWeqUlQXQg',
  multan:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC_xp2-NSAzrhzVwNuBjO7ffmtFuhoiQhauibb7iwI77x4cTfdS12qcmJaBOk398Y1-wOvX1FBJtqyaKtCM_X2l5MRSWnXy1esM9NeYKmP3CeOmtmxDojWpj9NEV4D8nk2Tbw5lsJOOTe8cvBjY-UBvnLje7hlxEHwE8aQ7y1YPuck8IqrmEAcTBBUb-Mgg2u5YdgryHKNdNSy7SOUja5XXUyrWMMvMLR7FIlu9pVAvLfBEx8msRmYdMw',
  islamabad:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCfLvV8sP_CYG5BqZ7v396KsZg-OfiP_a4VD2Gcfuyg9MaGmRT_oqi5G9M3Qcm_LUi_n8xM1IY9D1wyrALlbBuEsKk79DM5Cszw4VzGE2o9V_PvQv6K5PZbCYkiuSBoiVVtRMTLqVADZ80p7nARQOjFHyJCH-yveIDEUpZRrR0j9atmzYbF98U5tBm4-JhKyiqM7BPsM7YSz0kl3amn9tCE9nmwVDrYxANOgGMTUYwDa6ZWYSX3LbiHBw',
};

/** Tile icons, cycled by position so neighbouring tiles differ. */
const ICONS: IconName[] = ['location_city', 'apartment', 'account_balance', 'domain'];

export type CityMarket<T> = { key: string; label: string; cities: T[] };

/**
 * Each market's top cities that the directory has, so the tiles never link to
 * a missing city page. Markets with none of their cities are left out.
 */
export function pickHomeCities<T extends Pick<City, 'slug'>>(cities: T[]): CityMarket<T>[] {
  const bySlug = new Map(cities.map((c) => [c.slug, c]));
  return MARKETS.flatMap((m) => {
    const picked = m.cities
      .flatMap((slug) => {
        const c = bySlug.get(slug);
        return c ? [c] : [];
      })
      .slice(0, TILES_PER_MARKET);
    return picked.length ? [{ key: m.key, label: m.label, cities: picked }] : [];
  });
}

function countLabel(n: number | undefined): string {
  if (!n) return 'Explore businesses';
  return `${n.toLocaleString('en-US')} ${n === 1 ? 'Listing' : 'Listings'}`;
}

function CityTile({
  city,
  index,
  count,
}: {
  city: Pick<City, 'id' | 'slug' | 'name'>;
  index: number;
  count: number | undefined;
}) {
  const image = IMAGES[city.slug];
  return (
    <Link
      href={`/city/${city.slug}`}
      className="group bg-on-background focus-visible:ring-primary-container focus-visible:ring-offset-surface-container relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl p-6 shadow-md transition-all duration-300 hover:shadow-2xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
    >
      {image ? (
        // Decorative (the city name is the link text). `unoptimized` serves the
        // design's hosted photo as-is, so its host needs no images.remotePatterns
        // entry and the image optimiser never fetches it.
        <Image
          src={image}
          alt=""
          fill
          unoptimized
          className="object-cover opacity-60 transition-transform duration-700 group-hover:scale-110"
        />
      ) : (
        // No photo yet: a brand-tinted backdrop with the tile's icon as artwork.
        <div
          aria-hidden
          className="from-primary-container absolute inset-0 grid place-items-center bg-linear-to-br to-[#0b1c30] text-white/15 transition-transform duration-700 group-hover:scale-110"
        >
          <Icon name={ICONS[index % ICONS.length]} size={160} />
        </div>
      )}
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-t from-[#0b1c30] via-[#0b1c30]/40 to-transparent"
      />
      <div className="relative z-10 flex flex-col">
        <span className="group-hover:bg-primary-container mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-md transition-colors">
          <Icon name={ICONS[index % ICONS.length]} size={20} />
        </span>
        <h3 className="font-headline-sm text-headline-sm group-hover:text-primary-fixed text-white transition-colors">
          {city.name}
        </h3>
        <span className="font-label-sm text-label-sm mt-1 text-white/85">{countLabel(count)}</span>
      </div>
    </Link>
  );
}

export function Cities({
  markets,
  counts,
}: {
  markets: CityMarket<Pick<City, 'id' | 'slug' | 'name'>>[];
  counts: Map<string, number>;
}) {
  if (markets.length === 0) return null;

  return (
    <section className="bg-surface-container w-full px-6 py-20 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="font-label-sm text-label-sm text-primary-container font-semibold uppercase">
              Metro Hubs
            </span>
            <h2 className="font-headline-lg text-headline-lg-mobile text-on-surface md:text-headline-lg mt-1">
              Browse Businesses by City
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-2xl">
              Find local businesses and service providers in top cities across Pakistan, the UK, the
              USA, the UAE and Europe. Select a city to explore available categories and business
              listings.
            </p>
          </div>
        </div>

        <CityTabs
          label="Cities by country"
          tabs={markets.map((m) => ({
            key: m.key,
            label: m.label,
            panel: (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {m.cities.map((c, i) => (
                  <CityTile key={c.id} city={c} index={i} count={counts.get(c.id)} />
                ))}
              </div>
            ),
          }))}
        />
      </div>
    </section>
  );
}
