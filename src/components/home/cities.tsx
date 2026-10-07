import Image from 'next/image';
import Link from 'next/link';
import { Icon, type IconName } from '@/components/icon';
import type { City } from '@/lib/queries';

/** The design's four tiles, in its order. */
const TILE_ORDER = ['lahore', 'karachi', 'multan', 'islamabad'];
const MAX_TILES = 4;

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

const ICONS: Record<string, IconName> = {
  lahore: 'location_city',
  karachi: 'apartment',
  multan: 'account_balance',
  islamabad: 'domain',
};

/**
 * The design's four cities when the directory has them, topped up with other
 * featured cities, so the tiles never link to a missing city page.
 */
export function pickHomeCities<T extends Pick<City, 'slug' | 'is_featured'>>(cities: T[]): T[] {
  const bySlug = new Map(cities.map((c) => [c.slug, c]));
  const picked = TILE_ORDER.flatMap((slug) => {
    const c = bySlug.get(slug);
    return c ? [c] : [];
  });
  for (const c of cities) {
    if (picked.length >= MAX_TILES) break;
    if (c.is_featured && !picked.includes(c)) picked.push(c);
  }
  return picked.slice(0, MAX_TILES);
}

function countLabel(n: number | undefined): string {
  if (!n) return 'Explore businesses';
  return `${n.toLocaleString('en-US')} ${n === 1 ? 'Listing' : 'Listings'}`;
}

export function Cities({
  cities,
  counts,
}: {
  cities: Pick<City, 'id' | 'slug' | 'name'>[];
  counts: Map<string, number>;
}) {
  if (cities.length === 0) return null;

  return (
    <section className="bg-surface-container w-full px-6 py-20 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="font-label-sm text-label-sm text-primary-container font-semibold uppercase">
              Metro Hubs
            </span>
            <h2 className="font-headline-lg text-headline-lg-mobile text-on-surface md:text-headline-lg mt-1">
              Browse Businesses by City
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-2xl">
              Find local businesses and service providers in major cities worldwide. Select a city
              to explore available categories and business listings.
            </p>
          </div>
        </div>

        {/* City tiles grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cities.map((c) => {
            const image = IMAGES[c.slug];
            return (
              <Link
                key={c.id}
                href={`/city/${c.slug}`}
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
                ) : null}
                <div
                  aria-hidden
                  className="absolute inset-0 bg-linear-to-t from-[#0b1c30] via-[#0b1c30]/40 to-transparent"
                />
                <div className="relative z-10 flex flex-col">
                  <span className="group-hover:bg-primary-container mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-md transition-colors">
                    <Icon name={ICONS[c.slug] ?? 'location_city'} size={20} />
                  </span>
                  <h3 className="font-headline-sm text-headline-sm group-hover:text-primary-fixed text-white transition-colors">
                    {c.name}
                  </h3>
                  <span className="font-label-sm text-label-sm mt-1 text-white/85">
                    {countLabel(counts.get(c.id))}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
