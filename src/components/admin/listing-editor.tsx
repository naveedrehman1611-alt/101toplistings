import type { ReactNode } from 'react';
import type { EditableHour, EditableListing } from '@/components/listing-form';
import { FormShell, type Panel } from './form-shell';
import {
  FormField,
  PreviewNotice,
  Section,
  SwitchField,
  inputCls,
  selectCls,
  textareaCls,
} from './kit';
import { AmenityChips, CopyMondayButton } from './listing-editor-client';
import { OgPicker, type OgOption } from './og-picker';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
// Monday first reads naturally in a form; day_of_week stays 0 = Sunday.
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

function Input({
  id,
  name,
  defaultValue,
  ...rest
}: {
  id: string;
  name: string;
  defaultValue?: string | number | null;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'defaultValue'>) {
  return <input id={id} name={name} defaultValue={defaultValue ?? ''} className={inputCls} {...rest} />;
}

/**
 * The staff listing form in the admin design: six tabs over one form, so a
 * single Save posts everything to saveListingAsStaff with the same field names
 * as the shared ListingForm (business owners keep that one on /dashboard).
 * "Logo & photos" holds the existing image uploads, which are forms of their
 * own and so sit outside the main form.
 */
export function ListingEditor({
  action,
  listing: l,
  hours = [],
  categories,
  cities,
  amenities,
  selectedAmenities = [],
  areas = [],
  ownerName,
  ogOptions,
  images,
}: {
  action: (fd: FormData) => Promise<void>;
  listing?: EditableListing & { area_id?: string | null };
  hours?: EditableHour[];
  categories: { id: string; name: string }[];
  cities: { id: string; label: string }[];
  amenities: { id: string; name: string }[];
  selectedAmenities?: string[];
  areas?: { id: string; name: string }[];
  ownerName?: string | null;
  ogOptions: OgOption[];
  /** The image upload section; only an existing listing has one. */
  images?: ReactNode;
}) {
  const hourByDay = new Map(hours.map((h) => [h.day_of_week, h]));

  const basic: Panel = {
    id: 'basic',
    label: 'Basic info',
    content: (
      <Section title="Basic info">
        <FormField label="Business name" htmlFor="l-name" required>
          <Input id="l-name" name="name" required defaultValue={l?.name} />
        </FormField>
        <FormField label="Category" htmlFor="l-cat">
          <select id="l-cat" name="category_id" defaultValue={l?.category_id ?? ''} className={selectCls}>
            <option value="">—</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Tagline" htmlFor="l-tag" full help="One line shown under the name on listing cards.">
          <Input id="l-tag" name="tagline" defaultValue={l?.tagline} placeholder="e.g. Family-run since 1986" />
        </FormField>
        <FormField label="Description" htmlFor="l-desc" full>
          <textarea id="l-desc" name="description" rows={6} defaultValue={l?.description ?? ''} className={textareaCls} />
        </FormField>
      </Section>
    ),
  };

  const media: Panel = {
    id: 'media',
    label: 'Logo & photos',
    outside: true,
    content: <div className="[&>section]:mt-0">{images}</div>,
  };

  const contact: Panel = {
    id: 'contact',
    label: 'Contact & location',
    content: (
      <>
        <Section title="Contact">
          <FormField label="Phone" htmlFor="l-ph">
            <Input id="l-ph" name="phone_primary" type="tel" defaultValue={l?.phone_primary} />
          </FormField>
          <FormField label="Second phone / WhatsApp" htmlFor="l-ph2">
            <Input id="l-ph2" name="phone_secondary" type="tel" defaultValue={l?.phone_secondary} />
          </FormField>
          <FormField label="Email" htmlFor="l-em">
            <Input id="l-em" name="email" type="email" defaultValue={l?.email} />
          </FormField>
          <FormField label="Website" htmlFor="l-web">
            <Input id="l-web" name="website" defaultValue={l?.website} placeholder="https://" />
          </FormField>
        </Section>
        <Section title="Location">
          <FormField label="Street address" htmlFor="l-addr" full>
            <Input id="l-addr" name="address" defaultValue={l?.address} placeholder="Shop no., building, street" />
          </FormField>
          <FormField label="City" htmlFor="l-city" required>
            <select id="l-city" name="city_id" required defaultValue={l?.city_id ?? ''} className={selectCls}>
              <option value="">Choose…</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Area" htmlFor="l-area" isNew help="Preview: the area is shown but not saved from here yet.">
            {/* No name: saveListingAsStaff does not write area_id yet. */}
            <select id="l-area" defaultValue={l?.area_id ?? ''} className={selectCls}>
              <option value="">{areas.length ? 'None' : 'No areas in this city yet'}</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Postal code" htmlFor="l-pc">
            <Input id="l-pc" name="postal_code" defaultValue={l?.postal_code} />
          </FormField>
          <div />
          <FormField label="Latitude" htmlFor="l-lat">
            <Input id="l-lat" name="latitude" type="number" step="any" defaultValue={l?.latitude} />
          </FormField>
          <FormField
            label="Longitude"
            htmlFor="l-lng"
            help="Right-click the place in Google Maps to copy coordinates. Needed for distance and “nearest” search."
          >
            <Input id="l-lng" name="longitude" type="number" step="any" defaultValue={l?.longitude} />
          </FormField>
        </Section>
      </>
    ),
  };

  const hoursPanel: Panel = {
    id: 'hours',
    label: 'Opening hours',
    content: (
      <Section
        title="Opening hours"
        description="Used for the “Open now” label. Leave every day on “Not set” to hide opening hours."
        bodyClassName="px-5 pt-[18px] pb-5"
      >
        <div className="flex flex-col rounded-lg border border-[#E2E8F0]">
          {DAY_ORDER.map((d) => {
            const h = hourByDay.get(d);
            const mode = !h ? '' : h.is_closed ? 'closed' : h.is_24h ? '24h' : 'hours';
            const timeCls =
              'h-[34px] rounded-md border border-[#E2E8F0] px-2 text-sm outline-none focus:border-[#1884E7]';
            return (
              <div
                key={d}
                className="grid grid-cols-[100px_1fr] items-center gap-2.5 border-b border-[#F1F5F9] px-3.5 py-2 sm:grid-cols-[120px_150px_130px_24px_130px]"
              >
                <b className="text-[13.5px] font-semibold">{DAYS[d]}</b>
                <select
                  name={`h${d}_mode`}
                  defaultValue={mode}
                  aria-label={`${DAYS[d]} hours`}
                  className="h-[34px] rounded-md border border-[#E2E8F0] bg-white px-2 text-sm outline-none focus:border-[#1884E7]"
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
                  className={`${timeCls} col-start-2 sm:col-start-auto`}
                />
                <span className="hidden text-center text-[#94A3B8] sm:block">–</span>
                <input
                  type="time"
                  name={`h${d}_close`}
                  aria-label={`${DAYS[d]} closes`}
                  defaultValue={h?.closes_at?.slice(0, 5) ?? ''}
                  className={`${timeCls} col-start-2 sm:col-start-auto`}
                />
              </div>
            );
          })}
          <div className="px-3.5 py-2.5">
            <CopyMondayButton />
          </div>
        </div>
      </Section>
    ),
  };

  const amenitiesPanel: Panel = {
    id: 'amenities',
    label: 'Amenities',
    isNew: true,
    content: (
      <Section
        title="Amenities"
        isNew
        description="Pick what this business offers. The list is managed under Directory → Amenities."
        bodyClassName="flex flex-col gap-4 px-5 pt-[18px] pb-5"
      >
        <PreviewNotice>
          Preview: the chips show what is saved today, but changes here are not saved yet.
        </PreviewNotice>
        <AmenityChips amenities={amenities} selected={selectedAmenities} />
      </Section>
    ),
  };

  const status: Panel = {
    id: 'status',
    label: 'Status & SEO',
    content: (
      <>
        <Section title="Status">
          <FormField label="Status" htmlFor="l-status" required>
            <select id="l-status" name="status" required defaultValue={l?.status ?? 'approved'} className={selectCls}>
              {['approved', 'pending', 'draft', 'rejected', 'suspended'].map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Verification" htmlFor="l-ver" required help="Verified shows the teal badge on the listing.">
            <select id="l-ver" name="verification" required defaultValue={l?.verification ?? 'unverified'} className={selectCls}>
              {['unverified', 'pending', 'verified', 'rejected'].map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </FormField>
          {l ? (
            <FormField label="Owner account" full help="Owners manage their listing from /dashboard. Approve a claim to change it.">
              <div className="flex h-[38px] items-center rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-sm text-[#475569]">
                {ownerName ?? 'No owner'}
              </div>
            </FormField>
          ) : null}
          <SwitchField
            name="is_featured"
            label="Featured"
            defaultChecked={l?.is_featured}
            help="Pins the listing at the top of its category and city pages."
          />
        </Section>
        <Section title="URL & SEO">
          <FormField label="Slug" htmlFor="l-slug" full help="Blank = from the name.">
            <div className="flex items-center overflow-hidden rounded-lg border border-[#E2E8F0] bg-white focus-within:border-[#1884E7]">
              <span className="pl-3 text-sm text-[#94A3B8]">/listing/</span>
              <input
                id="l-slug"
                name="slug"
                defaultValue={l?.slug ?? ''}
                className="h-[38px] min-w-0 flex-1 border-0 bg-transparent px-1 text-sm outline-none"
              />
            </div>
          </FormField>
          <FormField label="SEO title" htmlFor="l-seot" full help="Aim for 60 characters or fewer.">
            <Input id="l-seot" name="seo_title" defaultValue={l?.seo_title} />
          </FormField>
          <FormField label="Meta description" htmlFor="l-seod" full help="Aim for 160 characters or fewer.">
            <textarea id="l-seod" name="seo_description" rows={3} defaultValue={l?.seo_description ?? ''} className={textareaCls} />
          </FormField>
          <FormField label="Social share image (OG)" full isNew>
            <OgPicker options={ogOptions} />
          </FormField>
        </Section>
      </>
    ),
  };

  const panels = [basic, ...(images ? [media] : []), contact, hoursPanel, amenitiesPanel, status];

  return (
    <FormShell
      action={action}
      hidden={l ? <input type="hidden" name="id" value={l.id} /> : null}
      panels={panels}
      saveLabel={l ? 'Save changes' : 'Add listing'}
      alwaysShowBar={!l}
    />
  );
}
