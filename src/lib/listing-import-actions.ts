'use server';

import { createClient } from './supabase-server';
import { requireRole } from './auth';
import { writeAuditMany } from './audit';
import { check, runAndReturn } from './action-flow';
import { FormError, bool, slugify, text } from './form-data';
import { normaliseUrl } from './listing-input';
import { parseCsv, unFormula } from './csv';
import { LISTING_CSV_COLUMNS, type ListingCsvColumn } from './listing-csv';
import { notifyListingDecisions } from './listing-notifications';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STATUSES = ['approved', 'pending', 'draft', 'rejected', 'suspended'];
const VERIFICATIONS = ['unverified', 'pending', 'verified', 'rejected'];
const DEFAULT_STATUSES = ['pending', 'approved', 'draft'];
const MAX_FILE_BYTES = 4 * 1024 * 1024;
const MAX_ROWS = 2000;
const MAX_ERRORS_SHOWN = 15;
/** Ids/slugs per `in (...)` filter: keeps each request URL well under the limits. */
const IN_CHUNK = 100;
const INSERT_CHUNK = 200;

/** Text columns and the lengths the listing form enforces (listing-input.ts). */
const TEXT_LIMITS: Partial<Record<ListingCsvColumn, number>> = {
  name: 200,
  tagline: 200,
  description: 5000,
  phone_primary: 40,
  phone_secondary: 40,
  address: 300,
  postal_code: 20,
  seo_title: 200,
  seo_description: 300,
};

type Listing = Record<string, unknown> & { id: string; name: string; slug: string; status: string };
type City = {
  id: string;
  slug: string;
  name: string;
  region_id: string;
  country_id: string | null;
};

type Parsed = {
  line: number;
  id: string | null;
  /** Only the columns present in the file; a blank cell clears that column. */
  values: Record<string, unknown>;
  wantedSlug: string | null;
  slugGiven: boolean;
};

async function chunked<T>(
  items: string[],
  read: (part: string[]) => PromiseLike<{ data: T[] | null; error: unknown }>,
) {
  const out: T[] = [];
  for (let i = 0; i < items.length; i += IN_CHUNK) {
    out.push(...(check(await read(items.slice(i, i + IN_CHUNK))) ?? []));
  }
  return out;
}

/**
 * Bulk create and update listings from a CSV in the export's format
 * (listing-csv.ts). A row with an `id` updates that listing, changing only
 * the columns in the file; a row without one creates a listing.
 *
 * Every row is checked first, and if any row has a problem nothing is saved:
 * fix the file and upload it again, with no half-imported state to clean up.
 * "Check only" runs the checks and saves nothing.
 */
