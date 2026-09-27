'use server';

import { createClient } from './supabase-server';
import { requireRole } from './auth';
import { writeAudit } from './audit';
import { check, runAndReturn } from './action-flow';
import { FormError, bool, num, required, slugFrom, text, uuid } from './form-data';
import {
  STARTER_CATEGORIES,
  STARTER_CITIES,
  STARTER_COUNTRIES,
  STARTER_REGIONS,
} from './starter-data';

// Each action re-checks the role itself: a Server Action is a public endpoint,
// so the admin layout's check does not protect it. RLS enforces it a third time.

export async function saveCategory(fd: FormData) {
  const user = await requireRole('editor');
  await runAndReturn('/admin/categories', async () => {
    const supabase = await createClient();
    const id = uuid(fd, 'id');
    const row = {
      name: required(fd, 'name', 'Name'),
      slug: slugFrom(fd),
      parent_id: uuid(fd, 'parent_id'),
      description: text(fd, 'description', 1000),
      sort_order: num(fd, 'sort_order', 'Sort order') ?? 0,
      is_featured: bool(fd, 'is_featured'),
      updated_at: new Date().toISOString(),
    };
    if (id && row.parent_id === id) throw new FormError('A category cannot be its own parent.');

    if (id) {
      const before = check(
        await supabase.from('categories').select('*').eq('id', id).maybeSingle(),
      );
      if (!before) throw new FormError('Category not found.');
      const after = check(
        await supabase.from('categories').update(row).eq('id', id).select('*').maybeSingle(),
      );
      await writeAudit(user.id, 'update', 'category', id, before, after);
      return `Saved ${row.name}.`;
    }
    const after = check(await supabase.from('categories').insert(row).select('*').single());
    await writeAudit(user.id, 'create', 'category', after.id, null, after);
    return `Added ${row.name}.`;
  });
}

export async function deleteCategory(fd: FormData) {
  const user = await requireRole('editor');
  await runAndReturn('/admin/categories', async () => {
    const supabase = await createClient();
    const id = uuid(fd, 'id');
    if (!id) throw new FormError('Nothing selected.');
    const before = check(await supabase.from('categories').select('*').eq('id', id).maybeSingle());
    if (!before) throw new FormError('Category not found.');
    // listings.category_id is "on delete set null", so a delete never orphans a
    // listing — but it does silently uncategorise them, so refuse while in use.
    const { count } = await supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .or(`category_id.eq.${id},subcategory_id.eq.${id}`);
    if (count)
      throw new FormError(`${before.name} is used by ${count} listing(s). Move them first.`);
    check(await supabase.from('categories').delete().eq('id', id));
    await writeAudit(user.id, 'delete', 'category', id, before, null);
    return `Deleted ${before.name}.`;
  });
}

// ---------------------------------------------------------------------------
// Locations: countries -> regions -> cities
// ---------------------------------------------------------------------------

type LocationTable = 'countries' | 'regions' | 'cities';

const ENTITY: Record<LocationTable, string> = {
  countries: 'country',
  regions: 'region',
  cities: 'city',
};

async function saveLocation(
  table: LocationTable,
  userId: string,
  fd: FormData,
  extra: Record<string, unknown>,
) {
  const supabase = await createClient();
  const id = uuid(fd, 'id');
  const lat = num(fd, 'latitude', 'Latitude');
  const lng = num(fd, 'longitude', 'Longitude');
  if ((lat === null) !== (lng === null)) {
    throw new FormError('Enter both latitude and longitude, or neither.');
  }
  if (lat !== null && (lat < -90 || lat > 90)) throw new FormError('Latitude must be -90 to 90.');
  if (lng !== null && (lng < -180 || lng > 180))
    throw new FormError('Longitude must be -180 to 180.');

  const row = {
    name: required(fd, 'name', 'Name'),
    slug: slugFrom(fd),
    latitude: lat,
    longitude: lng,
    updated_at: new Date().toISOString(),
    ...extra,
  };

  if (id) {
    const before = check(await supabase.from(table).select('*').eq('id', id).maybeSingle());
    if (!before) throw new FormError('Not found.');
    const after = check(
      await supabase.from(table).update(row).eq('id', id).select('*').maybeSingle(),
    );
    await writeAudit(userId, 'update', ENTITY[table], id, before, after);
    return `Saved ${row.name}.`;
  }
  const after = check(await supabase.from(table).insert(row).select('*').single());
  await writeAudit(userId, 'create', ENTITY[table], after.id, null, after);
  return `Added ${row.name}.`;
}

export async function saveCountry(fd: FormData) {
  const user = await requireRole('editor');
  await runAndReturn('/admin/locations', async () => {
    const iso2 = text(fd, 'iso2', 2)?.toUpperCase() ?? null;
    if (iso2 && !/^[A-Z]{2}$/.test(iso2)) throw new FormError('ISO code must be two letters.');
    return saveLocation('countries', user.id, fd, { iso2 });
  });
}

export async function saveRegion(fd: FormData) {
  const user = await requireRole('editor');
  await runAndReturn('/admin/locations', async () => {
    const countryId = uuid(fd, 'country_id');
    if (!countryId) throw new FormError('Choose a country.');
    return saveLocation('regions', user.id, fd, { country_id: countryId });
  });
}

export async function saveCity(fd: FormData) {
  const user = await requireRole('editor');
  await runAndReturn('/admin/locations', async () => {
    const regionId = uuid(fd, 'region_id');
    if (!regionId) throw new FormError('Choose a region.');
    // Only the city form edits these; countries and regions keep theirs untouched.
    return saveLocation('cities', user.id, fd, {
      region_id: regionId,
      is_featured: bool(fd, 'is_featured'),
      intro_copy: text(fd, 'intro_copy', 2000),
    });
  });
}

