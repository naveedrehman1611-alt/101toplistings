import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { SimilarListing } from '@/lib/queries';
import { Stars } from '@/components/ui';
import { OpenStatusBadge } from './open-status-badge';

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4 shrink-0"
    >
      {children}
    </svg>
  );
}

const PhoneIcon = () => (
  <Icon>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
  </Icon>
);
const PinIcon = () => (
  <Icon>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </Icon>
);
const TagIcon = () => (
  <Icon>
    <path d="M12.59 2.59A2 2 0 0 0 11.17 2H4a2 2 0 0 0-2 2v7.17a2 2 0 0 0 .59 1.42l8.7 8.7a2.43 2.43 0 0 0 3.42 0l6.58-6.58a2.43 2.43 0 0 0 0-3.42Z" />
    <circle cx="7.5" cy="7.5" r="1" />
  </Icon>
);

/** One icon row; the label is for screen readers, the icon stands in for it visually. */
function Row({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <dt className="text-brand-700 shrink-0">
        {icon}
        <span className="sr-only">{label}</span>
      </dt>
      <dd className="min-w-0 truncate">{children}</dd>
    </div>
  );
}

function SimilarCard({
  listing: l,
  cityName,
  category,
}: {
  listing: SimilarListing;
  cityName: string | undefined;
  category: { name: string; slug: string } | undefined;
}) {
  const phone = l.phone_primary?.trim();
  const hasRows = Boolean(phone || cityName || category);

  return (
    <article className="surface-card relative flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
      {/* Decorative cover: the name below is the link text, so alt is empty. The
          gradient is the same fallback the listing cards use. */}
      <div className="from-brand-600 to-brand-800 relative aspect-[3/1] bg-gradient-to-br">
        {l.cover_url ? (
          <Image
            src={l.cover_url}
            alt=""
            fill
            sizes="(min-width: 1024px) 25rem, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : null}
        <div className="absolute top-2 left-2">
          <OpenStatusBadge hours={l.hours} />
        </div>
        {l.is_featured ? (
          // White underlay keeps the translucent badge legible on a photo.
          <span className="absolute top-2 right-2 rounded-full bg-white">
            <span className="bg-accent-400/20 text-accent-600 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold">
              Featured
            </span>
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display leading-snug font-semibold">
          {/* Stretched link: its ::after covers the card, so the whole card is
              clickable; the phone and category links sit above it (z-10). */}
          <Link
            href={`/listing/${l.slug}`}
            className="hover:text-brand-700 after:absolute after:inset-0"
          >
            {l.name}
          </Link>
        </h3>
        {l.tagline ? (
          <p className="mt-1 line-clamp-2 text-sm text-[var(--text-muted)]">{l.tagline}</p>
        ) : null}
        <div className="mt-2 empty:hidden">
          <Stars value={l.rating_average} count={l.review_count} />
        </div>
        {hasRows ? (
          <dl className="mt-auto space-y-1.5 pt-3 text-sm text-[var(--text-muted)]">
            {phone ? (
              <Row icon={<PhoneIcon />} label="Phone">
                <a
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  className="hover:text-brand-700 relative z-10 hover:underline"
                >
                  {phone}
                </a>
              </Row>
            ) : null}
            {cityName ? (
              <Row icon={<PinIcon />} label="City">
                {cityName}
              </Row>
            ) : null}
            {category ? (
              <Row icon={<TagIcon />} label="Category">
                <Link
                  href={`/category/${category.slug}`}
                  className="hover:text-brand-700 relative z-10 hover:underline"
                >
                  {category.name}
                </Link>
              </Row>
            ) : null}
          </dl>
        ) : null}
      </div>
    </article>
  );
}

export function SimilarListings({
  listings,
  cityNames,
  categories,
}: {
  listings: SimilarListing[];
  cityNames: Map<string, string>;
  categories: Map<string, { name: string; slug: string }>;
}) {
  if (listings.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-semibold">Similar Listings</h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((l) => (
          <SimilarCard
            key={l.id}
            listing={l}
            cityName={l.city_id ? cityNames.get(l.city_id) : undefined}
            category={l.category_id ? categories.get(l.category_id) : undefined}
          />
        ))}
      </div>
    </section>
  );
}
