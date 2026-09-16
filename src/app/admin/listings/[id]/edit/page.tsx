import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Card, PageHeader, StatusPill } from '@/components/admin/chrome';
import {
  ListingForm,
  emptyListingValues,
  type ListingFormOptions,
  type ListingFormValues,
} from '../../listing-form';
import { DAY_NAMES, type ListingFormStatus, type SocialLink } from '@/lib/listing-schema';
import type { AttachedImage } from '../../image-manager';
import type { OpeningHoursValue } from '../../opening-hours-field';

/**
 * Edit. Reads through the admin's own JWT so a draft, pending or suspended row
 * is visible (listings_public_read only exposes approved ones).
 *
 * rating_average, review_count, geo, created_by, last_updated_by and
 * published_at are deliberately absent from the form: they are trigger- or
 * server-owned, and admin_save_listing does not accept them.
 */
export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireRole('admin', `/admin/listings/${id}/edit`);

  const supabase = await createClient();

  const { data: listing } = await supabase
    .from('listings')
    .select(
      'id, slug, name, tagline, description, category_id, subcategory_id, ' +
        'phone_primary, phone_secondary, email, website, address, postal_code, ' +
        'country_id, region_id, city_id, area_id, latitude, longitude, ' +
        'social_links, video_url, seo_title, seo_description, is_featured, ' +
        'status, rejection_note, rating_average, review_count, published_at, updated_at',
    )
    .eq('id', id)
    // The select list is built by concatenation, so supabase-js cannot infer the
    // row type from the literal; it is declared here instead.
    .maybeSingle<DbRow>();

  if (!listing) notFound();

  const [options, hours, amenityRows, imageRows] = await Promise.all([
    loadListingFormOptions(),
    supabase
      .from('opening_hours')
      .select('day_of_week, opens_at, closes_at, is_closed, is_24h')
      .eq('listing_id', id)
      .returns<DbRow[]>(),
    supabase.from('listing_amenities').select('amenity_id').eq('listing_id', id).returns<DbRow[]>(),
    supabase
      .from('listing_images')
      .select('media_id, kind, sort_order, media:media!media_id (path, alt)')
      .eq('listing_id', id)
      .order('sort_order')
      .returns<DbRow[]>(),
  ]);

  const values = toFormValues(
    listing,
    hours.data ?? [],
    amenityRows.data ?? [],
    imageRows.data ?? [],
  );

  return (
    <>
      <PageHeader
        title={listing.name as string}
        description={`/listing/${listing.slug as string}`}
        action={
          listing.status === 'approved' ? (
            <Link
              href={`/listing/${listing.slug as string}`}
              className="text-brand-700 text-sm font-medium hover:underline"
            >
              View live page →
            </Link>
          ) : undefined
        }
      />

      <Card className="flex flex-wrap items-center gap-x-6 gap-y-2 p-4 text-sm">
        <span className="flex items-center gap-2">
          <span className="text-[var(--text-muted)]">Status</span>
          <StatusPill status={listing.status as string} />
        </span>
        <span className="text-[var(--text-muted)]">
          Last updated {new Date(listing.updated_at as string).toLocaleString('en-GB')}
        </span>
        {listing.published_at ? (
          <span className="text-[var(--text-muted)]">
            Published {new Date(listing.published_at as string).toLocaleDateString('en-GB')}
          </span>
        ) : null}
        <span className="text-[var(--text-muted)]">
          {/* Aggregates are trigger-owned; shown for context, never editable. */}
          {(listing.review_count as number) > 0
            ? `${(listing.rating_average as number).toFixed(1)} from ${listing.review_count} reviews`
            : 'No reviews yet'}
        </span>
        <span className="text-[var(--text-muted)]">
          {values.images.length} image{values.images.length === 1 ? '' : 's'} attached
        </span>
      </Card>

      {listing.rejection_note ? (
        <div className="rounded-lg border border-[#ecc2be] bg-[#fbeceb] px-4 py-3 text-sm text-[#96231b]">
          <p className="font-medium">Moderation note</p>
          <p className="mt-1">{listing.rejection_note as string}</p>
        </div>
      ) : null}

      <ListingForm
        options={options}
        values={values}
        currentStatus={listing.status as string}
        rejectionNote={(listing.rejection_note as string | null) ?? null}
      />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* row -> form values                                                          */
/* -------------------------------------------------------------------------- */

type DbRow = Record<string, unknown>;

const str = (value: unknown): string =>
  value === null || value === undefined ? '' : String(value);

/** '10:00:00' from Postgres, but <input type="time"> wants '10:00'. */
const toTimeInput = (value: unknown): string => str(value).slice(0, 5);

function toSocialLinks(value: unknown): SocialLink[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map((item) => ({ label: str(item.label), url: str(item.url) }))
    .filter((link) => link.label !== '' || link.url !== '');
}

function toFormValues(
  listing: DbRow,
  hourRows: DbRow[],
  amenityRows: DbRow[],
  imageRows: DbRow[],
): ListingFormValues {
  const hours: OpeningHoursValue = DAY_NAMES.map((_, day) => {
    const row = hourRows.find((candidate) => candidate.day_of_week === day);
    // No row for a day is "not set" — the absence is the value, so it must
    // survive the round trip and come back as an unset radio.
    if (!row) return { mode: '' as const, opensAt: '', closesAt: '' };
    if (row.is_closed) return { mode: 'closed' as const, opensAt: '', closesAt: '' };
    if (row.is_24h) return { mode: '24h' as const, opensAt: '', closesAt: '' };
    return {
      mode: 'open' as const,
      opensAt: toTimeInput(row.opens_at),
      closesAt: toTimeInput(row.closes_at),
    };
  });

  const images: AttachedImage[] = imageRows.map((row) => {
    const media = (row.media ?? null) as { path?: unknown; alt?: unknown } | null;
    return {
      mediaId: str(row.media_id),
      path: str(media?.path),
      alt: str(media?.alt),
      kind: (row.kind === 'cover' || row.kind === 'logo' ? row.kind : 'gallery') as
        'cover' | 'logo' | 'gallery',
    };
  });

  // rejected/suspended are not offered in the editor's status select, so an
  // existing verdict opens as 'pending' — clearing it is a deliberate re-queue,
  // not an accident.
  const status: ListingFormStatus =
    listing.status === 'approved' || listing.status === 'draft' || listing.status === 'pending'
      ? listing.status
      : 'pending';

  return {
    ...emptyListingValues(),
    id: str(listing.id),
    name: str(listing.name),
    slug: str(listing.slug),
    tagline: str(listing.tagline),
    description: str(listing.description),
    category_id: str(listing.category_id),
    subcategory_id: str(listing.subcategory_id),
    phone_primary: str(listing.phone_primary),
    phone_secondary: str(listing.phone_secondary),
    email: str(listing.email),
    website: str(listing.website),
    address: str(listing.address),
    postal_code: str(listing.postal_code),
    country_id: str(listing.country_id),
    region_id: str(listing.region_id),
    city_id: str(listing.city_id),
    area_id: str(listing.area_id),
    latitude: str(listing.latitude),
    longitude: str(listing.longitude),
    social_links: toSocialLinks(listing.social_links),
    video_url: str(listing.video_url),
    seo_title: str(listing.seo_title),
    seo_description: str(listing.seo_description),
    is_featured: listing.is_featured === true,
    status,
    hours,
    amenityIds: amenityRows.map((row) => str(row.amenity_id)),
    images,
  };
}

/** Same option load as the create page; see the note there on reading them whole. */
async function loadListingFormOptions(): Promise<ListingFormOptions> {
  const supabase = await createClient();

  const [categories, countries, regions, cities, areas, amenities] = await Promise.all([
    supabase.from('categories').select('id, name, parent_id').order('name'),
    supabase.from('countries').select('id, name').order('name'),
    supabase.from('regions').select('id, name, country_id').order('name'),
    supabase.from('cities').select('id, name, region_id').order('name'),
    supabase.from('areas').select('id, name, city_id').order('name'),
    supabase.from('amenities').select('id, name').order('sort_order').order('name'),
  ]);

  return {
    categories: categories.data ?? [],
    countries: countries.data ?? [],
    regions: regions.data ?? [],
    cities: cities.data ?? [],
    areas: areas.data ?? [],
    amenities: amenities.data ?? [],
  };
}
