import Link from 'next/link';
import type { Metadata } from 'next';
import { requireRole } from '@/lib/auth';
import { hasMinRole } from '@/lib/roles';
import { createClient } from '@/lib/supabase/server';
import {
  AdminButton,
  Card,
  FilterTabs,
  PageHeader,
  Pager,
  TableShell,
  Td,
  Th,
} from '@/components/admin/chrome';
import { Checkbox, Input, Select, Switch, Textarea } from '@/components/form';
import { EmptyState } from '@/components/ui';
import { deleteLocation, saveLocation } from './actions';

export const metadata: Metadata = { title: 'Locations' };

const PER_PAGE = 25;
const BASE = '/admin/locations';

const LEVELS = ['country', 'region', 'city', 'area'] as const;
type Level = (typeof LEVELS)[number];

const TABLE: Record<Level, string> = {
  country: 'countries',
  region: 'regions',
  city: 'cities',
  area: 'areas',
};

const PARENT_LEVEL: Record<Level, Level | null> = {
  country: null,
  region: 'country',
  city: 'region',
  area: 'city',
};

const CHILD_LEVEL: Record<Level, Level | null> = {
  country: 'region',
  region: 'city',
  city: 'area',
  area: null,
};

const PARENT_COLUMN: Record<Level, string | null> = {
  country: null,
  region: 'country_id',
  city: 'region_id',
  area: 'city_id',
};

const LABEL: Record<Level, string> = {
  country: 'Country',
  region: 'Region',
  city: 'City',
  area: 'Area',
};

const PLURAL: Record<Level, string> = {
  country: 'Countries',
  region: 'Regions',
  city: 'Cities',
  area: 'Areas',
};

const SELECT: Record<Level, string> = {
  country:
    'id, slug, name, iso2, iso3, phone_code, latitude, longitude, intro_copy, is_featured, seo_title, seo_description',
  region:
    'id, slug, name, code, country_id, latitude, longitude, intro_copy, is_featured, seo_title, seo_description',
  city: 'id, slug, name, region_id, latitude, longitude, intro_copy, is_featured, seo_title, seo_description',
  area: 'id, slug, name, city_id, latitude, longitude, intro_copy, is_featured, seo_title, seo_description',
};

const ERRORS: Record<string, string> = {
  bad_input: 'That request was malformed, so nothing was saved.',
  name_required: 'A location needs a name of at least two characters.',
  slug_required: 'That name produced an empty slug. Enter a slug by hand.',
  parent_required: 'Choose the place this one sits inside.',
  bad_coordinates: 'Latitude must be between -90 and 90, longitude between -180 and 180.',
  not_found: 'That location no longer exists.',
  save_failed: 'The location could not be saved. Try again.',
  delete_failed: 'The location could not be deleted. Try again.',
  confirm_required: 'Tick the confirmation box before deleting a location.',
  slug_taken: 'That slug is already taken. Slugs must be unique across all four levels.',
  slug_country: 'That slug is already used by a country. Slugs are unique across all four levels.',
  slug_region: 'That slug is already used by a region. Slugs are unique across all four levels.',
  slug_city: 'That slug is already used by a city. Slugs are unique across all four levels.',
  slug_area: 'That slug is already used by an area. Slugs are unique across all four levels.',
};

type LocationRow = {
  id: string;
  slug: string;
  name: string;
  is_featured: boolean;
  latitude: number | null;
  longitude: number | null;
  intro_copy: string | null;
  seo_title: string | null;
  seo_description: string | null;
  iso2?: string | null;
  iso3?: string | null;
  phone_code?: string | null;
  code?: string | null;
  country_id?: string | null;
  region_id?: string | null;
  city_id?: string | null;
};

function parseLevel(raw: string | undefined): Level {
  return (LEVELS as readonly string[]).includes(raw ?? '') ? (raw as Level) : 'country';
}