export async function importListingsCsv(fd: FormData) {
  const user = await requireRole('moderator');
  const dryRun = bool(fd, 'dry_run');

  await runAndReturn(
    '/admin/listings/import',
    async () => {
      const file = fd.get('file');
      if (!(file instanceof File) || file.size === 0) throw new FormError('Choose a CSV file.');
      if (file.size > MAX_FILE_BYTES)
        throw new FormError('The file is over 4 MB. Split it into smaller files.');
      const defaultStatus = text(fd, 'default_status', 20) ?? 'pending';
      if (!DEFAULT_STATUSES.includes(defaultStatus))
        throw new FormError('Choose a default status.');

      const rows = parseCsv(await file.text());
      if (rows.length < 2) throw new FormError('The file has no listings under its header row.');
      const header = rows[0].map((h) => h.trim().toLowerCase());
      const unknown = header.filter((h) => !(LISTING_CSV_COLUMNS as readonly string[]).includes(h));
      if (unknown.length) {
        throw new FormError(
          `Unknown column(s): ${unknown.join(', ')}. Use the column names from the template.`,
        );
      }
      if (new Set(header).size !== header.length)
        throw new FormError('A column appears twice in the header.');
      if (!header.includes('name')) throw new FormError('The file needs a "name" column.');
      const data = rows.slice(1);
      if (data.length > MAX_ROWS) {
        throw new FormError(
          `The file has ${data.length} rows; import at most ${MAX_ROWS} at a time.`,
        );
      }

      const has = (c: ListingCsvColumn) => header.includes(c);
      const cell = (row: string[], c: ListingCsvColumn): string | null => {
        const i = header.indexOf(c);
        return i === -1 ? null : unFormula((row[i] ?? '').trim());
      };

      const supabase = await createClient();
      const errors: string[] = [];
      const fail = (line: number, msg: string) => errors.push(`Row ${line}: ${msg}`);

      // --- Look up everything the rows refer to, a chunk at a time ----------
      const ids = [...new Set(data.map((r) => cell(r, 'id') ?? '').filter((v) => UUID.test(v)))];
      const existing = new Map(
        (
          await chunked<Listing>(ids, (part) =>
            supabase.from('listings').select('*').in('id', part),
          )
        ).map((l) => [l.id, l]),
      );

      const categorySlugs = [
        ...new Set(data.map((r) => cell(r, 'category') ?? '').filter(Boolean)),
      ];
      const categories = new Map(
        (
          await chunked<{ id: string; slug: string }>(categorySlugs, (part) =>
            supabase.from('categories').select('id, slug').in('slug', part),
          )
        ).map((c) => [c.slug, c.id]),
      );

      const cityValues = [...new Set(data.map((r) => cell(r, 'city') ?? '').filter(Boolean))];
      const cityRows = (rows: unknown[]) =>
        (
          rows as {
            id: string;
            slug: string;
            name: string;
            region_id: string;
            regions: { country_id: string } | null;
          }[]
        ).map((c): City => ({ ...c, country_id: c.regions?.country_id ?? null }));
      const citiesBySlug = new Map(
        cityRows(
          await chunked(cityValues, (part) =>
            supabase
              .from('cities')
              .select('id, slug, name, region_id, regions(country_id)')
              .in('slug', part),
          ),
        ).map((c) => [c.slug, c]),
      );
      const byName = cityValues.filter((v) => !citiesBySlug.has(v));
      const citiesByName = new Map<string, City[]>();
      for (const c of cityRows(
        await chunked(byName, (part) =>
          supabase
            .from('cities')
            .select('id, slug, name, region_id, regions(country_id)')
            .in('name', part),
        ),
      )) {
        citiesByName.set(c.name, [...(citiesByName.get(c.name) ?? []), c]);
      }

      // --- Check every row --------------------------------------------------
      const parsed: Parsed[] = [];
      data.forEach((row, i) => {
        const line = i + 2; // the spreadsheet row number, header being row 1
        const before = errors.length;
        const rawId = cell(row, 'id');
        let id: string | null = null;
        if (rawId) {
          if (!UUID.test(rawId) || !existing.has(rawId)) {
            fail(line, `no listing has the id "${rawId}". Leave id blank to add a new listing.`);
          } else id = rawId;
        }
        const creating = !rawId;
        const values: Record<string, unknown> = {};

        for (const [col, max] of Object.entries(TEXT_LIMITS) as [ListingCsvColumn, number][]) {
          const v = cell(row, col);
          if (v === null) continue;
          values[col] = v === '' ? null : v.slice(0, max);
        }
        if (!values.name && (creating || has('name'))) fail(line, 'name is required.');

        const status = cell(row, 'status');
        if (status) {
          if (!STATUSES.includes(status))
            fail(line, `status must be one of ${STATUSES.join(', ')}.`);
          else values.status = status;
        } else if (creating) values.status = defaultStatus;

        const verification = cell(row, 'verification');
        if (verification) {
          if (!VERIFICATIONS.includes(verification)) {
            fail(line, `verification must be one of ${VERIFICATIONS.join(', ')}.`);
          } else values.verification = verification;
        }

        const featured = cell(row, 'is_featured');
        if (featured !== null) {
          const f = featured.toLowerCase();
          if (['', 'false', 'no', '0'].includes(f)) values.is_featured = false;
          else if (['true', 'yes', '1'].includes(f)) values.is_featured = true;
          else fail(line, 'is_featured must be yes or no.');
        }

        const category = cell(row, 'category');
        if (category !== null) {
          if (category === '') values.category_id = null;
          else if (!categories.has(category)) fail(line, `no category has the slug "${category}".`);
          else values.category_id = categories.get(category);
        }

        const cityValue = cell(row, 'city');
        if (cityValue) {
          const named = citiesByName.get(cityValue) ?? [];
          const city = citiesBySlug.get(cityValue) ?? (named.length === 1 ? named[0] : null);
          if (city) {
            values.city_id = city.id;
            values.region_id = city.region_id;
            values.country_id = city.country_id;
          } else if (named.length > 1) {
            fail(line, `more than one city is called "${cityValue}"; use the city's slug instead.`);
          } else fail(line, `city "${cityValue}" was not found. Use the city's slug.`);
        } else if (creating || cityValue === '') fail(line, 'city is required.');

        const email = cell(row, 'email');
        if (email !== null) {
          if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            fail(line, `email "${email}" does not look right.`);
          else values.email = email ? email.slice(0, 200) : null;
        }

        const website = cell(row, 'website');
        if (website !== null) {
          try {
            values.website = normaliseUrl(website ? website.slice(0, 300) : null);
          } catch {
            fail(line, `website "${website}" does not look right.`);
          }
        }

        const lat = cell(row, 'latitude');
        const lng = cell(row, 'longitude');
        if (lat !== null || lng !== null) {
          const la = lat ? Number(lat) : null;
          const ln = lng ? Number(lng) : null;
          if ((la === null) !== (ln === null))
            fail(line, 'give both latitude and longitude, or neither.');
          else if (la !== null && (!Number.isFinite(la) || la < -90 || la > 90))
            fail(line, 'latitude must be -90 to 90.');
          else if (ln !== null && (!Number.isFinite(ln) || ln < -180 || ln > 180))
            fail(line, 'longitude must be -180 to 180.');
          else {
            values.latitude = la;
            values.longitude = ln;
          }
        }

        const slugCell = cell(row, 'slug');
        const slugGiven = !!slugCell;
        let wantedSlug: string | null = null;
        if (slugCell) {
          wantedSlug = slugify(slugCell);
          if (!wantedSlug) fail(line, `slug "${slugCell}" has no letters or numbers.`);
        } else if (creating && typeof values.name === 'string') {
          wantedSlug = slugify(values.name) || 'business';
        }

        if (errors.length === before) parsed.push({ line, id, values, wantedSlug, slugGiven });
      });

      // The same listing twice would make the second row silently win.
      const seenIds = new Set<string>();
      for (const p of parsed) {
        if (!p.id) continue;
        if (seenIds.has(p.id)) fail(p.line, 'this id appears on an earlier row too.');
        seenIds.add(p.id);
      }

      // --- Slugs: free in the database and unique within the file ----------
      const wanted = [...new Set(parsed.flatMap((p) => (p.wantedSlug ? [p.wantedSlug] : [])))];
      const owners = new Map(
        (
          await chunked<{ id: string; slug: string }>(wanted, (part) =>
            supabase.from('listings').select('id, slug').in('slug', part),
          )
        ).map((l) => [l.slug, l.id]),
      );
      const used = new Set<string>();
      for (const p of parsed) {
        if (!p.wantedSlug) continue;
        const free = (s: string) => !used.has(s) && (!owners.has(s) || owners.get(s) === p.id);
        let slug = p.wantedSlug;
        if (!free(slug)) {
          if (p.id && p.slugGiven) {
            fail(p.line, `slug "${slug}" is already used by another listing.`);
            continue;
          }
          // A new listing named like an existing one gets a numeric suffix,
          // as the listing form does (freeSlug in listing-input.ts).
          for (let n = 2; ; n++) {
            const candidate = `${p.wantedSlug}-${n}`;
            if (!free(candidate)) continue;
            const { data: taken } = await supabase
              .from('listings')
              .select('id')
              .eq('slug', candidate)
              .limit(1);
            if (taken && taken.length) continue;
            slug = candidate;
            break;
          }
        }
        used.add(slug);
        p.values.slug = slug;
      }

      if (errors.length) {
        const more =
          errors.length > MAX_ERRORS_SHOWN ? ` …and ${errors.length - MAX_ERRORS_SHOWN} more.` : '';
        throw new FormError(
          `Nothing was imported. Fix these and upload again: ${errors.slice(0, MAX_ERRORS_SHOWN).join(' ')}${more}`,
        );
      }

      const creates = parsed.filter((p) => !p.id);
      const updates = parsed.filter((p) => p.id);
      if (dryRun) {
        return `Checked ${parsed.length} rows: ${creates.length} new, ${updates.length} updates, no problems found. Untick "Check only" to import them.`;
      }

      // --- Write ------------------------------------------------------------
      const now = new Date().toISOString();
      const created: Listing[] = [];
      for (let i = 0; i < creates.length; i += INSERT_CHUNK) {
        const batch = creates.slice(i, i + INSERT_CHUNK).map((p) => ({
          verification: 'unverified',
          ...p.values,
          created_by: user.id,
          last_updated_by: user.id,
          published_at: p.values.status === 'approved' ? now : null,
        }));
        created.push(
          ...(check(await supabase.from('listings').insert(batch).select('*')) as Listing[]),
        );
      }

      const updated: { before: Listing; after: Listing }[] = [];
      for (let i = 0; i < updates.length; i += 10) {
        await Promise.all(
          updates.slice(i, i + 10).map(async (p) => {
            const before = existing.get(p.id!)!;
            const patch: Record<string, unknown> = {
              ...p.values,
              last_updated_by: user.id,
              updated_at: now,
            };
            if (p.values.status === 'approved') {
              patch.rejection_note = null;
              if (!before.published_at) patch.published_at = now;
            }
            const after = check(
              await supabase
                .from('listings')
                .update(patch)
                .eq('id', p.id!)
                .select('*')
                .maybeSingle(),
            ) as Listing | null;
            if (after) updated.push({ before, after });
          }),
        );
      }

      await writeAuditMany(
        user.id,
        'create',
        'listing',
        created.map((l) => ({ id: l.id, before: null, after: l })),
      );
      await writeAuditMany(
        user.id,
        'update',
        'listing',
        updated.map((u) => ({ id: u.after.id, before: u.before, after: u.after })),
      );

      for (const decision of ['approved', 'rejected'] as const) {
        const changed = updated
          .filter((u) => u.after.status === decision && u.before.status !== decision)
          .map((u) => u.after);
        await notifyListingDecisions(supabase, changed, decision, null);
      }

      return `Imported: ${created.length} added, ${updated.length} updated.`;
    },
    dryRun ? { tags: [], paths: [] } : undefined,
  );
}
