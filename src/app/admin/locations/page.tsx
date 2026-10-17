import Link from 'next/link';
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
  CellText,
  FormField,
  PageHeader,
  Pill,
  SwitchField,
  Tag,
  btn,
  inputCls,
  rowAct,
  selectCls,
  textareaCls,
} from '@/components/admin/kit';
import { DataTable, type TableRow } from '@/components/admin/data-table';
import { ConfirmButton, ModalForm } from '@/components/admin/dialog';

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
type Table = 'countries' | 'regions' | 'cities';

const COLS = 'id, slug, name, latitude, longitude, is_featured, intro_copy';
const TYPE: Record<Table, 'Country' | 'Region' | 'City'> = {
  countries: 'Country',
  regions: 'Region',
  cities: 'City',
};

function Common({ loc, k }: { loc?: Loc; k: string }) {
  return (
    <>
      {loc ? <input type="hidden" name="id" value={loc.id} /> : null}
      <FormField label="Name" htmlFor={`n-${k}`} required>
        <input id={`n-${k}`} name="name" required defaultValue={loc?.name} className={inputCls} />
      </FormField>
      <FormField label="Slug" htmlFor={`s-${k}`} help="Blank = from the name. Must be unique across countries, regions and cities.">
        <input id={`s-${k}`} name="slug" defaultValue={loc?.slug} className={inputCls} />
      </FormField>
    </>
  );
}

function Coords({ loc, k }: { loc?: Loc; k: string }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <FormField label="Latitude" htmlFor={`la-${k}`}>
        <input id={`la-${k}`} name="latitude" type="number" step="any" defaultValue={loc?.latitude ?? ''} className={inputCls} />
      </FormField>
      <FormField label="Longitude" htmlFor={`lo-${k}`}>
        <input id={`lo-${k}`} name="longitude" type="number" step="any" defaultValue={loc?.longitude ?? ''} className={inputCls} />
      </FormField>
    </div>
  );
}

function CountryFields({ c }: { c?: Country }) {
  const k = c?.id ?? 'new-country';
  return (
    <>
      <Common loc={c} k={k} />
      <FormField label="ISO code" htmlFor={`iso-${k}`}>
        <input id={`iso-${k}`} name="iso2" defaultValue={c?.iso2 ?? ''} placeholder="GB" className={inputCls} />
      </FormField>
      <Coords loc={c} k={k} />
    </>
  );
}

function RegionFields({ r, countries }: { r?: Region; countries: Country[] }) {
  const k = r?.id ?? 'new-region';
  return (
    <>
      <FormField label="Country" htmlFor={`rc-${k}`} required>
        <select
          id={`rc-${k}`}
          name="country_id"
          required
          defaultValue={r?.country_id ?? (countries.length === 1 ? countries[0]!.id : '')}
          className={selectCls}
        >
          <option value="">Choose…</option>
          {countries.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </FormField>
      <Common loc={r} k={k} />
      <Coords loc={r} k={k} />
    </>
  );
}

function CityFields({
  c,
  regions,
  countryName,
}: {
  c?: City;
  regions: Region[];
  countryName: Map<string, string>;
}) {
  const k = c?.id ?? 'new-city';
  return (
    <>
      <FormField label="Region" htmlFor={`cr-${k}`} required>
        <select id={`cr-${k}`} name="region_id" required defaultValue={c?.region_id ?? ''} className={selectCls}>
          <option value="">Choose…</option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}, {countryName.get(r.country_id) ?? ''}
            </option>
          ))}
        </select>
      </FormField>
      <Common loc={c} k={k} />
      <Coords loc={c} k={k} />
      <FormField label="Intro text for the city page" htmlFor={`ci-${k}`}>
        <textarea id={`ci-${k}`} name="intro_copy" rows={3} defaultValue={c?.intro_copy ?? ''} className={textareaCls} />
      </FormField>
      <SwitchField name="is_featured" label="Featured on the home page" defaultChecked={c?.is_featured} />
    </>
  );
}

