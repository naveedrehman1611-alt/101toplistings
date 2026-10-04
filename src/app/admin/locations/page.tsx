import Link from 'next/link';
import type { ReactNode } from 'react';
import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import {
  deleteLocation,
  loadStarterData,
  saveCity,
  saveCountry,
  saveRegion,
} from '@/lib/taxonomy-actions';
import {
  Check,
  DangerButton,
  Field,
  Notice,
  Select,
  SubmitButton,
  TextArea,
} from '@/components/admin-ui';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Locations' };

type Loc = {
  id: string;
  slug: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  is_featured: boolean;
  intro_copy: string | null;
};
type Country = Loc & { iso2: string | null };
type Region = Loc & { country_id: string };
type City = Loc & { region_id: string };

const COLS = 'id, slug, name, latitude, longitude, is_featured, intro_copy';

export default async function AdminLocations({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; ok?: string; error?: string }>;
}) {
  await requireRole('editor');
  const sp = await searchParams;
  const supabase = await createClient();

  const [{ data: c }, { data: r }, { data: ci }] = await Promise.all([
    supabase.from('countries').select(`${COLS}, iso2`).order('name'),
    supabase.from('regions').select(`${COLS}, country_id`).order('name'),
    supabase.from('cities').select(`${COLS}, region_id`).order('name'),
  ]);
  const countries = (c ?? []) as Country[];
  const regions = (r ?? []) as Region[];
  const cities = (ci ?? []) as City[];

  // ?edit=cities:<uuid> selects which row the matching form is editing.
  const [editTable, editId] = (sp.edit ?? '').split(':');
  const editCountry =
    editTable === 'countries' ? countries.find((x) => x.id === editId) : undefined;
  const editRegion = editTable === 'regions' ? regions.find((x) => x.id === editId) : undefined;
  const editCity = editTable === 'cities' ? cities.find((x) => x.id === editId) : undefined;

  const countryName = new Map(countries.map((x) => [x.id, x.name]));
  const regionById = new Map(regions.map((x) => [x.id, x]));

  return (
    <div>
      <h1 className="text-2xl font-semibold">Locations</h1>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        Add a country, then its regions (state or province), then cities. A listing is placed in a
        city. Featured cities appear on the home page. Slugs must be unique across all three levels.
      </p>
      <Notice ok={sp.ok} error={sp.error} />

      {cities.length === 0 ? (
        <form
          action={loadStarterData}
          className="surface-card mt-6 flex flex-wrap items-center justify-between gap-4 p-5"
        >
          <p className="text-sm">
            <span className="font-medium">Starting from empty?</span>{' '}
            <span className="text-[var(--text-muted)]">
              Load the United Kingdom, United States and United Arab Emirates with 21 regions, 32
              major cities and 22 common categories. Existing rows are kept.
            </span>
          </p>
          <SubmitButton>Load starter data</SubmitButton>
        </form>
      ) : null}

      {/* Countries ---------------------------------------------------------- */}
      <Block title="Countries">
        <form action={saveCountry} className="surface-card grid gap-4 p-5 sm:grid-cols-2">
          <FormTitle editing={editCountry?.name} noun="country" />
          {editCountry ? <input type="hidden" name="id" value={editCountry.id} /> : null}
          <Field label="Name" name="name" required defaultValue={editCountry?.name} />
          <Field
            label="Slug"
            name="slug"
            defaultValue={editCountry?.slug}
            hint="Blank = from name."
          />
          <Field label="ISO code" name="iso2" defaultValue={editCountry?.iso2} placeholder="GB" />
          <CoordFields loc={editCountry} />
          <FormActions editing={!!editCountry} />
        </form>
        <LocTable
          table="countries"
          rows={countries.map((x) => ({ ...x, parent: x.iso2 ?? '' }))}
          parentLabel="ISO"
        />
      </Block>

      {/* Regions ------------------------------------------------------------ */}
      <Block title="Regions">
        {countries.length === 0 ? (
          <Hint>Add a country first.</Hint>
        ) : (
          <form action={saveRegion} className="surface-card grid gap-4 p-5 sm:grid-cols-2">
            <FormTitle editing={editRegion?.name} noun="region" />
            {editRegion ? <input type="hidden" name="id" value={editRegion.id} /> : null}
            <Select
              label="Country"
              name="country_id"
              required
              defaultValue={
                editRegion?.country_id ?? (countries.length === 1 ? countries[0].id : null)
              }
              options={countries.map((x) => ({ value: x.id, label: x.name }))}
            />
            <Field label="Name" name="name" required defaultValue={editRegion?.name} />
            <Field
              label="Slug"
              name="slug"
              defaultValue={editRegion?.slug}
              hint="Blank = from name."
            />
            <CoordFields loc={editRegion} />
            <FormActions editing={!!editRegion} />
          </form>
        )}
        <LocTable
          table="regions"
          rows={regions.map((x) => ({ ...x, parent: countryName.get(x.country_id) ?? '' }))}
          parentLabel="Country"
        />
      </Block>

      {/* Cities ------------------------------------------------------------- */}
      <Block title="Cities">
        {regions.length === 0 ? (
          <Hint>Add a region first.</Hint>
        ) : (
          <form action={saveCity} className="surface-card grid gap-4 p-5 sm:grid-cols-2">
            <FormTitle editing={editCity?.name} noun="city" />
            {editCity ? <input type="hidden" name="id" value={editCity.id} /> : null}
            <Select
              label="Region"
              name="region_id"
              required
              defaultValue={editCity?.region_id}
              options={regions.map((x) => ({
                value: x.id,
                label: `${x.name}, ${countryName.get(x.country_id) ?? ''}`,
              }))}
            />
            <Field label="Name" name="name" required defaultValue={editCity?.name} />
            <Field
              label="Slug"
              name="slug"
              defaultValue={editCity?.slug}
              hint="Blank = from name."
            />
            <CoordFields loc={editCity} />
            <div className="sm:col-span-2">
              <TextArea
                label="Intro text for the city page"
                name="intro_copy"
                defaultValue={editCity?.intro_copy}
                rows={3}
              />
            </div>
            <Check
              label="Featured on the home page"
              name="is_featured"
              defaultChecked={editCity?.is_featured}
            />
            <FormActions editing={!!editCity} />
          </form>
        )}
        <LocTable
          table="cities"
          rows={cities.map((x) => ({ ...x, parent: regionById.get(x.region_id)?.name ?? '' }))}
          parentLabel="Region"
          publicPath="/city/"
        />
      </Block>
    </div>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Hint({ children }: { children: ReactNode }) {
  return <p className="text-sm text-[var(--text-muted)]">{children}</p>;
}

function FormTitle({ editing, noun }: { editing?: string; noun: string }) {
  return (
    <h3 className="font-semibold sm:col-span-2">{editing ? `Edit ${editing}` : `Add a ${noun}`}</h3>
  );
}

function CoordFields({ loc }: { loc?: Loc }) {
  return (
    <>
      <Field
        label="Latitude"
        name="latitude"
        type="number"
        step="any"
        defaultValue={loc?.latitude}
      />
      <Field
        label="Longitude"
        name="longitude"
        type="number"
        step="any"
        defaultValue={loc?.longitude}
      />
    </>
  );
}

function FormActions({ editing }: { editing: boolean }) {
  return (
    <div className="flex items-center gap-3 sm:col-span-2">
      <SubmitButton>{editing ? 'Save changes' : 'Add'}</SubmitButton>
      {editing ? (
        <Link href="/admin/locations" className="text-brand-700 text-sm hover:underline">
          Cancel
        </Link>
      ) : null}
    </div>
  );
}

function LocTable({
  table,
  rows,
  parentLabel,
  publicPath,
}: {
  table: 'countries' | 'regions' | 'cities';
  rows: (Loc & { parent: string })[];
  parentLabel: string;
  publicPath?: string;
}) {
  if (rows.length === 0) return <p className="mt-4 text-sm text-[var(--text-muted)]">None yet.</p>;
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[32rem] text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-left">
            <th className="py-2 font-medium">Name</th>
            <th className="py-2 font-medium">{parentLabel}</th>
            <th className="py-2 font-medium">Coordinates</th>
            <th className="py-2 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-[var(--border)] last:border-0">
              <td className="py-2">
                {publicPath ? (
                  <Link
                    href={`${publicPath}${r.slug}`}
                    className="hover:text-brand-700 font-medium"
                  >
                    {r.name}
                  </Link>
                ) : (
                  <span className="font-medium">{r.name}</span>
                )}
                {r.is_featured ? (
                  <span className="text-brand-700 ml-2 text-xs">featured</span>
                ) : null}
              </td>
              <td className="py-2 text-[var(--text-muted)]">{r.parent || '—'}</td>
              <td className="py-2 text-[var(--text-muted)]">
                {r.latitude !== null ? `${r.latitude}, ${r.longitude}` : '—'}
              </td>
              <td className="py-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/locations?edit=${table}:${r.id}`}
                    className="rounded-lg border border-[var(--border)] px-2.5 py-1 text-xs"
                  >
                    Edit
                  </Link>
                  <form action={deleteLocation}>
                    <input type="hidden" name="table" value={table} />
                    <input type="hidden" name="id" value={r.id} />
                    <DangerButton>Delete</DangerButton>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
