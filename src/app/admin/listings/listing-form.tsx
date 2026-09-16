'use client';

/*
 * One listing = one form = one transaction.
 *
 * Deliberately not a wizard. admin_save_listing() writes listings and its three
 * child tables in a single statement, so a multi-step flow would either need a
 * draft row per step (and half-saved listings when someone abandons step 3) or a
 * client-side buffer that no longer maps onto the one call the database offers.
 * A single <form> also means create and edit are the same component, and means
 * the whole thing still posts with JavaScript disabled — the collapsible
 * sections are <details>, which is markup, not script.
 *
 * useActionState gives the action a (prevState, formData) signature; see
 * node_modules/next/dist/docs/01-app/02-guides/forms.md.
 */

import Link from 'next/link';
import { useActionState, useMemo, useState } from 'react';
import {
  CheckboxGroup,
  Field,
  Input,
  Select,
  SubmitButton,
  Switch,
  Textarea,
  type Option,
} from '@/components/form';
import { StatusPill } from '@/components/admin/chrome';
import {
  LISTING_FORM_STATUSES,
  slugify,
  type ListingFormStatus,
  type SocialLink,
} from '@/lib/listing-schema';
import { emptySaveListingState } from './action-state';
import { saveListing } from './actions';
import { ImageManager, type AttachedImage } from './image-manager';
import {
  OpeningHoursField,
  emptyOpeningHours,
  type OpeningHoursValue,
} from './opening-hours-field';
import { SocialLinksField } from './social-links-field';

/* -------------------------------------------------------------------------- */
/* props                                                                       */
/* -------------------------------------------------------------------------- */

export type ListingFormOptions = {
  categories: { id: string; name: string; parent_id: string | null }[];
  countries: { id: string; name: string }[];
  regions: { id: string; name: string; country_id: string }[];
  cities: { id: string; name: string; region_id: string }[];
  areas: { id: string; name: string; city_id: string }[];
  amenities: { id: string; name: string }[];
};

export type ListingFormValues = {
  id: string | null;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category_id: string;
  subcategory_id: string;
  phone_primary: string;
  phone_secondary: string;
  email: string;
  website: string;
  address: string;
  postal_code: string;
  country_id: string;
  region_id: string;
  city_id: string;
  area_id: string;
  latitude: string;
  longitude: string;
  social_links: SocialLink[];
  video_url: string;
  seo_title: string;
  seo_description: string;
  is_featured: boolean;
  status: ListingFormStatus;
  hours: OpeningHoursValue;
  amenityIds: string[];
  images: AttachedImage[];
};

export function emptyListingValues(): ListingFormValues {
  return {
    id: null,
    name: '',
    slug: '',
    tagline: '',
    description: '',
    category_id: '',
    subcategory_id: '',
    phone_primary: '',
    phone_secondary: '',
    email: '',
    website: '',
    address: '',
    postal_code: '',
    country_id: '',
    region_id: '',
    city_id: '',
    area_id: '',
    latitude: '',
    longitude: '',
    social_links: [],
    video_url: '',
    seo_title: '',
    seo_description: '',
    is_featured: false,
    status: 'draft',
    hours: emptyOpeningHours(),
    amenityIds: [],
    images: [],
  };
}

/* -------------------------------------------------------------------------- */
/* sections                                                                    */
/* -------------------------------------------------------------------------- */

const SECTIONS = [
  { id: 'basics', title: 'Basics', fields: ['name', 'slug', 'tagline', 'description'] },
  {
    id: 'contact',
    title: 'Contact & social',
    fields: ['phone_primary', 'phone_secondary', 'email', 'website', 'social_links'],
  },
  {
    id: 'location',
    title: 'Location',
    fields: [
      'address',
      'postal_code',
      'country_id',
      'region_id',
      'city_id',
      'area_id',
      'latitude',
      'longitude',
    ],
  },
  { id: 'hours', title: 'Opening hours', fields: ['hours'] },
  { id: 'media', title: 'Media & video', fields: ['images', 'video_url'] },
  { id: 'amenities', title: 'Amenities', fields: ['amenities'] },
  {
    id: 'seo',
    title: 'SEO & status',
    fields: ['seo_title', 'seo_description', 'status', 'category_id', 'subcategory_id'],
  },
] as const;

const STATUS_LABELS: Record<ListingFormStatus, string> = {
  draft: 'Draft — not visible anywhere',
  pending: 'Pending — queued for moderation',
  approved: 'Approved — live on the site',
};

