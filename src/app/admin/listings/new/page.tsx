import { requireRole } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/admin/chrome';
import { ListingForm, emptyListingValues, type ListingFormOptions } from '../listing-form';

/**
 * Create. The same component and the same Server Action as the edit page —
 * a listing with no id is an insert as far as admin_save_listing is concerned,
 * so there is nothing here to keep in sync with the editor.
 *
 * Admin, not moderator: saveListing itself requires 'admin', so rendering the
 * form for a moderator would only produce a 404 on submit.
 */
export default async function NewListingPage() {
  await requireRole('admin', '/admin/listings/new');

  const options = await loadListingFormOptions();

  return (
    <>
      <PageHeader
        title="New listing"
        description="Everything saves in one transaction. Nothing is written until you press Create."
      />
      <ListingForm options={options} values={emptyListingValues()} />
    </>
  );
}

/**
 * Taxonomy and geography for the selects. Read whole rather than lazily per
 * cascade level: this is an internal tool with a handful of thousand rows at
 * most, and one round trip beats four fetch-on-change round trips that each
 * need their own loading state.
 */
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
