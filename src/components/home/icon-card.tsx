// Prefetch on intent, not on sight: see hover-prefetch-link.tsx.
import { HoverPrefetchLink as Link } from '@/components/hover-prefetch-link';
import { Icon, isIconName } from '@/components/icons';
import type { CardVM } from '@/lib/home-types';

// The whole card is the click target, but the link's accessible name stays the
// title (and the site-wide focus ring marks the title).
const STRETCHED_LINK =
  'transition-colors after:absolute after:inset-0 after:rounded-lg hover:text-brand-700';

/** The round-icon card shared by the icon-card grids and the services carousel. */
export function IconCard({
  card,
  titleCase,
  step,
  bordered,
}: {
  card: CardVM;
  /** The reference Title-Cases the card text in CSS, so editors can type it normally. */
  titleCase: boolean;
  /** 1-based position, shown as "Step n" for how-it-works sequences. */
  step?: number;
  /** The hairline border only reads on a white band. */
  bordered: boolean;
}) {
  return (
    <div
      className={`relative flex h-full flex-col items-center rounded-lg bg-white px-8 py-10 text-center ${
        bordered ? 'border-ink-200 border' : ''
      } ${card.href ? 'transition-shadow hover:shadow-[var(--shadow-card-hover)]' : ''}`}
    >
      {isIconName(card.icon) ? (
        <span className="grid size-[110px] shrink-0 place-items-center rounded-full bg-[var(--surface-2)]">
          <Icon name={card.icon} size={40} strokeWidth={1.5} className="text-brand-700" />
        </span>
      ) : null}
      {step ? (
        <p className="text-brand-700 mt-7 text-xs font-medium tracking-wider uppercase first:mt-0">
          Step {step}
        </p>
      ) : null}
      <h3
        className={`text-ink-900 text-lg leading-snug font-medium first:mt-0 ${step ? 'mt-2' : 'mt-7'}`}
      >
        {card.href ? (
          <Link href={card.href} className={STRETCHED_LINK}>
            {card.title}
          </Link>
        ) : (
          card.title
        )}
      </h3>
      {card.body ? (
        <p className={`text-ink-500 mt-3 text-sm leading-[1.75] ${titleCase ? 'capitalize' : ''}`}>
          {card.body}
        </p>
      ) : null}
    </div>
  );
}
