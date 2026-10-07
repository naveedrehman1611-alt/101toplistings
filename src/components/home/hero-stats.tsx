import type { CSSProperties, ReactNode } from 'react';
import { Icon, type IconName } from '@/components/icon';
import type { DirectoryStats, ReviewSummary } from '@/lib/queries';
import { CountUp } from './count-up';

// Bobs up and down; each cell sets --float-delay so the icons move out of step.
const FLOAT = 'inline-flex motion-safe:animate-float';

function Figure({
  icon,
  tone,
  value,
  label,
}: {
  icon: IconName;
  tone: string;
  value: ReactNode;
  label: string;
}) {
  return (
    <>
      <span className={`${FLOAT} ${tone}`}>
        <Icon name={icon} size={40} />
      </span>
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
  const average = Math.min(Math.max(reviews.average, 0), 5);
  const score = average.toFixed(1);
  const fill = `${(average / 5) * 100}%`;
  const count = reviews.count.toLocaleString('en-US');
  return (
    // Below sm the cell is half of a 320px screen: stars, score and label stack.
    <div className="grid justify-items-center gap-y-1.5 sm:grid-cols-[auto_auto] sm:items-center sm:gap-x-3">
      <span aria-hidden className={`relative ${FLOAT}`}>
        <StarRow className="text-[#d9dee7]" />
        <StarRow
          className="text-hero-star absolute inset-y-0 left-0 overflow-hidden"
          width={fill}
        />
      </span>
      <span aria-hidden className="font-display text-on-surface text-base leading-tight font-bold">
        <CountUp to={average} format="score" />
        /5
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
          value={<CountUp to={listings} format="compact" />}
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
          value={<CountUp to={cities} format="compact" />}
          label="Cities Covered"
        />
      ),
    });
  }
  if (listings > 0) {
    cells.push({
      key: 'reviewed',
      content: (
        <Figure
          icon="schedule"
          tone="text-[#16a34a]"
          value={<CountUp to={100} format="percent" />}
          label="Reviewed Listings"
        />
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
            // Cells rise in one after another, then their icons float out of step.
            style={
              {
                '--rise-delay': `${i * 120}ms`,
                '--float-delay': `${i * -0.8}s`,
              } as CSSProperties
            }
            // A third cell alone on the second mobile row spans both columns, centred.
            className={[
              CELL,
              'motion-safe:animate-rise',
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