function parsePage(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? '1', 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function LocationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    level?: string;
    parent?: string;
    page?: string;
    edit?: string;
    err?: string;
  }>;
}) {
  const actor = await requireRole('editor', BASE);
  const sp = await searchParams;

  const level = parseLevel(sp.level);
  const parentLevel = PARENT_LEVEL[level];
  const childLevel = CHILD_LEVEL[level];
  const parentColumn = PARENT_COLUMN[level];
  const parentId = parentColumn && UUID.test(sp.parent ?? '') ? (sp.parent as string) : null;
  const page = parsePage(sp.page);
  const from = (page - 1) * PER_PAGE;

  const supabase = await createClient();

  // One count per level: the tabs double as the shape of the hierarchy.
  const counts = await Promise.all(
    LEVELS.map(async (value) => {
      const { count } = await supabase
        .from(TABLE[value])
        .select('id', { count: 'exact', head: true });
      return { value, count: count ?? 0 };
    }),
  );

  let rowsQuery = supabase.from(TABLE[level]).select(SELECT[level], { count: 'exact' });
  if (parentColumn && parentId) rowsQuery = rowsQuery.eq(parentColumn, parentId);

  const { data, count } = await rowsQuery
    .order('name', { ascending: true })
    .range(from, from + PER_PAGE - 1);

  // The table name is chosen at runtime, so the client cannot infer a row shape
  // from the select string; the explicit column list above is the contract.
  const rows = (data ?? []) as unknown as LocationRow[];
  const total = count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE));

  // Every possible parent, for the picker. Bounded by the level above, which is
  // always the smaller table.
  const parentOptionsResult = parentLevel
    ? await supabase.from(TABLE[parentLevel]).select('id, name').order('name', { ascending: true })
    : { data: [] };
  const parentOptions = (parentOptionsResult.data ?? []) as { id: string; name: string }[];
  const parentName = parentId
    ? (parentOptions.find((p) => p.id === parentId)?.name ?? 'Unknown')
    : null;

  // Child counts for the visible page, so "browse" says how much is underneath.
  const childCounts = new Map(
    childLevel
      ? await Promise.all(
          rows.map(async (row): Promise<[string, number]> => {
            const { count: n } = await supabase
              .from(TABLE[childLevel])
              .select('id', { count: 'exact', head: true })
              .eq(PARENT_COLUMN[childLevel] as string, row.id);
            return [row.id, n ?? 0];
          }),
        )
      : [],
  );

  const editing = sp.edit === 'new' ? 'new' : (rows.find((r) => r.id === sp.edit)?.id ?? null);
  const editRow =
    editing && editing !== 'new' ? (rows.find((r) => r.id === editing) ?? null) : null;

  const query = {
    level,
    parent: parentId ?? undefined,
    page: page > 1 ? String(page) : undefined,
  };
  const qs = new URLSearchParams(
    Object.entries(query).filter((e): e is [string, string] => typeof e[1] === 'string'),
  ).toString();
  const listUrl = `${BASE}?${qs}`;
  const editUrl = (id: string) => `${listUrl}&edit=${id}`;
  const returnTo = editing ? editUrl(editing) : listUrl;
  const childUrl = (id: string) => `${BASE}?level=${childLevel}&parent=${id}`;

  const error = sp.err ? ERRORS[sp.err] : undefined;
  const canDelete = hasMinRole(actor.role, 'admin');

  return (
    <>
      <PageHeader
        title="Locations"
        description="Countries, regions, cities and areas. Every slug must be unique across all four levels — one public route resolves them all."
        action={
          editing ? (
            <AdminButton href={listUrl} variant="secondary">
              Close editor
            </AdminButton>
          ) : (
            <AdminButton href={editUrl('new')}>New {LABEL[level].toLowerCase()}</AdminButton>
          )
        }
      />

      {error ? (
        <p
          role="alert"
          className="rounded-[var(--radius-card)] border border-[#ecc2be] bg-[#fbeceb] px-4 py-3 text-sm text-[#96231b]"
        >
          {error}
        </p>
      ) : null}

      <FilterTabs
        basePath={BASE}
        param="level"
        current={level}
        options={counts.map((c) => ({ value: c.value, label: PLURAL[c.value], count: c.count }))}
      />

      {parentName ? (
        <p className="text-sm text-[var(--text-muted)]">
          {PLURAL[level]} in <span className="font-medium text-[var(--text)]">{parentName}</span> ·{' '}
          <Link href={`${BASE}?level=${level}`} className="text-brand-700 hover:underline">
            show all {PLURAL[level].toLowerCase()}
          </Link>
          {parentLevel ? (
            <>
              {' · '}
              <Link
                href={`${BASE}?level=${parentLevel}`}
                className="text-brand-700 hover:underline"
              >
                back to {PLURAL[parentLevel].toLowerCase()}
              </Link>
            </>
          ) : null}
        </p>
      ) : null}

      {editing ? (
        <Card className="p-4">
          <h2 className="font-display text-lg font-semibold">
            {editRow ? `Edit ${editRow.name}` : `New ${LABEL[level].toLowerCase()}`}
          </h2>
          <form action={saveLocation} className="mt-4 flex flex-col gap-4">
            <input type="hidden" name="level" value={level} />
            {editRow ? <input type="hidden" name="id" value={editRow.id} /> : null}
            <input type="hidden" name="returnTo" value={returnTo} />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input name="name" label="Name" required defaultValue={editRow?.name ?? ''} />
              <Input
                name="slug"
                label="Slug"
                hint="Unique across countries, regions, cities and areas."
                defaultValue={editRow?.slug ?? ''}
              />

              {/* Exactly one of the three parent columns exists at any level, so
                  coalescing them to find the current parent is unambiguous. */}
              {parentLevel ? (
                <Select
                  name="parent_id"
                  label={LABEL[parentLevel]}
                  required
                  placeholder={`Choose a ${LABEL[parentLevel].toLowerCase()}`}
                  defaultValue={
                    editRow?.country_id ?? editRow?.region_id ?? editRow?.city_id ?? parentId ?? ''
                  }
                  options={parentOptions.map((p) => ({ value: p.id, label: p.name }))}
                />
              ) : null}

              {level === 'country' ? (
                <>
                  <Input
                    name="iso2"
                    label="ISO 3166-1 alpha-2"
                    maxLength={2}
                    defaultValue={editRow?.iso2 ?? ''}
                  />
                  <Input
                    name="iso3"
                    label="ISO 3166-1 alpha-3"
                    maxLength={3}
                    defaultValue={editRow?.iso3 ?? ''}
                  />
                  <Input
                    name="phone_code"
                    label="Phone code"
                    defaultValue={editRow?.phone_code ?? ''}
                  />
                </>
              ) : null}

              {level === 'region' ? (
                <Input
                  name="code"
                  label="Region code"
                  hint="State or province abbreviation."
                  defaultValue={editRow?.code ?? ''}
                />
              ) : null}

              <Input
                name="latitude"
                label="Latitude"
                type="number"
                step="any"
                defaultValue={
                  editRow?.latitude !== null && editRow?.latitude !== undefined
                    ? String(editRow.latitude)
                    : ''
                }
              />
              <Input
                name="longitude"
                label="Longitude"
                type="number"
                step="any"
                defaultValue={
                  editRow?.longitude !== null && editRow?.longitude !== undefined
                    ? String(editRow.longitude)
                    : ''
                }
              />
              <Switch
                name="is_featured"
                label="Featured"
                defaultChecked={editRow?.is_featured ?? false}
              />
            </div>

            <Textarea
              name="intro_copy"
              label="Intro copy"
              rows={3}
              defaultValue={editRow?.intro_copy ?? ''}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input name="seo_title" label="SEO title" defaultValue={editRow?.seo_title ?? ''} />
              <Input
                name="seo_description"
                label="SEO description"
                defaultValue={editRow?.seo_description ?? ''}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <AdminButton type="submit">
                {editRow ? 'Save changes' : `Create ${LABEL[level].toLowerCase()}`}
              </AdminButton>
              <AdminButton href={listUrl} variant="secondary">
                Cancel
              </AdminButton>
            </div>
          </form>

          {editRow && canDelete ? (
            <details className="mt-6 border-t border-[var(--border)] pt-4">
              <summary className="cursor-pointer text-sm font-medium text-[#96231b]">
                Delete this {LABEL[level].toLowerCase()}
              </summary>
              <form action={deleteLocation} className="mt-3 flex flex-col gap-3">
                <input type="hidden" name="level" value={level} />
                <input type="hidden" name="id" value={editRow.id} />
                <input type="hidden" name="returnTo" value={listUrl} />
                <p className="max-w-prose text-sm text-[var(--text-muted)]">
                  {childLevel ? (
                    <>
                      Every {PLURAL[childLevel].toLowerCase()} underneath this one is deleted with
                      it, all the way down the hierarchy — the child keys cascade. Listings keep
                      existing but lose their {LABEL[level].toLowerCase()}.
                    </>
                  ) : (
                    <>Listings in this area keep existing but lose their area.</>
                  )}
                </p>
                <Checkbox
                  name="confirm"
                  required
                  label={`I understand everything below this ${LABEL[level].toLowerCase()} is deleted too.`}
                />
                <div>
                  <AdminButton type="submit" variant="danger">
                    Delete {LABEL[level].toLowerCase()}
                  </AdminButton>
                </div>
              </form>
            </details>
          ) : null}
        </Card>
      ) : null}

      {rows.length === 0 ? (
        <EmptyState
          title={`No ${PLURAL[level].toLowerCase()} here`}
          body={
            parentName
              ? `Nothing has been added inside ${parentName} yet.`
              : `Create the first ${LABEL[level].toLowerCase()} to start placing listings.`
          }
        />
      ) : (
        <TableShell>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Slug</Th>
              <Th>Coordinates</Th>
              {childLevel ? <Th>{PLURAL[childLevel]}</Th> : null}
              <Th>Featured</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <Td>
                  {level === 'city' ? (
                    <Link
                      href={`/city/${row.slug}`}
                      className="text-brand-700 font-medium hover:underline"
                    >
                      {row.name}
                    </Link>
                  ) : (
                    <span className="font-medium">{row.name}</span>
                  )}
                </Td>
                <Td className="font-mono text-xs text-[var(--text-muted)]">{row.slug}</Td>
                <Td className="text-xs text-[var(--text-muted)] tabular-nums">
                  {row.latitude !== null && row.longitude !== null
                    ? `${row.latitude.toFixed(3)}, ${row.longitude.toFixed(3)}`
                    : '—'}
                </Td>
                {childLevel ? (
                  <Td>
                    <Link href={childUrl(row.id)} className="text-brand-700 hover:underline">
                      {childCounts.get(row.id) ?? 0} {PLURAL[childLevel].toLowerCase()}
                    </Link>
                  </Td>
                ) : null}
                <Td>{row.is_featured ? 'Yes' : <span className="text-ink-400">No</span>}</Td>
                <Td>
                  <AdminButton href={editUrl(row.id)} variant="secondary">
                    Edit
                  </AdminButton>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}

      <Pager basePath={BASE} query={query} page={page} pageCount={pageCount} />
    </>
  );
}
