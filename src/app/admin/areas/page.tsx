import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import { ErrorNotice, PageHeader, PreviewNotice } from '@/components/admin/kit';
import { CatalogPreview, type CatalogItem } from '@/components/admin/catalog-preview';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Areas' };

export default async function AdminAreas() {
  await requireRole('editor');
  const supabase = await createClient();
  const [{ data, error }, { data: cities }, { data: used }] = await Promise.all([
    supabase.from('areas').select('id, name, slug, city_id').order('name'),
    supabase.from('cities').select('id, name').order('name'),
    supabase.from('listings').select('area_id').not('area_id', 'is', null).limit(20000),
  ]);
  const cityName = new Map((cities ?? []).map((c) => [c.id as string, c.name as string]));
  const uses = new Map<string, number>();
  for (const l of used ?? [])
    uses.set(l.area_id as string, (uses.get(l.area_id as string) ?? 0) + 1);

  const items: CatalogItem[] = (data ?? []).map((a) => ({
    id: a.id as string,
    name: a.name as string,
    slug: a.slug as string,
    group: cityName.get(a.city_id as string) ?? '—',
    count: uses.get(a.id as string) ?? 0,
  }));
  // Only cities that have areas get a filter pill; Add offers every city.
  const withAreas = [...new Set(items.map((i) => i.group))].sort();
  const allCities = (cities ?? []).map((c) => c.name as string);

  return (
    <>
      <PageHeader
        title="Areas"
        isNew
        description="Neighbourhoods inside a city, used for filters and listing pages."
      />
      <PreviewNotice>
        Preview: these are the areas in the database. Adding and deleting here is not saved yet.
      </PreviewNotice>
      {error ? <ErrorNotice>Could not load areas: {error.message}</ErrorNotice> : null}
      <CatalogPreview
        noun="area"
        nameLabel="Area"
        groupLabel="City"
        groups={withAreas.length ? withAreas : allCities}
        items={items}
        countNoun="listing"
      />
    </>
  );
}
