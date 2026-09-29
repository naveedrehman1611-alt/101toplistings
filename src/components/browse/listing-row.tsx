import Image from 'next/image';
import Link from 'next/link';
import { SITE_TIME_ZONE, type BrowseRow, type OpenState } from '@/lib/browse';
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

const PILL = 'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium';
const META_LINK = 'hover:text-brand-700 hover:underline';
const ACTION =
  'inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-medium whitespace-nowrap transition-colors sm:flex-none';

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
      className="surface-card flex flex-wrap gap-4 p-4 sm:flex-nowrap sm:p-5"
    >
      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-2)] sm:size-20">
        {row.coverUrl ? (
          <Image src={row.coverUrl} alt="" fill sizes="80px" className="object-cover" />
        ) : (
          <div
            aria-hidden
            className="from-brand-600 to-brand-800 font-display grid size-full place-items-center bg-gradient-to-br text-2xl font-semibold text-white"
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
              className="font-display min-w-0 text-lg leading-snug font-semibold wrap-break-word"
            >
              <Link href={href} className="hover:text-brand-700">
                {row.name}
              </Link>
            </h3>
            {row.isFeatured ? (
              // accent-600 text on this tint is about 3.5:1, short of AA at
              // this size, so only the star carries the accent colour.
              <span className={`${PILL} bg-accent-400/15 text-ink-800`}>
                <span aria-hidden className="text-accent-500">
                  ★
                </span>
                Featured
              </span>
            ) : null}
            <OpenBadge state={row.open} />
          </div>
        </div>

        {row.category || row.city ? (
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {row.category ? (
              <Link href={`/category/${row.category.slug}`} className={META_LINK}>
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
          <p className="mt-2 line-clamp-2 text-sm wrap-break-word text-[var(--text-muted)]">
            {row.excerpt}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm empty:hidden">
          {row.phone ? (
            <span className="flex min-w-0 items-start gap-1.5">
              <PhoneIcon className="mt-0.5 size-4 shrink-0 text-[var(--text-muted)]" />
              <span className="sr-only">Phone: </span>
              {tel ? (
                <a href={`tel:${tel}`} className="text-brand-700 hover:underline">
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
          className={`${ACTION} bg-brand-700 hover:bg-brand-800 text-white`}
        >
          View details
        </Link>
        {tel ? (
          <a
            href={`tel:${tel}`}
            aria-label={`Call ${row.name}`}
            className={`${ACTION} border border-[var(--border)] hover:bg-[var(--surface-2)]`}
          >
            <PhoneIcon className="size-4" />
            Call
          </a>
        ) : null}
      </div>
    </article>
  );
}

function OpenBadge({ state }: { state: OpenState }) {
  if (state === 'open') {
    return <span className={`${PILL} bg-emerald-50 text-emerald-700`}>Open now</span>;
  }
  if (state === 'closed') {
    return <span className={`${PILL} bg-red-50 text-red-700`}>Closed</span>;
  }
  return null;
}

function PhoneIcon({ className }: { className: string }) {
  return (
    <svg aria-hidden viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        d="M2 3.5A1.5 1.5 0 0 1 3.5 2h1.148a1.5 1.5 0 0 1 1.465 1.175l.513 2.307a1.5 1.5 0 0 1-.425 1.426l-.933.861a.75.75 0 0 0-.174.868 11.042 11.042 0 0 0 5.968 5.968.75.75 0 0 0 .868-.174l.861-.933a1.5 1.5 0 0 1 1.426-.425l2.307.513A1.5 1.5 0 0 1 18 15.352V16.5a1.5 1.5 0 0 1-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 0 1 2.43 8.326 13.019 13.019 0 0 1 2 5V3.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
