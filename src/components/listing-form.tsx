import { Check, Field, Select, SubmitButton, TextArea } from './admin-ui';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
// Monday first reads naturally in a form; day_of_week stays 0 = Sunday.
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export type EditableListing = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  category_id: string | null;
  phone_primary: string | null;
  phone_secondary: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  postal_code: string | null;
  city_id: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string;
  verification: string;
  is_featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
};

export type EditableHour = {
  day_of_week: number;
  opens_at: string | null;
  closes_at: string | null;
  is_closed: boolean;
  is_24h: boolean;
};

/**
 * One form for admin and for business owners. `staff` adds the fields only
 * moderators may set (status, verification, featured, slug, SEO); the owner
 * action ignores them even if posted, and RLS pins them as well.
 */
export function ListingForm({
  action,
  listing,
  hours = [],
  categories,
  cities,
  staff = false,
  submitLabel,
}: {
  action: (fd: FormData) => Promise<void>;
  listing?: EditableListing;
  hours?: EditableHour[];
  categories: { id: string; name: string }[];
  cities: { id: string; label: string }[];
  staff?: boolean;
  submitLabel: string;
}) {
  const hourByDay = new Map(hours.map((h) => [h.day_of_week, h]));

  return (
    <form action={action} className="space-y-8">
      {listing ? <input type="hidden" name="id" value={listing.id} /> : null}

      <fieldset className="surface-card grid gap-4 p-5 sm:grid-cols-2">
        <legend className="px-1 font-semibold">Business</legend>
        <Field label="Business name" name="name" required defaultValue={listing?.name} />
        <Select
          label="Category"
          name="category_id"
          defaultValue={listing?.category_id}
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
        />
        <div className="sm:col-span-2">
          <Field
            label="Tagline"
            name="tagline"
            defaultValue={listing?.tagline}
            hint="One short line shown under the name."
          />
        </div>
        <div className="sm:col-span-2">
          <TextArea
            label="Description"
            name="description"
            defaultValue={listing?.description}
            rows={6}
          />
        </div>
      </fieldset>

      <fieldset className="surface-card grid gap-4 p-5 sm:grid-cols-2">
        <legend className="px-1 font-semibold">Contact</legend>
        <Field
          label="Phone"
          name="phone_primary"
          type="tel"
          defaultValue={listing?.phone_primary}
        />
        <Field
          label="Second phone"
          name="phone_secondary"
          type="tel"
          defaultValue={listing?.phone_secondary}
        />
        <Field label="Email" name="email" type="email" defaultValue={listing?.email} />
        <Field
          label="Website"
          name="website"
          defaultValue={listing?.website}
          placeholder="example.com"
        />
      </fieldset>

      <fieldset className="surface-card grid gap-4 p-5 sm:grid-cols-2">
        <legend className="px-1 font-semibold">Location</legend>
        <Select
          label="City"
          name="city_id"
          required
          defaultValue={listing?.city_id}
          options={cities.map((c) => ({ value: c.id, label: c.label }))}
        />
        <Field label="Postal code" name="postal_code" defaultValue={listing?.postal_code} />
        <div className="sm:col-span-2">
          <Field label="Street address" name="address" defaultValue={listing?.address} />
        </div>
        <Field
          label="Latitude"
          name="latitude"
          type="number"
          step="any"
          defaultValue={listing?.latitude}
          hint="Optional. Needed for distance and 'nearest' search."
        />
        <Field
          label="Longitude"
          name="longitude"
          type="number"
          step="any"
          defaultValue={listing?.longitude}
        />
      </fieldset>

      <fieldset className="surface-card p-5">
        <legend className="px-1 font-semibold">Opening hours</legend>
        <p className="text-xs text-[var(--text-muted)]">
          Leave every day on “Not set” to hide opening hours on the page.
        </p>
        <div className="mt-4 space-y-3">
          {DAY_ORDER.map((d) => {
            const h = hourByDay.get(d);
            const mode = !h ? '' : h.is_closed ? 'closed' : h.is_24h ? '24h' : 'hours';
            return (
              <div
                key={d}
                className="grid grid-cols-[6rem_1fr] items-center gap-2 sm:grid-cols-[7rem_10rem_1fr_1fr]"
              >
                <span className="text-sm font-medium">{DAYS[d]}</span>
                <select
                  name={`h${d}_mode`}
                  defaultValue={mode}
                  aria-label={`${DAYS[d]} hours`}
                  className="focus:border-primary-container focus:ring-primary-container/20 h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-sm outline-hidden focus:ring-2"
                >
                  <option value="">Not set</option>
                  <option value="hours">Open</option>
                  <option value="closed">Closed</option>
                  <option value="24h">Open 24 hours</option>
                </select>
                <input
                  type="time"
                  name={`h${d}_open`}
                  aria-label={`${DAYS[d]} opens`}
                  defaultValue={h?.opens_at?.slice(0, 5) ?? ''}
                  className="focus:border-primary-container focus:ring-primary-container/20 col-start-2 h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-sm outline-hidden focus:ring-2 sm:col-start-auto"
                />
                <input
                  type="time"
                  name={`h${d}_close`}
                  aria-label={`${DAYS[d]} closes`}
                  defaultValue={h?.closes_at?.slice(0, 5) ?? ''}
                  className="focus:border-primary-container focus:ring-primary-container/20 col-start-2 h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-sm outline-hidden focus:ring-2 sm:col-start-auto"
                />
              </div>
            );
          })}
        </div>
      </fieldset>

      {staff ? (
        <fieldset className="surface-card grid gap-4 p-5 sm:grid-cols-2">
          <legend className="px-1 font-semibold">Publishing (staff only)</legend>
          <Select
            label="Status"
            name="status"
            required
            defaultValue={listing?.status ?? 'approved'}
            emptyLabel="Choose…"
            options={['approved', 'pending', 'draft', 'rejected', 'suspended'].map((s) => ({
              value: s,
              label: s,
            }))}
          />
          <Select
            label="Verification"
            name="verification"
            required
            defaultValue={listing?.verification ?? 'unverified'}
            emptyLabel="Choose…"
            options={['unverified', 'pending', 'verified', 'rejected'].map((s) => ({
              value: s,
              label: s,
            }))}
          />
          <Field
            label="Slug"
            name="slug"
            defaultValue={listing?.slug}
            hint="URL of the listing page. Blank = from the name."
          />
          <div className="flex items-end pb-2">
            <Check label="Featured" name="is_featured" defaultChecked={listing?.is_featured} />
          </div>
          <Field label="SEO title" name="seo_title" defaultValue={listing?.seo_title} />
          <Field
            label="SEO description"
            name="seo_description"
            defaultValue={listing?.seo_description}
          />
        </fieldset>
      ) : null}

      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}
