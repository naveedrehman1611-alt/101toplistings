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
/** How many of each market's cities the "All" tab shows: two rows of five for five markets. */
const ALL_TILES_PER_MARKET = 2;

/**
 * A 960px-wide thumbnail of a Wikimedia Commons photo. `dir` is the hash path
 * Commons files the original under (the first one and two hex digits of the
 * MD5 of the file name), so the URL needs no lookup at request time.
 */
function commons(dir: string, file: string): string {
  return `https://upload.wikimedia.org/wikipedia/commons/thumb/${dir}/${file}/960px-${file}`;
}

/** A real photo of each city (a landmark or its skyline), keyed by city slug. */
const IMAGES: Record<string, string> = {
  lahore: commons('3/32', 'Badshahi_Masjid,_the_Royal_Mosque_in_Lahore,_Pakistan.jpg'),
  karachi: commons('8/86', 'Mazar-e-Quaid_Karachi.jpg'),
  multan: commons('8/82', 'Tomb_of_Shah_Rukn-e-Alam,_Multan,_Pakistan_2016.jpg'),
  islamabad: commons('f/fe', 'Faisal_Mosque_islamabad_11.jpg'),
  rawalpindi: commons('6/61', 'Gulshan_Dadn_Khan_Maseet,_Rawalpindi.JPG'),
  faisalabad: commons('f/f1', 'Clock_Tower_Faisalabad_by_Usman_Nadeem.jpg'),
  london: commons('8/86', 'City_of_London,_seen_from_Tower_Bridge.jpg'),
  manchester: commons('0/0d', 'Manchester_City_Skyline.jpg'),
  birmingham: commons('5/5c', 'Library_of_Birmingham_(32958941706).jpg'),
  edinburgh: commons('f/fd', 'Edinburgh_Castle_From_Princes_Street_Garden_001.jpg'),
  glasgow: commons('c/cf', 'Glasgow,_George_Square_mit_City_Chambers_(38584813792).jpg'),
  'new-york': commons('d/da', 'Lower_Manhattan_Skyline_September_2021.jpg'),
  'los-angeles': commons('8/88', 'Los_Angeles_Skyline.jpg'),
  chicago: commons('7/70', 'Chicago_Skyline_and_Lake_Michigan.JPG'),
  miami: commons('d/d8', 'Downtown_Miami_skyline_May_2011.jpg'),
  houston: commons('e/e2', 'Houston,_Texas_Skyline_2017.jpg'),
  dubai: commons('1/10', 'Dubai_Skyline_2016.jpg'),
  'abu-dhabi': commons('9/9c', 'Abu_dhabi_skylines_2014.jpg'),
  sharjah: commons('0/08', 'Sharjah_city_skyline.jpg'),
  ajman: commons('0/0c', 'Ajman_Fort_Watchtower_and_Barjeel.jpg'),
  'ras-al-khaimah': commons('9/9f', 'Cloudy_evening_in_RAK_city.jpg'),
  paris: commons('a/af', 'Tour_eiffel_at_sunrise_from_the_trocadero.jpg'),
  berlin: commons('3/39', 'Brandenburg_Gate_-_Brandenburger_Tor_-_Berlin_-_Germany_-_01.jpg'),
  madrid: commons('c/c5', 'Madrid_Spain_Metropolis-Building-01.jpg'),
  rome: commons('5/53', 'Colosseum_exterior_at_night,_Rome,_Italy_(Ank_Kumar)_01.jpg'),
  amsterdam: commons(
    'e/ef',
    'Colorful_canal_houses_at_golden_hour_in_Damrak_avenue_Amsterdam_the_Netherlands.jpg',
  ),
  barcelona: commons('5/5c', 'Sagrada_Familia,_Barcelona_(P1170676).jpg'),
  milan: commons('8/89', 'Cathedrale_duomo,_Milan.JPG'),
  munich: commons('6/6e', 'Neues_Rathaus_Marienplatz_Munich.jpg'),
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
      {/* A brand-tinted backdrop with the tile's icon as artwork. It sits under
          the photo, so it shows for a city with no photo yet and if the photo
          fails to load. */}
      <div
        aria-hidden
        className="from-primary-container absolute inset-0 grid place-items-center bg-linear-to-br to-[#0b1c30] text-white/15 transition-transform duration-700 group-hover:scale-110"
      >
        <Icon name={ICONS[index % ICONS.length]} size={160} />
      </div>
      {image && (
        // Decorative (the city name is the link text). `unoptimized` serves the
        // Commons thumbnail as-is, so its host needs no images.remotePatterns
        // entry and the image optimiser never fetches it.
        <Image
          src={image}
          alt=""
          fill
          unoptimized
          className="object-cover opacity-80 transition-transform duration-700 group-hover:scale-110"
        />
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
          tabs={[
            // "All" leads with each market's top cities, one market after another.
            ...(markets.length > 1
              ? [
                  {
                    key: 'all',
                    label: 'All',
                    panel: (
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
                        {markets.flatMap((m) =>
                          m.cities
                            .slice(0, ALL_TILES_PER_MARKET)
                            .map((c, i) => (
                              <CityTile key={c.id} city={c} index={i} count={counts.get(c.id)} />
                            )),
                        )}
                      </div>
                    ),
                  },
                ]
              : []),
            ...markets.map((m) => ({
              key: m.key,
              label: m.label,
              panel: (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {m.cities.map((c, i) => (
                    <CityTile key={c.id} city={c} index={i} count={counts.get(c.id)} />
                  ))}
                </div>
              ),
            })),
          ]}
        />
        <p className="font-label-sm text-label-sm text-on-surface-variant mt-6">
          City photos:{' '}
          <a
            href="https://commons.wikimedia.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary-container underline"
          >
            Wikimedia Commons
          </a>
        </p>
      </div>
    </section>
  );
}