export async function deleteLocation(fd: FormData) {
  const user = await requireRole('editor');
  await runAndReturn('/admin/locations', async () => {
    const table = text(fd, 'table', 20) as LocationTable | null;
    if (!table || !(table in ENTITY)) throw new FormError('Unknown location type.');
    const id = uuid(fd, 'id');
    if (!id) throw new FormError('Nothing selected.');

    const supabase = await createClient();
    const before = check(await supabase.from(table).select('*').eq('id', id).maybeSingle());
    if (!before) throw new FormError('Not found.');

    // Regions and cities cascade down the hierarchy, and listings point at every
    // level. Refuse while anything depends on it rather than cascading silently.
    const column = { countries: 'country_id', regions: 'region_id', cities: 'city_id' }[table];
    const { count: listingCount } = await supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq(column, id);
    if (listingCount) {
      throw new FormError(`${before.name} is used by ${listingCount} listing(s). Move them first.`);
    }
    if (table !== 'cities') {
      const child = table === 'countries' ? 'regions' : 'cities';
      const { count: children } = await supabase
        .from(child)
        .select('id', { count: 'exact', head: true })
        .eq(column, id);
      if (children)
        throw new FormError(`${before.name} still has ${children} ${child}. Remove them first.`);
    }

    check(await supabase.from(table).delete().eq('id', id));
    await writeAudit(user.id, 'delete', ENTITY[table], id, before, null);
    return `Deleted ${before.name}.`;
  });
}

// ---------------------------------------------------------------------------
// Starter data
// ---------------------------------------------------------------------------

/**
 * Fills an empty database with the three launch markets — the United Kingdom,
 * the United States and the United Arab Emirates — with their regions, larger
 * cities and a set of common categories: the same rows as migration 0018 (plus
 * 0017's categories). Without at least one city nobody can add a business.
 * Only inserts what is missing, so pressing it twice (or after running 0018)
 * changes nothing, and admin edits are never overwritten.
 */
export async function loadStarterData(fd: FormData) {
  const user = await requireRole('editor');
  // Fixed list, not a free path: an arbitrary "back" would be an open redirect.
  const back =
    text(fd, 'back', 100) === 'new-listing' ? '/dashboard/listings/new' : '/admin/locations';
  await runAndReturn(back, async () => {
    const supabase = await createClient();

    // Location slugs are unique across all three levels (a trigger enforces
    // it), so collect every slug already in use before inserting.
    const [{ data: c }, { data: r }, { data: ci }, { data: cat }] = await Promise.all([
      supabase.from('countries').select('id, slug, iso2'),
      supabase.from('regions').select('id, slug'),
      supabase.from('cities').select('slug'),
      supabase.from('categories').select('slug'),
    ]);
    const taken = new Set([...(c ?? []), ...(r ?? []), ...(ci ?? [])].map((x) => x.slug));
    let added = 0;

    // A country already present by slug or ISO code is reused, not duplicated.
    const countryIds = new Map<string, string>();
    for (const country of STARTER_COUNTRIES) {
      const existing = (c ?? []).find(
        (x) => x.slug === country.slug || x.iso2?.toUpperCase() === country.iso2,
      );
      if (existing) {
        countryIds.set(country.slug, existing.id as string);
        continue;
      }
      if (taken.has(country.slug))
        throw new FormError(`The slug "${country.slug}" is already used elsewhere.`);
      const row = check(await supabase.from('countries').insert(country).select('*').single());
      await writeAudit(user.id, 'create', 'country', row.id, null, row);
      countryIds.set(country.slug, row.id as string);
      taken.add(country.slug);
      added++;
    }

    const regionIds = new Map((r ?? []).map((x) => [x.slug as string, x.id as string] as const));
    const newRegions = STARTER_REGIONS.filter(
      (x) => !taken.has(x.slug) && countryIds.has(x.country),
    ).map((x) => ({
      country_id: countryIds.get(x.country)!,
      slug: x.slug,
      name: x.name,
      code: x.code,
      latitude: x.lat,
      longitude: x.lng,
    }));
    if (newRegions.length) {
      const rows = check(await supabase.from('regions').insert(newRegions).select('id, slug'));
      for (const row of rows ?? []) regionIds.set(row.slug, row.id);
      await writeAudit(user.id, 'create', 'region', null, null, { starter: newRegions.length });
      added += newRegions.length;
    }

    const newCities = STARTER_CITIES.filter(
      (x) => !taken.has(x.slug) && regionIds.has(x.region),
    ).map((x) => ({
      region_id: regionIds.get(x.region)!,
      slug: x.slug,
      name: x.name,
      latitude: x.lat,
      longitude: x.lng,
      is_featured: x.featured,
    }));
    if (newCities.length) {
      check(await supabase.from('cities').insert(newCities));
      await writeAudit(user.id, 'create', 'city', null, null, { starter: newCities.length });
      added += newCities.length;
    }

    const haveCats = new Set((cat ?? []).map((x) => x.slug));
    const newCats = STARTER_CATEGORIES.filter((x) => !haveCats.has(x.slug));
    if (newCats.length) {
      check(await supabase.from('categories').insert(newCats));
      await writeAudit(user.id, 'create', 'category', null, null, { starter: newCats.length });
      added += newCats.length;
    }

    return added
      ? `Loaded ${newCities.length} cities and ${newCats.length} categories.`
      : 'Starter data is already loaded.';
  });
}
