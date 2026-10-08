import Image from 'next/image';
// Prefetch on intent, not on sight: see hover-prefetch-link.tsx.
import { HoverPrefetchLink as Link } from '@/components/hover-prefetch-link';
import { Icon } from '@/components/icons';
import type { CityGridVM } from '@/lib/home-types';
import { SectionShell } from './section-shell';

/**
 * The reference's mosaic: rows alternate wide + narrow and narrow + wide on
 * large screens (three columns, wide = two). On two columns the wide cards take
 * a whole row and the narrow ones pair up. A card left alone on the last row
 * fills it, so any number of cities leaves no hole.
 */
function tile(i: number, count: number) {
  const wide = i % 4 === 0 || i % 4 === 3;
  const last = i === count - 1;
  const smFull = wide || (last && i % 4 === 1);
  const lgSpan = last && i % 2 === 0 ? 3 : wide ? 2 : 1;
  const className = [
    smFull ? 'sm:col-span-2' : '',
    lgSpan === 3 ? 'lg:col-span-3' : lgSpan === 2 ? 'lg:col-span-2' : smFull ? 'lg:col-span-1' : '',
  ].join(' ');
  const lgWidth = lgSpan === 3 ? 1140 : lgSpan === 2 ? 760 : 370;
  const sizes = `(min-width: 1024px) ${lgWidth}px, ${smFull ? '' : '(min-width: 640px) 50vw, '}100vw`;
  return { className, sizes };
}

export function CityGrid({ section }: { section: CityGridVM }) {
  const count = section.items.length;
  return (
    <SectionShell section={section}>
      <ul className="grid auto-rows-[200px] gap-6 sm:auto-rows-[240px] sm:grid-cols-2 lg:auto-rows-[320px] lg:grid-cols-3">
        {section.items.map((city, i) => {
          const { className, sizes } = tile(i, count);
          return (
            <li key={city.id} className={className}>
              <Link
                href={city.href}
                className="group bg-navy-800 relative block h-full overflow-hidden rounded-lg"
              >
                {/* Decorative: the city name below is the link text. */}
                {city.image ? (
                  <Image
                    src={city.image.url}
                    alt=""
                    fill
                    sizes={sizes}
                    className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105 motion-safe:group-focus-visible:scale-105"
                  />
                ) : (
                  <Icon
                    name="map-pin"
                    size={96}
                    strokeWidth={1}
                    className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/15"
                  />
                )}
                <span
                  aria-hidden
                  className="bg-hero-navy/60 group-hover:bg-hero-navy/70 group-focus-visible:bg-hero-navy/70 absolute inset-0 transition-colors duration-500"
                />
                <h3 className="absolute inset-x-0 bottom-0 px-4 pb-6 text-center text-lg font-medium text-white">
                  {city.name}
                </h3>
              </Link>
            </li>
          );
        })}
      </ul>
    </SectionShell>
  );
}
