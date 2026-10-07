import Image from 'next/image';
import Link from 'next/link';
import { Icon, type IconName } from '@/components/icon';
import type { Category, City } from '@/lib/queries';
import heroCity from '../../../public/images/hero-city.webp';

/**
 * A category page when the directory has that category, otherwise a keyword
 * search, so a pill or tile never links to a 404.
 */
export function categoryHref(slugs: ReadonlySet<string>, slug: string, keyword: string): string {
  return slugs.has(slug) ? `/category/${slug}` : `/search?q=${encodeURIComponent(keyword)}`;
}

/**
 * The strip left of the photo. In the mockup the skyline carries on, darkened,
 * behind the heading, but the photo asset stops at its left edge; this paints
 * the mockup's colours there (top to bottom) under a navy fade from the left
 * and the bottom. The photo's masked left 60px blend into the strip's last 60px.
 */
const SKYLINE_FADE = [
  'linear-gradient(to top, var(--color-hero-navy), transparent 6%)',
  'linear-gradient(to right, var(--color-hero-navy), transparent 380px)',
  'linear-gradient(to bottom, #0c5285, #135a8e 10%, #206194 20%, #396d97 30%, #4f7699 37%, #597796 46%, #5a6a80 52%, #576071 59%, #364b66 64%, #283c55 71%, #1c3036 79%, #11252a 85%, #33495f 91%, #2a4b6d)',
].join(', ');

const FIELD =
  'flex h-12 min-w-0 items-center gap-3.5 rounded-[10px] border border-[#e3e8ef] bg-white px-3.5 focus-within:border-hero-green focus-within:ring-2 focus-within:ring-hero-green/25';

// Below md the controls use 16px text: iOS Safari zooms into any smaller field on focus.
const CONTROL =
  'h-full w-full min-w-0 bg-transparent text-sm text-on-surface focus:outline-hidden max-md:text-base';

// Native select, restyled: the chevron is drawn over its right padding, and the
// text is grey while the "All …" option is chosen.
const SELECT = `${CONTROL} cursor-pointer appearance-none truncate pr-7 has-[option[value='']:checked]:text-[#4b5563] [&_option]:text-on-surface`;

type Option = { slug: string; name: string };

function FilterSelect({
  id,
  name,
  label,
  icon,
  allLabel,
  options,
  className,
}: {
  id: string;
  name: string;
  label: string;
  icon: IconName;
  allLabel: string;
  options: Option[];
  className: string;
}) {
  return (
    <div className={`${FIELD} relative ${className}`}>
      <Icon name={icon} size={22} className="text-[#3b4a5f]" />
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select id={id} name={name} defaultValue="" className={SELECT}>
        <option value="">{allLabel}</option>
        {options.map((o) => (
          <option key={o.slug} value={o.slug}>
            {o.name}
          </option>
        ))}
      </select>
      <Icon
        name="expand_more"
        size={18}
        className="pointer-events-none absolute right-2.5 text-[#3b4a5f]"
      />
    </div>
  );
}

