import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/components/icon';
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
      <h2 className="font-title-md text-title-md text-on-surface">Author</h2>

      <div className="mt-4 flex items-center gap-3">
        {logo ? (
          <Image
            src={logo.url}
            alt={`${listing.name} logo`}
            width={48}
            height={48}
            className="border-border-subtle bg-surface-card size-12 shrink-0 rounded-full border object-contain"
          />
        ) : (
          <span
            aria-hidden
            className="bg-primary-container text-on-primary font-headline-sm text-headline-sm flex size-12 shrink-0 items-center justify-center rounded-full"
          >
            {initial}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="font-title-md text-title-md text-on-surface">{listing.name}</h3>
          {phone ? (
            <a
              href={`tel:${phone.replace(/\s+/g, '')}`}
              className="font-body-sm text-body-sm text-primary-container hover:underline"
            >
              {phone}
            </a>
          ) : null}
        </div>
      </div>

      {listing.verification === 'verified' ? (
        <p className="font-label-md text-label-md text-primary-container mt-4 inline-flex items-center gap-1.5">
          <Icon name="verified" size={16} />
          Verified business
        </p>
      ) : (
        <p className="font-body-sm text-body-sm mt-4">
          <span className="text-secondary">Own this business? </span>
          <Link
            href={`/listing/${listing.slug}/claim`}
            className="text-primary-container font-medium hover:underline"
          >
            Claim it for free
          </Link>
        </p>
      )}

      <a
        href="#contact-author"
        className="bg-primary-container text-on-primary hover:bg-primary font-label-md text-label-md focus-visible:ring-primary-container mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg px-5 shadow-xs transition hover:shadow-[0_4px_12px_rgba(12,130,38,0.25)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
      >
        Contact Author
      </a>
      <p className="font-body-sm text-body-sm mt-3 text-center">
        <Link href={`/listing/${listing.slug}/report`} className="text-secondary hover:underline">
          Report a problem with this listing
        </Link>
      </p>
    </section>
  );
}
