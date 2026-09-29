import type { ReactNode } from 'react';
import { Icon, type IconName } from '@/components/icon';
import type { DirectoryStats, ReviewSummary } from '@/lib/queries';

/**
 * A directory count for the stats strip: exact below 1,000, then K or M with one
 * decimal and a "+" (1234 → "1.2K+", 10000 → "10K+", 1250000 → "1.2M+").
 * Truncates rather than rounds so the "+" stays true: 1999 is "1.9K+", not "2K+".
 */
export function compactCount(n: number): string {
  if (n >= 1e6) return `${Math.floor(n / 1e5) / 10}M+`;
  if (n >= 1e3) return `${Math.floor(n / 1e2) / 10}K+`;
  return n.toLocaleString('en-US');
}

function Figure({
  icon,
  tone,
  value,
  label,
}: {
  icon: IconName;
  tone: string;
  value: string;
  label: string;
}) {
  return (
    <>
      <Icon name={icon} size={40} className={tone} />
      <div className="min-w-0">
        <p className="font-display text-on-surface text-[22px] leading-tight font-extrabold">
          {value}
        </p>
        <p className="text-secondary text-sm">{label}</p>
      </div>
    </>
  );
}

const FIVE = [1, 2, 3, 4, 5];

function StarRow({ className, width }: { className: string; width?: string }) {
  return (
    <span className={`flex ${className}`} style={width ? { width } : undefined}>
      {FIVE.map((i) => (
        <Icon key={i} name="star_filled" size={22} />
      ))}
    </span>
  );
}

/** Grey stars with gold ones clipped on top to the real average, so 4.3 fills 86%. */
function Rating({ reviews }: { reviews: ReviewSummary }) {
  const score = reviews.average.toFixed(1);
  const fill = `${(Math.min(Math.max(reviews.average, 0), 5) / 5) * 100}%`;
  const count = reviews.count.toLocaleString('en-US');
  return (
    // Below sm the cell is half of a 320px screen: stars, score and label stack.
    <div className="grid justify-items-center gap-y-1.5 sm:grid-cols-[auto_auto] sm:items-center sm:gap-x-3">
      <span aria-hidden className="relative flex">
        <StarRow className="text-[#d9dee7]" />
        <StarRow
          className="text-hero-star absolute inset-y-0 left-0 overflow-hidden"
          width={fill}
        />
      </span>
      <span aria-hidden className="font-display text-on-surface text-base leading-tight font-bold">
        {score}/5
      </span>
      <span aria-hidden className="text-secondary text-sm sm:col-start-1">
        User Reviews
      </span>
      <span className="sr-only">
        Average rating {score} out of 5 from {count} {reviews.count === 1 ? 'review' : 'reviews'}
      </span>
    </div>
  );
}

// Literal class names so Tailwind generates them: one column per visible cell on
// lg, two below it (a lone third cell spans both, see below).
const COLUMNS = [
  '',
  'grid-cols-1',
  'grid-cols-2',
  'grid-cols-2 lg:grid-cols-3',
  'grid-cols-2 lg:grid-cols-4',
];

// Stacked below sm, where a cell is half of a 320px screen; icon beside the text from sm up.
const CELL =
  'flex min-w-0 flex-col items-center justify-center gap-2 text-center sm:flex-row sm:gap-4 sm:text-left lg:py-1';

/**
 * The band under the dark hero. Every figure is live: a cell whose number
 * failed to load or is zero is left out, and the strip renders nothing when
 * all of them are. "100%" is a fact, not a figure: owners submit listings as
 * 'pending' and only staff can approve one, so every public listing was reviewed.
 */
export function HeroStats({
  stats,
  reviews,
}: {
  stats: DirectoryStats;
  reviews: ReviewSummary | null;
}) {
  const listings = stats.listings ?? 0;
  const cities = stats.cities ?? 0;
  const cells: { key: string; content: ReactNode }[] = [];
  if (listings > 0) {
    cells.push({
      key: 'listings',
      content: (
        <Figure
          icon="handshake"
          tone="text-[#16a34a]"
          value={compactCount(listings)}
          label="Active Businesses"
        />
      ),
    });
  }
  if (cities > 0) {
    cells.push({
      key: 'cities',
      content: (
        <Figure
          icon="location_city"
          tone="text-[#2f6fed]"
          value={compactCount(cities)}
          label="Cities Covered"
        />
      ),
    });
  }
  if (listings > 0) {
    cells.push({
      key: 'reviewed',
      content: (
        <Figure icon="schedule" tone="text-[#16a34a]" value="100%" label="Reviewed Listings" />
      ),
    });
  }
  if (reviews && reviews.count > 0) {
    cells.push({ key: 'rating', content: <Rating reviews={reviews} /> });
  }
  if (cells.length === 0) return null;

  return (
    <div className="bg-hero-strip">
      {/* The padding sits on the list, not the cells, so the lg dividers stop
          short of the band's edges as in the design. */}
      <ul
        aria-label="Directory at a glance"
        className={`container-page grid gap-x-4 gap-y-6 py-7 lg:gap-0 lg:divide-x lg:divide-[#dde3ee] lg:py-8 ${COLUMNS[cells.length]}`}
      >
        {cells.map((cell, i) => (
          <li
            key={cell.key}
            // A third cell alone on the second mobile row spans both columns, centred.
            className={[
              CELL,
              // lg: as in the design, figures sit left in their column, just after the
              // divider; the rating stays centred.
              cell.key === 'rating' ? '' : 'lg:justify-start lg:pl-8 lg:first:pl-0',
              cells.length === 3 && i === 2 ? 'col-span-2 lg:col-span-1' : '',
            ].join(' ')}
          >
            {cell.content}
          </li>
        ))}
      </ul>
    </div>
  );
}
