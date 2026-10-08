import Image from 'next/image';
import Link from 'next/link';
import { SITE_TIME_ZONE, type BrowseRow, type OpenState } from '@/lib/browse';
import { Icon } from '@/components/icon';
import { Stars } from '@/components/ui';

// Only the numbers come from Intl. Month names do not: en-GB prints "Sep" or
// "Sept" depending on the runtime's ICU data, and the page must read the same
// on every server.
const DATE_PARTS = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
  timeZone: SITE_TIME_ZONE,
});
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "27 Sep 2026", in Pakistan time. */
function formatDate(date: Date): string {
  const parts = Object.fromEntries(DATE_PARTS.formatToParts(date).map((p) => [p.type, p.value]));
  return `${parts.day} ${MONTHS[Number(parts.month) - 1]} ${parts.year}`;
}

const PILL = 'font-badge text-badge inline-flex items-center gap-1 rounded-full px-2.5 py-1';
const META_LINK = 'hover:text-primary-container hover:underline';
const ACTION =
  'font-label-md text-label-md inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg px-4 whitespace-nowrap transition-colors sm:flex-none';

// Only characters that appear in written phone numbers. Counting digits alone
// would dial an address that has a house number and a postcode in it.
const PHONE_CHARS = /^[\d\s()+.‐-―-]+$/;

/** The number to dial, or null when the phone field holds free text. */
function dialable(phone: string | null): string | null {
  if (!phone || !PHONE_CHARS.test(phone)) return null;
  const stripped = phone.replace(/[^\d+]/g, '');
  const digits = stripped.replace(/\D/g, '').length;
  return digits >= 7 && digits <= 15 ? stripped : null;
}

/** First letter or digit, so "(The) Barber" shows "T" rather than "(". */
function initial(name: string): string {
  return (name.match(/[\p{L}\p{N}]/u)?.[0] ?? '').toUpperCase();
}

export function ListingRow({ row, rank }: { row: BrowseRow; rank: number }) {
  const headingId = `listing-${row.id}`;
  const href = `/listing/${row.slug}`;
  const tel = dialable(row.phone);
  const date = row.publishedAt ? new Date(row.publishedAt) : null;
  const published = date && !Number.isNaN(date.getTime()) ? date : null;

  return (
    <article
      aria-labelledby={headingId}
      className="bg-surface-card flex flex-wrap gap-4 rounded-2xl p-4 shadow-md transition-shadow duration-300 hover:shadow-xl sm:flex-nowrap sm:p-5"
    >
      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-2)] sm:size-20">
        {row.coverUrl ? (
          <Image src={row.coverUrl} alt="" fill sizes="80px" className="object-cover" />
        ) : (
          <div
            aria-hidden
            className="bg-hero-navy font-display grid size-full place-items-center text-2xl font-semibold text-white"
          >
            {initial(row.name)}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        {/* The rank gets its own column so a long name wraps beside it rather
            than leaving it alone on the first line. */}
        <div className="flex items-baseline gap-2">
          <span className="shrink-0 text-sm font-semibold text-[var(--text-muted)] tabular-nums">
            #{rank}
          </span>
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <h3
              id={headingId}
              className="font-headline-sm text-headline-sm text-on-surface min-w-0 wrap-break-word"
            >
              <Link href={href} className="hover:text-primary-container transition-colors">
                {row.name}
              </Link>
            </h3>
            {row.isFeatured ? (
              // The listing card's gold badge; its dark text keeps AA contrast.
              <span className={`${PILL} bg-badge-gold text-on-secondary-fixed`}>
                <Icon name="star" size={14} />
                Featured
              </span>
            ) : null}
            <OpenBadge state={row.open} />
          </div>
        </div>

        {row.category || row.city ? (
          <p className="font-body-sm text-body-sm text-secondary mt-1">
            {row.category ? (
              <Link
                href={`/category/${row.category.slug}`}
                className={`${META_LINK} text-primary-container font-semibold`}
              >
                {row.category.name}
              </Link>
            ) : null}
            {row.category && row.city ? <span aria-hidden>{' · '}</span> : null}
            {row.city ? (
              <Link href={`/city/${row.city.slug}`} className={META_LINK}>
                {row.city.name}
              </Link>
            ) : null}
          </p>
        ) : null}

        {row.excerpt ? (
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 line-clamp-2 wrap-break-word">
            {row.excerpt}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm empty:hidden">
          {row.phone ? (
            <span className="flex min-w-0 items-start gap-1.5">
              <Icon name="call" size={16} className="text-primary-container mt-0.5" />
              <span className="sr-only">Phone: </span>
              {tel ? (
                <a
                  href={`tel:${tel}`}
                  className="text-on-surface hover:text-primary-container font-semibold"
                >
                  {row.phone}
                </a>
              ) : (
                <span className="min-w-0 wrap-break-word">{row.phone}</span>
              )}
            </span>
          ) : null}
          {published ? (
            <time dateTime={published.toISOString()} className="text-[var(--text-muted)]">
              Published {formatDate(published)}
            </time>
          ) : null}
          <Stars value={row.rating} count={row.reviewCount} />
        </div>
      </div>

      {/* Below the text on phones, where Call is the main action, and a
          column on the right from sm up. */}
      <div className="flex w-full gap-2 sm:w-auto sm:shrink-0 sm:flex-col">
        <Link
          href={href}
          aria-label={`View details for ${row.name}`}
          className={`${ACTION} bg-primary-container text-on-primary hover:bg-primary`}
        >
          View details
          <Icon name="arrow_forward" size={16} />
        </Link>
        {tel ? (
          <a
            href={`tel:${tel}`}
            aria-label={`Call ${row.name}`}
            className={`${ACTION} border border-[var(--border)] hover:bg-[var(--surface-2)]`}
          >
            <Icon name="call" size={16} />
            Call
          </a>
        ) : null}
      </div>
    </article>
  );
}

function OpenBadge({ state }: { state: OpenState }) {
  if (state === 'open') {
    return <span className={`${PILL} bg-brand-50 text-brand-800`}>Open now</span>;
  }
  if (state === 'closed') {
    return <span className={`${PILL} bg-red-50 text-red-700`}>Closed</span>;
  }
  return null;
}
