import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { requireRole, roleAtLeast } from '@/lib/auth';
import { deleteListing, saveListingAsStaff } from '@/lib/listing-actions';
import { LISTING_EDIT_COLUMNS, getListingFormOptions } from '@/lib/listing-options';
import { getOgOptions } from '@/lib/admin-media-options';
import type { EditableHour, EditableListing } from '@/components/listing-form';
import { ListingImages } from '@/components/listing-images';
import { BackLink, Pill, btn, label, toneOf } from '@/components/admin/kit';
import { ConfirmButton } from '@/components/admin/dialog';
import { ListingEditor } from '@/components/admin/listing-editor';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Edit listing' };

export default async function EditListing({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole('moderator');
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createClient();
  const [{ data: listing }, { data: hours }, options, { data: amenities }, { data: chosen }, ogOptions] =
    await Promise.all([
      supabase.from('listings').select(`${LISTING_EDIT_COLUMNS}, area_id`).eq('id', id).maybeSingle(),
      supabase
        .from('opening_hours')
        .select('day_of_week, opens_at, closes_at, is_closed, is_24h')
        .eq('listing_id', id),
      getListingFormOptions(),
      supabase.from('amenities').select('id, name').order('sort_order').order('name'),
      supabase.from('listing_amenities').select('amenity_id').eq('listing_id', id),
      getOgOptions(),
    ]);
  if (!listing) notFound();
  const l = listing as unknown as EditableListing & {
    area_id: string | null;
    owner_user_id: string | null;
  };

  const [{ data: owner }, { data: areas }] = await Promise.all([
    l.owner_user_id
      ? supabase.from('profiles').select('display_name').eq('id', l.owner_user_id).maybeSingle()
      : Promise.resolve({ data: null }),
    l.city_id
      ? supabase.from('areas').select('id, name').eq('city_id', l.city_id).order('name')
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
  ]);
  const ownerName = (owner as { display_name: string | null } | null)?.display_name ?? null;
  const category = options.categories.find((c) => c.id === l.category_id)?.name ?? 'No category';
  const city = options.cities.find((c) => c.id === l.city_id)?.label ?? 'No city';
  const canDelete = roleAtLeast(user.role, 'admin');

  return (
    <>
      <div className="flex flex-col gap-2.5">
        <BackLink href="/admin/listings">All listings</BackLink>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display m-0 text-2xl font-bold text-[#062347]">{l.name}</h1>
          <Pill tone={toneOf(l.status)}>{label(l.status)}</Pill>
          <div className="ml-auto flex gap-2">
            {l.status === 'approved' ? (
              <a
                href={`/listing/${l.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${btn.secondary} hover:no-underline`}
              >
                View on site ↗
              </a>
            ) : null}
            {canDelete ? (
              <form action={deleteListing}>
                <input type="hidden" name="id" value={l.id} />
                <ConfirmButton
                  className={btn.dangerGhost}
                  title="Delete this listing permanently?"
                  body="Its hours and reviews go too. This can’t be undone; suspend it instead to hide it."
                  ok="Delete permanently"
                  danger
                >
                  Delete permanently
                </ConfirmButton>
              </form>
            ) : null}
          </div>
        </div>
        <div className="text-[13px] text-[#64748B]">
          {category} · {city} · Owner: {ownerName ?? 'none'}
        </div>
      </div>

      <ListingEditor
        // A fresh form after each save, so it starts from what was stored.
        key={JSON.stringify([l, hours])}
        action={saveListingAsStaff}
        listing={l}
        hours={(hours ?? []) as EditableHour[]}
        categories={options.categories}
        cities={options.cities}
        amenities={(amenities ?? []) as { id: string; name: string }[]}
        selectedAmenities={(chosen ?? []).map((c) => c.amenity_id as string)}
        areas={(areas ?? []) as { id: string; name: string }[]}
        ownerName={ownerName}
        ogOptions={ogOptions}
        images={<ListingImages listingId={l.id} context="admin" />}
      />
    </>
  );
}
