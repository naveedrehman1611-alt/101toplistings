import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import { ErrorNotice, PageHeader, PreviewNotice } from '@/components/admin/kit';
import { CatalogPreview, type CatalogItem } from '@/components/admin/catalog-preview';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Amenities' };

export default async function AdminAmenities() {
  await requireRole('editor');
  const supabase = await createClient();
  const [{ data, error }, { data: used }] = await Promise.all([
    supabase.from('amenities').select('id, name, slug').order('sort_order').order('name'),
    supabase.from('listing_amenities').select('amenity_id').limit(50000),
  ]);
  const uses = new Map<string, number>();
  for (const l of used ?? [])
    uses.set(l.amenity_id as string, (uses.get(l.amenity_id as string) ?? 0) + 1);

  const items: CatalogItem[] = (data ?? []).map((a) => ({
    id: a.id as string,
    name: a.name as string,
    slug: a.slug as string,
    group: '',
    count: uses.get(a.id as string) ?? 0,
  }));

  return (
    <>
      <PageHeader
        title="Amenities"
        isNew
        description="Features a business can tick on its listing, such as Wi-Fi or Parking."
      />
      <PreviewNotice>
        Preview: these are the amenities in the database and how many listings use each. Adding and
        deleting here is not saved yet.
      </PreviewNotice>
      {error ? <ErrorNotice>Could not load amenities: {error.message}</ErrorNotice> : null}
      <CatalogPreview
        noun="amenity"
        nameLabel="Amenity"
        groups={[]}
        items={items}
        countNoun="listing"
      />
    </>
  );
}
