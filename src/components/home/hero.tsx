import Link from 'next/link';
import { Icon, type IconName } from '@/components/icon';
import { NearMeButton } from '@/components/near-me-button';
import type { City } from '@/lib/queries';

/**
 * A category page when the directory has that category, otherwise a keyword
 * search, so a pill or tile never links to a 404.
 */
export function categoryHref(slugs: ReadonlySet<string>, slug: string, keyword: string): string {
  return slugs.has(slug) ? `/category/${slug}` : `/search?q=${encodeURIComponent(keyword)}`;
}

const PILLS: { slug: string; keyword: string; label: string; icon: IconName }[] = [
  { slug: 'restaurants', keyword: 'restaurant', label: 'Restaurants', icon: 'restaurant' },
  { slug: 'shopping', keyword: 'shopping', label: 'Shopping & Retail', icon: 'shopping_bag' },
  { slug: 'schools', keyword: 'school', label: 'Education & Training', icon: 'school' },
  { slug: 'hotels', keyword: 'hotel', label: 'Hotels & Travel', icon: 'hotel' },
  { slug: 'real-estate', keyword: 'real estate', label: 'Real Estate', icon: 'apartment' },
  { slug: 'lawyers', keyword: 'lawyer', label: 'Legal Services', icon: 'gavel' },
];

const PILL =
  'inline-flex items-center gap-2.5 rounded-full bg-white/10 px-4 py-2 font-label-md text-label-md text-white shadow-xs backdrop-blur-md transition-all hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-primary-fixed focus-visible:outline-hidden';

const FIELD =
  'flex flex-1 items-center rounded-xl bg-surface-bg px-4 py-3 text-on-surface focus-within:ring-2 focus-within:ring-primary-container';

const FIELD_LABEL = 'font-label-sm text-label-sm tracking-wider text-secondary uppercase';

export function Hero({
  cities,
  categorySlugs,
}: {
  cities: Pick<City, 'id' | 'slug' | 'name'>[];
  categorySlugs: ReadonlySet<string>;
}) {
  return (
    <section className="text-on-primary relative w-full overflow-hidden bg-linear-to-b from-[#071328] via-[#0b1c30] to-[#0d223a] px-6 pt-16 pb-24 lg:px-12">
      {/* Ambient glow decorative layers */}
      <div
        aria-hidden
        className="bg-primary-container/20 pointer-events-none absolute -top-32 left-1/2 h-[340px] w-[720px] -translate-x-1/2 rounded-full blur-[110px]"
      />
      <div
        aria-hidden
        className="bg-tertiary-container/15 pointer-events-none absolute top-48 right-10 h-96 w-96 rounded-full blur-[100px]"
      />
      <div className="relative mx-auto flex max-w-5xl flex-col items-center text-center">
        {/* Trust pill badge */}
        <div className="bg-surface-container-lowest/10 mb-6 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 shadow-xs backdrop-blur-md">
          <Icon name="verified_user" size={16} className="text-primary-fixed" />
          <span className="font-label-sm text-label-sm text-primary-fixed tracking-wide uppercase">
            Pakistan&apos;s Verified Commercial Network
          </span>
        </div>
        {/* 50rem rather than the design's max-w-3xl (48rem): browsers that round glyph
            widths draw "…Directory –" a few pixels wider than 48rem, which pushed
            the dash onto the second line. */}
        <h1 className="font-display-hero text-display-hero-mobile md:text-display-hero max-w-[50rem] leading-tight tracking-tight text-white">
          Pakistan&apos;s #1 Business Directory – Find Local Businesses
        </h1>
        <p className="font-body-lg text-body-lg text-surface-container-high/90 mt-4 max-w-2xl">
          Business Directory Pakistan helps you find verified businesses, restaurants, shops, and
          local services across Pakistan.
        </p>

        {/* One GET form around the search bar and the pills, so "Near me" carries the
            "What" keyword along (see NearMeButton). Below md the fields use 16px text:
            iOS Safari zooms into any smaller field on focus. */}
        <form action="/search" role="search" aria-label="Search businesses" className="w-full">
          {/* Multi-segment unified search bar */}
          <div className="bg-surface-card mt-10 w-full rounded-2xl p-2 shadow-2xl backdrop-blur-xs sm:p-2.5">
            <div className="flex flex-col items-stretch gap-2 md:flex-row">
              {/* Keyword input */}
              <div className={FIELD}>
                <Icon name="search" size={22} className="text-secondary mr-3" />
                <div className="flex w-full flex-col text-left">
                  <label htmlFor="hero-q" className={FIELD_LABEL}>
                    What
                  </label>
                  <input
                    id="hero-q"
                    name="q"
                    type="search"
                    placeholder="Ex: restaurant, lawyer, gym..."
                    className="font-body-md text-body-md text-on-surface placeholder:text-outline w-full appearance-none bg-transparent focus:outline-hidden max-md:text-base"
                  />
                </div>
              </div>
              {/* City dropdown, styled as the design's location input */}
              <div className={FIELD}>
                <Icon name="location_on" size={22} className="text-secondary mr-3" />
                <div className="flex w-full flex-col text-left">
                  <label htmlFor="hero-city" className={FIELD_LABEL}>
                    Where
                  </label>
                  <select
                    id="hero-city"
                    name="city"
                    defaultValue=""
                    className="font-body-md text-body-md text-on-surface has-[option[value='']:checked]:text-outline [&_option]:text-on-surface w-full cursor-pointer appearance-none truncate border-0 bg-transparent focus:outline-hidden max-md:text-base"
                  >
                    <option value="">All cities (e.g. Lahore, Karachi)</option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Search button */}
              <button
                type="submit"
                className="bg-primary-container font-title-md text-title-md text-on-primary hover:bg-primary hover:shadow-primary/30 focus-visible:ring-primary-container flex shrink-0 items-center justify-center gap-2 rounded-xl px-8 py-4 shadow-lg transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
              >
                <Icon name="search" size={20} />
                <span>Search listings</span>
              </button>
            </div>
          </div>

          {/* Quick category pills */}
          <div className="mt-8 flex w-full flex-wrap items-center justify-center gap-3">
            {PILLS.map((p) => (
              <Link
                key={p.slug}
                href={categoryHref(categorySlugs, p.slug, p.keyword)}
                className={PILL}
              >
                <Icon name={p.icon} size={18} className="text-primary-fixed" />
                <span>{p.label}</span>
              </Link>
            ))}
            <NearMeButton
              className={`${PILL} [&>svg]:text-primary-fixed self-center whitespace-nowrap disabled:opacity-60 [&>svg]:size-[18px]`}
              messageClassName="mt-2 max-w-xs text-center font-body-sm text-body-sm text-error-container"
            />
          </div>
        </form>
      </div>
    </section>
  );
}
