import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/components/icons';
import type { HeroVM } from '@/lib/home-types';
import { HeroSearch } from './hero-search';

const OVERLAY: Record<HeroVM['overlay'], string> = {
  light: 'bg-navy-950/45',
  medium: 'bg-navy-950/60',
  strong: 'bg-navy-950/75',
};

/**
 * Full-bleed photo with the page's h1, the What / Where search and a white
 * panel of category tiles that overlaps the photo's bottom edge. The header
 * floats over the top of it on the homepage (data-hero tells it the photo is
 * there), so the content starts below the header's height.
 *
 * Layout: one grid column, three rows. The photo fills rows 1–2, the text and
 * search row 1, the tile panel rows 2–3. From sm up rows 2 and 3 are 1fr each,
 * which splits the panel's own height evenly between them, so the photo always
 * ends exactly halfway down the panel however many rows of tiles it has. On
 * phones, where the panel is tall, the overlap is a fixed 4rem instead.
 */
export function Hero({ section }: { section: HeroVM }) {
  const { image, tiles } = section;
  const hasTiles = tiles.length > 0;

  return (
    <section
      id={section.key}
      data-hero=""
      aria-labelledby={section.heading ? 'hero-heading' : undefined}
      className={`relative isolate grid ${
        hasTiles ? 'grid-rows-[auto_4rem_auto] sm:grid-rows-[auto_1fr_1fr]' : ''
      }`}
    >
      <div
        className={`bg-navy-900 relative col-start-1 row-start-1 overflow-hidden ${
          hasTiles ? 'row-span-2' : ''
        }`}
      >
        {image ? (
          <>
            <Image
              src={image.url}
              // Without its own alt text the photo only repeats the heading.
              alt={image.alt === section.heading ? '' : image.alt}
              fill
              preload
              sizes="100vw"
              className="object-cover"
            />
            <div aria-hidden="true" className={`absolute inset-0 ${OVERLAY[section.overlay]}`} />
          </>
        ) : null}
      </div>

      <div
        className={`relative z-20 col-start-1 row-start-1 flex flex-col items-center justify-center px-4 pt-[6.5rem] pb-12 text-center sm:px-6 lg:pt-[9.25rem] lg:pb-16 ${
          hasTiles
            ? 'md:min-h-[25.5rem] lg:min-h-[36.75rem]'
            : 'md:min-h-[35rem] lg:min-h-[42.5rem]'
        }`}
      >
        {section.heading ? (
          <h1
            id="hero-heading"
            className="max-w-[47.5rem] text-[1.75rem] leading-tight font-medium text-white sm:text-[2rem] lg:text-[2.375rem]"
          >
            {section.heading}
          </h1>
        ) : null}
        {section.subheading ? (
          <p className="mt-4 max-w-[52rem] text-[0.9375rem] leading-relaxed text-pretty text-white/85">
            {section.subheading}
          </p>
        ) : null}
        <div className="mt-8 w-full">
          <HeroSearch
            labels={section.labels}
            categories={section.categories}
            cities={section.cities}
          />
        </div>
      </div>

      {hasTiles ? (
        <div className="container-page relative z-10 col-start-1 row-span-2 row-start-2">
          <ul className="grid grid-cols-2 gap-4 rounded-[10px] bg-white p-6 shadow-[var(--shadow-raised)] sm:grid-cols-3 lg:grid-cols-6 lg:gap-5 lg:p-7">
            {tiles.map((tile) => (
              <li key={tile.id}>
                <Link
                  href={tile.href}
                  className="flex h-full flex-col items-center justify-center rounded-lg bg-[var(--surface-2)] px-2 py-7 text-center transition duration-200 hover:bg-white hover:shadow-[var(--shadow-card-hover)] motion-safe:hover:-translate-y-0.5"
                >
                  <Icon
                    name={tile.icon ?? undefined}
                    size={34}
                    strokeWidth={1.5}
                    className="text-brand-700"
                  />
                  <span className="text-ink-900 mt-3 text-sm leading-snug font-medium">
                    {tile.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
