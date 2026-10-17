import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import { saveListingAsStaff } from '@/lib/listing-actions';
import { getListingFormOptions } from '@/lib/listing-options';
import { getOgOptions } from '@/lib/admin-media-options';
import { BackLink, PreviewNotice } from '@/components/admin/kit';
import { ListingEditor } from '@/components/admin/listing-editor';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Add listing' };

export default async function NewListing() {
  await requireRole('moderator');
  const supabase = await createClient();
  const [{ categories, cities }, { data: amenities }, ogOptions] = await Promise.all([
    getListingFormOptions(),
    supabase.from('amenities').select('id, name').order('sort_order').order('name'),
    getOgOptions(),
  ]);

  return (
    <>
      <div className="flex flex-col gap-2.5">
        <BackLink href="/admin/listings">All listings</BackLink>
        <h1 className="font-display m-0 text-2xl font-bold text-[#062347]">Add listing</h1>
        <div className="text-[13px] text-[#64748B]">
          Logo and photos can be added once the listing is saved.
        </div>
      </div>
      {cities.length === 0 ? (
        <PreviewNotice>
          Add at least one city under <Link href="/admin/locations">Locations</Link> first — every
          listing belongs to a city.
        </PreviewNotice>
      ) : (
        <ListingEditor
          action={saveListingAsStaff}
          categories={categories}
          cities={cities}
          amenities={(amenities ?? []) as { id: string; name: string }[]}
          ogOptions={ogOptions}
        />
      )}
    </>
  );
}