const toOptions = (rows: { id: string; name: string }[]): Option[] =>
  rows.map((row) => ({ value: row.id, label: row.name }));

/* -------------------------------------------------------------------------- */
/* the form                                                                    */
/* -------------------------------------------------------------------------- */

export function ListingForm({
  options,
  values,
  currentStatus,
  rejectionNote,
}: {
  options: ListingFormOptions;
  values: ListingFormValues;
  /** The real, un-editable status of an existing listing (may be rejected/suspended). */
  currentStatus?: string;
  rejectionNote?: string | null;
}) {
  const [state, formAction] = useActionState(saveListing, emptySaveListingState);
  const errors = state.errors;

  /* Slug follows the name until the admin edits it, then it is theirs. */
  const [name, setName] = useState(values.name);
  const [slug, setSlug] = useState(values.slug);
  const [slugTouched, setSlugTouched] = useState(values.slug !== '');
  const derivedSlug = slugTouched ? slug : slugify(name);

  /* Location cascade — each child list is filtered by the selected parent. */
  const [countryId, setCountryId] = useState(values.country_id);
  const [regionId, setRegionId] = useState(values.region_id);
  const [cityId, setCityId] = useState(values.city_id);
  const [areaId, setAreaId] = useState(values.area_id);

  const regions = useMemo(
    () => options.regions.filter((row) => row.country_id === countryId),
    [options.regions, countryId],
  );
  const cities = useMemo(
    () => options.cities.filter((row) => row.region_id === regionId),
    [options.cities, regionId],
  );
  const areas = useMemo(
    () => options.areas.filter((row) => row.city_id === cityId),
    [options.areas, cityId],
  );

  /* Category / subcategory. Subcategory offers everything except the chosen
     category, because the DB has no parent constraint and real taxonomies here
     are not always strictly two-level. */
  const [categoryId, setCategoryId] = useState(values.category_id);

  const [seoTitle, setSeoTitle] = useState(values.seo_title);

  const errorCount = (sectionId: string) =>
    SECTIONS.find((section) => section.id === sectionId)?.fields.reduce(
      (total, field) => total + (errors[field]?.length ?? 0),
      0,
    ) ?? 0;

  /* Which sections are expanded.
     Basics starts open, and any section holding an error is open — otherwise a
     failed save would report problems the admin cannot see. Manual toggles are
     remembered against the identity of the error object, so a new save result
     discards them and re-opens whatever now needs attention. No effect needed:
     the reset is a comparison during render, not a second pass. */
  const [toggled, setToggled] = useState<{
    token: unknown;
    map: Record<string, boolean>;
  }>({ token: errors, map: {} });
  const manual = toggled.token === errors ? toggled.map : {};
  const isOpen = (sectionId: string) =>
    manual[sectionId] ?? (sectionId === 'basics' || errorCount(sectionId) > 0);
  const setOpen = (sectionId: string, value: boolean) =>
    setToggled((current) => ({
      token: errors,
      map: { ...(current.token === errors ? current.map : {}), [sectionId]: value },
    }));

  const moderationLocked = currentStatus === 'rejected' || currentStatus === 'suspended';

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {/* Present on edit, absent on create — that is the entire insert/update
          switch as far as admin_save_listing is concerned. */}
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}

      {state.message && !state.ok ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
        >
          {state.message}
          {errors._form ? ` ${errors._form.join(' ')}` : ''}
        </p>
      ) : null}

      {moderationLocked ? (
        <div className="rounded-lg border border-[#ecc2be] bg-[#fbeceb] px-4 py-3 text-sm text-[#96231b]">
          <p className="font-medium">
            This listing is currently <StatusPill status={currentStatus ?? ''} />.
          </p>
          {rejectionNote ? <p className="mt-1">Reason on file: {rejectionNote}</p> : null}
          <p className="mt-1">
            Saving here moves it to whichever status you pick below and clears the reason.
          </p>
        </div>
      ) : null}

      {/* -------------------------------------------------------------- 1 */}
      <Section
        id="basics"
        title="Basics"
        open={isOpen('basics')}
        onToggle={setOpen}
        errorCount={errorCount('basics')}
      >
        <Input
          name="name"
          label="Business name"
          required
          maxLength={120}
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
          error={errors.name}
        />
        <Input
          name="slug"
          label="Slug"
          value={derivedSlug}
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(event.currentTarget.value);
          }}
          error={errors.slug}
          hint="Derived from the name. The database still guarantees uniqueness on save."
        />
        <Input
          name="tagline"
          label="Tagline"
          maxLength={160}
          defaultValue={values.tagline}
          error={errors.tagline}
          hint="One line, shown under the name on cards and the detail page."
        />
        <Textarea
          name="description"
          label="Description"
          rows={8}
          maxLength={5000}
          showCount
          defaultValue={values.description}
          error={errors.description}
        />
      </Section>

      {/* -------------------------------------------------------------- 2 */}
      <Section
        id="contact"
        title="Contact & social"
        open={isOpen('contact')}
        onToggle={setOpen}
        errorCount={errorCount('contact')}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            name="phone_primary"
            label="Primary phone"
            type="tel"
            maxLength={24}
            defaultValue={values.phone_primary}
            error={errors.phone_primary}
          />
          <Input
            name="phone_secondary"
            label="Secondary phone"
            type="tel"
            maxLength={24}
            defaultValue={values.phone_secondary}
            error={errors.phone_secondary}
          />
          <Input
            name="email"
            label="Email"
            type="email"
            defaultValue={values.email}
            error={errors.email}
            hint="Stored lowercase."
          />
          <Input
            name="website"
            label="Website"
            type="url"
            defaultValue={values.website}
            error={errors.website}
            hint="Full URL, including https://"
          />
        </div>
        <Field label="Social links">
          <SocialLinksField initial={values.social_links} error={errors.social_links} />
        </Field>
      </Section>

      {/* -------------------------------------------------------------- 3 */}
      <Section
        id="location"
        title="Location"
        open={isOpen('location')}
        onToggle={setOpen}
        errorCount={errorCount('location')}
      >
        <Input
          name="address"
          label="Street address"
          maxLength={300}
          defaultValue={values.address}
          error={errors.address}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            name="postal_code"
            label="Postal code"
            maxLength={20}
            defaultValue={values.postal_code}
            error={errors.postal_code}
          />
          <Select
            name="country_id"
            label="Country"
            placeholder="Not set"
            options={toOptions(options.countries)}
            value={countryId}
            error={errors.country_id}
            onChange={(event) => {
              // Changing a parent invalidates every child below it.
              setCountryId(event.currentTarget.value);
              setRegionId('');
              setCityId('');
              setAreaId('');
            }}
          />
          <Select
            name="region_id"
            label="Region"
            placeholder={countryId ? 'Not set' : 'Choose a country first'}
            options={toOptions(regions)}
            value={regionId}
            disabled={!countryId}
            error={errors.region_id}
            onChange={(event) => {
              setRegionId(event.currentTarget.value);
              setCityId('');
              setAreaId('');
            }}
          />
          <Select
            name="city_id"
            label="City"
            placeholder={regionId ? 'Not set' : 'Choose a region first'}
            options={toOptions(cities)}
            value={cityId}
            disabled={!regionId}
            error={errors.city_id}
            onChange={(event) => {
              setCityId(event.currentTarget.value);
              setAreaId('');
            }}
          />
          <Select
            name="area_id"
            label="Area"
            placeholder={cityId ? 'Not set' : 'Choose a city first'}
            options={toOptions(areas)}
            value={areaId}
            disabled={!cityId}
            error={errors.area_id}
            onChange={(event) => setAreaId(event.currentTarget.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            name="latitude"
            label="Latitude"
            inputMode="decimal"
            defaultValue={values.latitude}
            error={errors.latitude}
            hint="-90 to 90. Leave both coordinates empty if you do not have them."
          />
          <Input
            name="longitude"
            label="Longitude"
            inputMode="decimal"
            defaultValue={values.longitude}
            error={errors.longitude}
            hint="-180 to 180. Half a pair is rejected."
          />
        </div>
      </Section>

      {/* -------------------------------------------------------------- 4 */}
      <Section
        id="hours"
        title="Opening hours"
        open={isOpen('hours')}
        onToggle={setOpen}
        errorCount={errorCount('hours')}
      >
        <OpeningHoursField initial={values.hours} error={errors.hours} />
      </Section>

      {/* -------------------------------------------------------------- 5 */}
      <Section
        id="media"
        title="Media & video"
        open={isOpen('media')}
        onToggle={setOpen}
        errorCount={errorCount('media')}
      >
        <ImageManager initial={values.images} error={errors.images} />
        <Input
          name="video_url"
          label="Video URL"
          type="url"
          defaultValue={values.video_url}
          error={errors.video_url}
          hint="A YouTube watch link, a youtu.be link or a Vimeo link. Nothing else is accepted."
        />
      </Section>

      {/* -------------------------------------------------------------- 6 */}
      <Section
        id="amenities"
        title="Amenities"
        open={isOpen('amenities')}
        onToggle={setOpen}
        errorCount={errorCount('amenities')}
      >
        <CheckboxGroup
          name="amenity_ids"
          label="What this business offers"
          columns={3}
          options={options.amenities.map((amenity) => ({
            value: amenity.id,
            label: amenity.name,
          }))}
          defaultValue={values.amenityIds}
          error={errors.amenities}
        />
      </Section>

      {/* -------------------------------------------------------------- 7 */}
      <Section
        id="seo"
        title="SEO & status"
        open={isOpen('seo')}
        onToggle={setOpen}
        errorCount={errorCount('seo')}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            name="category_id"
            label="Category"
            required
            placeholder="Choose a category"
            options={toOptions(options.categories)}
            value={categoryId}
            onChange={(event) => setCategoryId(event.currentTarget.value)}
            error={errors.category_id}
            hint="Required: /category/[slug] is how most visitors find a listing."
          />
          <Select
            name="subcategory_id"
            label="Subcategory"
            placeholder="Not set"
            options={toOptions(options.categories.filter((row) => row.id !== categoryId))}
            defaultValue={values.subcategory_id}
            error={errors.subcategory_id}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Input
            name="seo_title"
            label="SEO title"
            maxLength={60}
            value={seoTitle}
            onChange={(event) => setSeoTitle(event.currentTarget.value)}
            error={errors.seo_title}
            hint="Falls back to the business name when empty."
          />
          <p
            aria-live="polite"
            className={`text-right text-xs tabular-nums ${
              seoTitle.length > 60 ? 'text-red-700' : 'text-[var(--text-muted)]'
            }`}
          >
            {seoTitle.length} / 60 characters
          </p>
        </div>

        <Textarea
          name="seo_description"
          label="SEO description"
          rows={3}
          maxLength={160}
          showCount
          defaultValue={values.seo_description}
          error={errors.seo_description}
        />

        <Select
          name="status"
          label="Status"
          required
          options={LISTING_FORM_STATUSES.map((value) => ({
            value,
            label: STATUS_LABELS[value],
          }))}
          defaultValue={values.status}
          error={errors.status}
          hint="Rejecting or suspending is done from the queue, so a reason is always recorded."
        />

        <Switch
          name="is_featured"
          label="Featured"
          defaultChecked={values.is_featured}
          hint="Featured listings surface on the home page and at the top of their category."
        />
      </Section>

      {/* Sticky, because the form is long and the save button must never be a
          scroll away from whatever the admin just typed. */}
      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center justify-end gap-3 border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3 sm:mx-0 sm:rounded-b-[var(--radius-card)]">
        <Link
          href="/admin/listings"
          className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)]"
        >
          Cancel
        </Link>
        <SubmitButton pendingLabel="Saving…">
          {values.id ? 'Save changes' : 'Create listing'}
        </SubmitButton>
      </div>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/* section shell                                                               */
/* -------------------------------------------------------------------------- */

function Section({
  id,
  title,
  open,
  onToggle,
  errorCount,
  children,
}: {
  id: string;
  title: string;
  open: boolean;
  onToggle: (sectionId: string, value: boolean) => void;
  errorCount: number;
  children: React.ReactNode;
}) {
  return (
    <details
      open={open}
      onToggle={(event) => onToggle(id, event.currentTarget.open)}
      className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]"
    >
      <summary className="focus-visible:outline-brand-700 font-display flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-base font-semibold focus-visible:outline-2 focus-visible:outline-offset-2">
        <span>{title}</span>
        <span className="flex items-center gap-2">
          {errorCount > 0 ? (
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
              {errorCount} to fix
            </span>
          ) : null}
          <span aria-hidden className="text-[var(--text-muted)]">
            {open ? '▾' : '▸'}
          </span>
        </span>
      </summary>
      <fieldset className="flex flex-col gap-4 border-t border-[var(--border)] px-4 py-4">
        <legend className="sr-only">{title}</legend>
        {children}
      </fieldset>
    </details>
  );
}
