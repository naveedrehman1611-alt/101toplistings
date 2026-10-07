import { cache } from 'react';
import { reportError, type City } from './queries';
import { supabase } from './supabase';

export type CountryCities = {
  country: { slug: string; name: string };
  cities: City[];
};

type Row = City & {
  regions: { countries: { slug: string; name: string } | null } | null;
};

/**
 * Every city grouped under its country (cities -> regions -> countries), for the
 * /locations hub. Countries without cities do not appear; countries and cities
 * are both sorted by name.
 */
export const getCitiesByCountry = cache(async function getCitiesByCountry(): Promise<
  CountryCities[]
> {
  const { data, error } = await supabase
    .from('cities')
    .select(
      'id, slug, name, latitude, longitude, intro_copy, is_featured, regions(countries(slug, name))',
    )
    .order('name');
  reportError('cities.byCountry', error);

  const groups = new Map<string, CountryCities>();
  for (const { regions, ...city } of (data ?? []) as unknown as Row[]) {
    const country = regions?.countries;
    if (!country) continue;
    const group = groups.get(country.slug) ?? { country, cities: [] };
    group.cities.push(city);
    groups.set(country.slug, group);
  }
  return [...groups.values()].sort((a, b) => a.country.name.localeCompare(b.country.name));
});
