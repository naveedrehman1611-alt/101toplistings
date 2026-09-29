import 'server-only';
import { createClient } from './supabase-server';

/** Dropdown data for the listing form: categories and "City, Region" labels. */
export async function getListingFormOptions() {
  const supabase = await createClient();
  const [{ data: categories }, { data: cities }] = await Promise.all([
    supabase.from('categories').select('id, name, parent_id').order('sort_order').order('name'),
    supabase.from('cities').select('id, name, regions(name)').order('name'),
  ]);
  // "Parent › Child", parents first with their children after them, so the
  // flat select reads as the category tree.
  const rows = (categories ?? []) as { id: string; name: string; parent_id: string | null }[];
  const byId = new Map(rows.map((c) => [c.id, c]));
  const ordered = rows
    .filter((c) => !c.parent_id || !byId.has(c.parent_id))
    .flatMap((p) => [p, ...rows.filter((c) => c.parent_id === p.id)]);
  return {
    categories: ordered.map((c) => ({
      id: c.id,
      name:
        c.parent_id && byId.has(c.parent_id)
          ? `${byId.get(c.parent_id)!.name} › ${c.name}`
          : c.name,
    })),
    cities: (cities ?? []).map((c) => {
      const region = c.regions as unknown as { name: string } | null;
      return {
        id: c.id as string,
        label: region ? `${c.name}, ${region.name}` : (c.name as string),
      };
    }),
  };
}

export const LISTING_EDIT_COLUMNS =
  'id, name, slug, tagline, description, category_id, phone_primary, phone_secondary, email, website, address, postal_code, city_id, latitude, longitude, status, verification, is_featured, seo_title, seo_description, owner_user_id';