export default async function AdminLocations() {
  await requireRole('editor');
  const supabase = await createClient();

  const [{ data: c }, { data: r }, { data: ci }, { data: used }] = await Promise.all([
    supabase.from('countries').select(`${COLS}, iso2`).order('name'),
    supabase.from('regions').select(`${COLS}, country_id`).order('name'),
    supabase.from('cities').select(`${COLS}, region_id`).order('name'),
    supabase.from('listings').select('country_id, region_id, city_id').limit(20000),
  ]);
  const countries = (c ?? []) as Country[];
  const regions = (r ?? []) as Region[];
  const cities = (ci ?? []) as City[];
  const countryName = new Map(countries.map((x) => [x.id, x.name]));
  const regionName = new Map(regions.map((x) => [x.id, x.name]));

  const uses = new Map<string, number>();
  for (const l of used ?? [])
    for (const id of [l.country_id, l.region_id, l.city_id])
      if (id) uses.set(id as string, (uses.get(id as string) ?? 0) + 1);

  const row = (
    table: Table,
    loc: Loc,
    depth: number,
    parent: string,
    edit: React.ReactNode,
  ): TableRow => {
    const type = TYPE[table];
    const count = uses.get(loc.id) ?? 0;
    return {
      id: loc.id,
      filter: type,
      selectable: false,
      search: [loc.name, loc.slug, parent, type].join(' '),
      sort: { name: loc.name, type, parent, count },
      cells: [
        <>
          <div className="flex max-w-full items-center gap-2 font-semibold">
            <span className="truncate">
              {'— '.repeat(depth)}
              {table === 'cities' ? (
                <Link href={`/city/${loc.slug}`} target="_blank" className="text-[#062347] hover:text-[#1884E7]">
                  {loc.name}
                </Link>
              ) : (
                loc.name
              )}
            </span>
            {loc.is_featured ? <Tag tone="gold">Featured</Tag> : null}
          </div>
          {loc.latitude !== null ? (
            <div className="text-xs text-[#64748B]">
              {loc.latitude}, {loc.longitude}
            </div>
          ) : null}
        </>,
        <Pill key="t" tone={type === 'Country' ? 'blue' : type === 'Region' ? 'teal' : 'slate'}>
          {type}
        </Pill>,
        <CellText key="p">{parent || '—'}</CellText>,
        <CellText key="c">{count}</CellText>,
      ],
      actions: (
        <>
          {edit}
          <form action={deleteLocation}>
            <input type="hidden" name="table" value={table} />
            <input type="hidden" name="id" value={loc.id} />
            <ConfirmButton
              className={rowAct.bad}
              title={`Delete ${loc.name}?`}
              body="A place that still has listings or places inside it can’t be deleted. This can’t be undone."
              ok="Delete"
              danger
            >
              Delete
            </ConfirmButton>
          </form>
        </>
      ),
    };
  };

  // Country → its regions → their cities, so the table reads as the tree.
  const rows: TableRow[] = [];
  const placed = new Set<string>();
  const pushCity = (x: City) => {
    placed.add(x.id);
    rows.push(
      row('cities', x, 2, regionName.get(x.region_id) ?? '', (
        <ModalForm trigger="Edit" triggerClassName={rowAct.base} title={`Edit ${x.name}`} action={saveCity} ok="Save">
          <CityFields c={x} regions={regions} countryName={countryName} />
        </ModalForm>
      )),
    );
  };
  const pushRegion = (x: Region) => {
    placed.add(x.id);
    rows.push(
      row('regions', x, 1, countryName.get(x.country_id) ?? '', (
        <ModalForm trigger="Edit" triggerClassName={rowAct.base} title={`Edit ${x.name}`} action={saveRegion} ok="Save">
          <RegionFields r={x} countries={countries} />
        </ModalForm>
      )),
    );
    cities.filter((y) => y.region_id === x.id).forEach(pushCity);
  };
  for (const x of countries) {
    rows.push(
      row('countries', x, 0, x.iso2 ?? '', (
        <ModalForm trigger="Edit" triggerClassName={rowAct.base} title={`Edit ${x.name}`} action={saveCountry} ok="Save">
          <CountryFields c={x} />
        </ModalForm>
      )),
    );
    regions.filter((y) => y.country_id === x.id).forEach(pushRegion);
  }
  regions.filter((y) => !placed.has(y.id)).forEach(pushRegion);
  cities.filter((y) => !placed.has(y.id)).forEach(pushCity);

  return (
    <>
      <PageHeader
        title="Locations"
        description="Country → Region → City. A listing is placed in a city; featured cities appear on the home page."
      >
        <form action={loadStarterData}>
          <ConfirmButton
            className={btn.secondary}
            title="Load starter data?"
            body="Adds the United Kingdom, United States and United Arab Emirates with their regions and major cities, plus common categories. Existing places are kept."
            ok="Load data"
          >
            Load starter data
          </ConfirmButton>
        </form>
        <ModalForm trigger="Add country" triggerClassName={btn.secondary} title="Add country" action={saveCountry} ok="Add">
          <CountryFields />
        </ModalForm>
        {countries.length ? (
          <ModalForm trigger="Add region" triggerClassName={btn.secondary} title="Add region" action={saveRegion} ok="Add">
            <RegionFields countries={countries} />
          </ModalForm>
        ) : null}
        {regions.length ? (
          <ModalForm trigger="Add city" triggerClassName={btn.primary} title="Add city" action={saveCity} ok="Add">
            <CityFields regions={regions} countryName={countryName} />
          </ModalForm>
        ) : null}
      </PageHeader>
      <DataTable
        columns={[
          { key: 'name', label: 'Name', width: 'minmax(200px,1.6fr)' },
          { key: 'type', label: 'Type', width: '130px' },
          { key: 'parent', label: 'Parent' },
          { key: 'count', label: 'Listings', width: '110px' },
        ]}
        rows={rows}
        pageSize={50}
        filters={[
          { value: 'all', label: 'All' },
          { value: 'Country', label: 'Country', count: countries.length },
          { value: 'Region', label: 'Region', count: regions.length },
          { value: 'City', label: 'City', count: cities.length },
        ]}
        searchPlaceholder="Search places…"
        actionsWidth="140px"
        emptyText="No places yet. Load the starter data or add a country."
      />
    </>
  );
}