export function Hero({
  categories,
  cities,
}: {
  categories: Pick<Category, 'slug' | 'name'>[];
  cities: Pick<City, 'slug' | 'name'>[];
}) {
  return (
    <section className="bg-hero-navy relative overflow-hidden text-white">
      {/* Decorative photo. The asset is the mockup's top-right corner, so from lg it
          sits there at the mockup's scale: the laptop ends just above the search card.
          Nudged up 1% to hide a light line along its top edge. Below lg it lies full
          width behind the text at 35%. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 aspect-[910/756] -translate-y-[1%] opacity-35 lg:left-auto lg:w-[563px] lg:opacity-100"
      >
        <div
          className="absolute top-0 right-[calc(100%-60px)] hidden h-full w-[440px] lg:block"
          style={{ backgroundImage: SKYLINE_FADE }}
        />
        <Image
          src={heroCity}
          alt=""
          fill
          preload
          sizes="(min-width: 1024px) 563px, 100vw"
          className="object-cover object-right-top lg:[mask-image:linear-gradient(to_right,transparent,black_60px)]"
        />
        <div className="from-hero-navy absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t to-transparent lg:h-[6%]" />
      </div>

      <div className="container-page relative pt-10 pb-14 lg:pt-[73px]">
        <p className="border-hero-green-light/40 bg-hero-green-light/5 text-hero-green-light inline-block max-w-full rounded-2xl border px-[18px] py-[7px] text-[13px] font-semibold sm:rounded-full sm:text-[15px]">
          {/* Wraps before the "+" on narrow phones; the margins widen the gaps around it. */}
          <span className="me-1 whitespace-nowrap">Business Directory</span>{' '}
          <span className="whitespace-nowrap">
            <span className="me-1">+</span> SEO & Digital Marketing
          </span>
        </p>

        <h1 className="font-display mt-6 text-[40px] leading-[1.03] font-extrabold tracking-tight sm:text-5xl lg:mt-[18px] lg:text-[64px]">
          <span className="block">List Your Business.</span>
          <span className="block">Get Found Online.</span>
          <span className="text-hero-green-light block">Grow With SEO.</span>
        </h1>

        {/* From lg the lines break where the mockup's do: no max-width gives both breaks. */}
        <p className="mt-4 max-w-[36rem] text-lg leading-[1.55] text-white/85">
          Discover businesses worldwide, create a powerful business listing, and get SEO &amp;
          digital marketing services to grow your visibility, traffic, and leads.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/add-business"
            className="bg-hero-green hover:bg-hero-green-hover focus-visible:ring-hero-green inline-flex h-12 items-center justify-center rounded-lg px-6 text-base font-semibold text-white transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
          >
            Add Your Business
          </Link>
          <Link
            href="/seo-audit"
            className="focus-visible:ring-hero-green-light inline-flex h-12 items-center justify-center rounded-lg border border-white/40 px-6 text-base font-semibold text-white transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:outline-hidden"
          >
            Get an SEO Audit
          </Link>
        </div>

        <form
          action="/search"
          role="search"
          aria-label="Search businesses"
          className="mt-9 flex w-full max-w-[69rem] flex-col gap-3.5 rounded-2xl bg-white p-[11px] shadow-2xl md:grid md:grid-cols-2 lg:flex lg:flex-row"
        >
          <div className={`${FIELD} lg:flex-[1.5]`}>
            <Icon name="search" size={24} className="text-[#3b4a5f]" />
            <label htmlFor="hero-q" className="sr-only">
              Keyword
            </label>
            <input
              id="hero-q"
              name="q"
              type="search"
              placeholder="Business name, category or keyword"
              className={`${CONTROL} appearance-none truncate placeholder:text-[#6b7280]`}
            />
          </div>
          <FilterSelect
            id="hero-category"
            name="category"
            label="Category"
            icon="grid_view"
            allLabel="All Categories"
            options={categories}
            className="lg:flex-1"
          />
          <FilterSelect
            id="hero-city"
            name="city"
            label="City"
            icon="location_on"
            allLabel="All Cities"
            options={cities}
            className="lg:flex-[1.2]"
          />
          <button
            type="submit"
            className="bg-hero-green hover:bg-hero-green-hover focus-visible:ring-hero-green h-12 w-full shrink-0 rounded-lg text-base font-semibold text-white transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden lg:w-[188px]"
          >
            Search
          </button>
        </form>

        <p className="mt-4 text-sm text-white/75">
          <Link
            href="/business-directory"
            className="underline-offset-4 hover:text-white hover:underline"
          >
            Browse Businesses
          </Link>
          <span aria-hidden className="mx-2">
            ·
          </span>
          <Link
            href="/seo-services"
            className="underline-offset-4 hover:text-white hover:underline"
          >
            Explore SEO Services
          </Link>
        </p>
      </div>
    </section>
  );
}
