import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { FormError, num, required, slugify, text, uuid } from './form-data';

/**
 * Parses the listing form shared by admin and the owner dashboard. Only the
 * fields both may edit are read here; status, verification and featured are
 * staff-only and handled by the admin action alone.
 */
export async function parseListingForm(fd: FormData, supabase: SupabaseClient) {
  const name = required(fd, 'name', 'Business name', 200);
  const cityId = uuid(fd, 'city_id');
  if (!cityId) throw new FormError('Choose a city.');

  // The city fixes the rest of the hierarchy, so region and country are derived
  // rather than asked for — they can never disagree with the city.
  const { data: city } = await supabase
    .from('cities')
    .select('id, region_id, regions(country_id)')
    .eq('id', cityId)
    .maybeSingle();
  if (!city) throw new FormError('That city no longer exists.');
  const region = city.regions as unknown as { country_id: string } | null;

  const lat = num(fd, 'latitude', 'Latitude');
  const lng = num(fd, 'longitude', 'Longitude');
  if ((lat === null) !== (lng === null)) {
    throw new FormError('Enter both latitude and longitude, or leave both blank.');
  }
  if (lat !== null && (lat < -90 || lat > 90)) throw new FormError('Latitude must be -90 to 90.');
  if (lng !== null && (lng < -180 || lng > 180))
    throw new FormError('Longitude must be -180 to 180.');

  const email = text(fd, 'email', 200);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new FormError('That email address does not look right.');
  }

  return {
    name,
    tagline: text(fd, 'tagline', 200),
    description: text(fd, 'description', 5000),
    category_id: uuid(fd, 'category_id'),
    phone_primary: text(fd, 'phone_primary', 40),
    phone_secondary: text(fd, 'phone_secondary', 40),
    email,
    website: normaliseUrl(text(fd, 'website', 300)),
    address: text(fd, 'address', 300),
    postal_code: text(fd, 'postal_code', 20),
    city_id: cityId,
    region_id: city.region_id as string,
    country_id: region?.country_id ?? null,
    latitude: lat,
    longitude: lng,
    updated_at: new Date().toISOString(),
  };
}

function normaliseUrl(v: string | null): string | null {
  if (!v) return null;
  const withScheme = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    const u = new URL(withScheme);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error();
    return u.toString();
  } catch {
    throw new FormError('That website address does not look right.');
  }
}

/**
 * A slug that is free right now. Two owners naming their shop the same thing
 * is ordinary, so a clash gets a numeric suffix instead of an error.
 */
export async function freeSlug(
  supabase: SupabaseClient,
  wanted: string,
  exceptId?: string,
): Promise<string> {
  const base = slugify(wanted) || 'business';
  for (let i = 1; i < 50; i++) {
    const candidate = i === 1 ? base : `${base}-${i}`;
    let q = supabase.from('listings').select('id').eq('slug', candidate);
    if (exceptId) q = q.neq('id', exceptId);
    const { data } = await q.limit(1);
    if (!data || data.length === 0) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export type HoursRow = {
  day_of_week: number;
  opens_at: string | null;
  closes_at: string | null;
  is_closed: boolean;
  is_24h: boolean;
};

/**
 * Reads the 7-day hours grid. A day left on "not set" produces no row, and if
 * every day is unset the section is simply absent on the page (variation 8).
 */
export function parseHours(fd: FormData): HoursRow[] {
  const rows: HoursRow[] = [];
  for (let d = 0; d < 7; d++) {
    const mode = text(fd, `h${d}_mode`, 10);
    if (!mode) continue;
    if (mode === 'closed') {
      rows.push({
        day_of_week: d,
        opens_at: null,
        closes_at: null,
        is_closed: true,
        is_24h: false,
      });
    } else if (mode === '24h') {
      rows.push({
        day_of_week: d,
        opens_at: null,
        closes_at: null,
        is_closed: false,
        is_24h: true,
      });
    } else if (mode === 'hours') {
      const opens = text(fd, `h${d}_open`, 8);
      const closes = text(fd, `h${d}_close`, 8);
      if (!opens || !closes || !/^\d{2}:\d{2}/.test(opens) || !/^\d{2}:\d{2}/.test(closes)) {
        throw new FormError('Give both an opening and a closing time for each open day.');
      }
      rows.push({
        day_of_week: d,
        opens_at: opens,
        closes_at: closes,
        is_closed: false,
        is_24h: false,
      });
    } else {
      throw new FormError('Unknown opening-hours option.');
    }
  }
  return rows;
}

/** Replaces a listing's hours with the submitted grid. */
export async function writeHours(supabase: SupabaseClient, listingId: string, rows: HoursRow[]) {
  const del = await supabase.from('opening_hours').delete().eq('listing_id', listingId);
  if (del.error) throw del.error;
  if (rows.length === 0) return;
  const ins = await supabase
    .from('opening_hours')
    .insert(rows.map((r) => ({ ...r, listing_id: listingId })));
  if (ins.error) throw ins.error;
}
