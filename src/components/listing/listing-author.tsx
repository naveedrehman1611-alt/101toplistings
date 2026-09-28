import Image from 'next/image';
import Link from 'next/link';
import type { ListingDetail, ListingImage } from '@/lib/queries';

/**
 * The business is the author of its own listing. Who owns the account behind it
 * is internal and never shown publicly (criterion 50).
 */
export function ListingAuthor({
  listing,
  logo,
}: {
  listing: Pick<ListingDetail, 'slug' | 'name' | 'phone_primary' | 'verification'>;
  logo: ListingImage | null;
}) {
  const initial = Array.from(listing.name.trim())[0]?.toUpperCase() ?? '?';
  const phone = listing.phone_primary?.trim() || null;

  return (
    <section className="surface-card p-5">
      <h2 className="font-display text-lg font-semibold">Author</h2>

      <div className="mt-4 flex items-center gap-3">
        {logo ? (
          <Image
            src={logo.url}
            alt={`${listing.name} logo`}
            width={48}
            height={48}
            className="size-12 shrink-0 rounded-full border border-[var(--border)] bg-[var(--surface)] object-contain"
          />
        ) : (
          <span
            aria-hidden
            className="bg-brand-700 flex size-12 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white"
          >
            {initial}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="font-semibold">{listing.name}</h3>
          {phone ? (
            <a
              href={`tel:${phone.replace(/\s+/g, '')}`}
              className="text-brand-700 text-sm hover:underline"
            >
              {phone}
            </a>
          ) : null}
        </div>
      </div>

      {listing.verification === 'verified' ? (
        <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          Verified business
        </p>
      ) : (
        <p className="mt-4 text-sm">
          <span className="text-[var(--text-muted)]">Own this business? </span>
          <Link
            href={`/listing/${listing.slug}/claim`}
            className="text-brand-700 font-medium hover:underline"
          >
            Claim it for free
          </Link>
        </p>
      )}

      <a
        href="#contact-author"
        className="bg-brand-700 hover:bg-brand-800 mt-4 flex h-11 w-full items-center justify-center rounded-lg px-5 text-sm font-medium text-white"
      >
        Contact Author
      </a>
      <p className="mt-3 text-center text-xs">
        <Link
          href={`/listing/${listing.slug}/report`}
          className="text-[var(--text-muted)] hover:underline"
        >
          Report a problem with this listing
        </Link>
      </p>
    </section>
  );
}
