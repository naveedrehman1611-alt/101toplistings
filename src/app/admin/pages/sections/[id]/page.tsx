import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import { mediaUrl } from '@/lib/media';
import {
  BACKGROUNDS,
  BACKGROUND_LABELS,
  isBackground,
  isHomeSectionType,
  readSettings,
  sectionSpec,
  type ItemSpec,
  type RefType,
  type SettingSpec,
  type SettingValues,
} from '@/lib/sections';
import {
  deleteItem,
  moveItem,
  saveItem,
  saveSection,
  toggleItem,
  toggleSection,
} from '@/lib/section-actions';
import { ICON_NAMES, Icon, isIconName } from '@/components/icons';
import { Check, DangerButton, Notice, SubmitButton } from '@/components/admin-ui';
import { MediaSelect, type MediaOption } from '@/components/admin/media-select';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Edit section' };

type Client = Awaited<ReturnType<typeof createClient>>;

type SectionRow = {
  id: string;
  page_id: string;
  section_key: string;
  section_type: string;
  is_enabled: boolean;
  heading: string | null;
  subheading: string | null;
  body: string | null;
  image_id: string | null;
  cta_label: string | null;
  cta_url: string | null;
  background_variant: string | null;
  item_limit: number | null;
  settings: unknown;
  page: { slug: string; title: string; route_pattern: string } | null;
};

type ItemRow = {
  id: string;
  ref_type: string | null;
  ref_id: string | null;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  icon: string | null;
  image_id: string | null;
  url: string | null;
  is_enabled: boolean;
};

type Option = { value: string; label: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const REF_LABELS: Record<RefType, { label: string; choose: string }> = {
  category: { label: 'Category', choose: 'Choose a category…' },
  city: { label: 'City', choose: 'Choose a city…' },
  listing: { label: 'Business', choose: 'Choose a business…' },
  blog_post: { label: 'Article', choose: 'Choose an article…' },
};

const inputCls =
  'mt-1 h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus:border-brand-500';
const areaCls =
  'mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-brand-500';
const smallBtn =
  'rounded-lg border border-[var(--border)] px-2.5 py-1 text-xs hover:bg-[var(--surface-2)] disabled:opacity-40';

function plural(noun: string): string {
  if (/[^aeiou]y$/.test(noun)) return `${noun.slice(0, -1)}ies`;
  if (/(s|x|ch|sh)$/.test(noun)) return `${noun}es`;
  return `${noun}s`;
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function byLabel(a: Option, b: Option): number {
  return a.label.localeCompare(b.label);
}

/** The newest library uploads, which is what the pickers offer. */
async function loadMedia(supabase: Client): Promise<MediaOption[]> {
  const { data } = await supabase
    .from('media')
    .select('id, path, alt')
    .eq('folder', 'library')
    .order('created_at', { ascending: false })
    .limit(200);
  return ((data ?? []) as { id: string; path: string; alt: string | null }[]).map((m) => ({
    id: m.id,
    url: mediaUrl(m.path),
    alt: m.alt,
  }));
}

/** Choices for the one kind of row this section's items reference. */
async function loadRefOptions(supabase: Client, ref: RefType): Promise<Option[]> {
  switch (ref) {
    case 'category': {
      const { data } = await supabase.from('categories').select('id, name, parent_id');
      const rows = (data ?? []) as { id: string; name: string; parent_id: string | null }[];
      const names = new Map(rows.map((c) => [c.id, c.name]));
      return rows
        .map((c) => {
          const parent = c.parent_id ? names.get(c.parent_id) : undefined;
          return { value: c.id, label: parent ? `${parent} › ${c.name}` : c.name };
        })
        .sort(byLabel);
    }
    case 'city': {
      const { data } = await supabase.from('cities').select('id, name, region:regions(name)');
      const rows = (data ?? []) as unknown as {
        id: string;
        name: string;
        region: { name: string } | null;
      }[];
      return rows
        .map((c) => ({ value: c.id, label: c.region ? `${c.name}, ${c.region.name}` : c.name }))
        .sort(byLabel);
    }
    case 'listing': {
      const { data } = await supabase
        .from('public_listings')
        .select('id, name')
        .order('name')
        .limit(300);
      return ((data ?? []) as { id: string; name: string }[]).map((l) => ({
        value: l.id,
        label: l.name,
      }));
    }
    case 'blog_post': {
      const { data } = await supabase
        .from('blog_posts')
        .select('id, title')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(100);
      return ((data ?? []) as { id: string; title: string }[]).map((p) => ({
        value: p.id,
        label: p.title,
      }));
    }
  }
}

export default async function EditSection({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  await requireRole('editor');
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  if (!UUID.test(id)) notFound();

  // The cookie client runs as the editor, so hidden sections and items load too.
  const supabase = await createClient();
  const [{ data: sectionData }, { data: itemData }] = await Promise.all([
    supabase
      .from('page_sections')
      .select(
        'id, page_id, section_key, section_type, is_enabled, heading, subheading, body, image_id, ' +
          'cta_label, cta_url, background_variant, item_limit, settings, ' +
          'page:pages(slug, title, route_pattern)',
      )
      .eq('id', id)
      .maybeSingle(),
    supabase
      .from('section_items')
      .select('id, ref_type, ref_id, title, subtitle, body, icon, image_id, url, is_enabled')
      .eq('section_id', id)
      .order('sort_order')
      .order('id'),
  ]);
  if (!sectionData) notFound();
  const section = sectionData as unknown as SectionRow;

  const type = section.section_type;
  const spec = isHomeSectionType(type) ? sectionSpec(type) : null;
  const itemSpec = spec?.items;
  const items = itemSpec ? ((itemData ?? []) as ItemRow[]) : [];
  const [media, refOptions] = await Promise.all([
    spec?.image || itemSpec?.image ? loadMedia(supabase) : Promise.resolve([]),
    itemSpec?.ref ? loadRefOptions(supabase, itemSpec.ref) : Promise.resolve([]),
  ]);

  const page = section.page;
  const isHome = page?.slug === 'home';
  // Only a plain path on this site is linked; "/listing/[slug]" has no single page to view.
  const pageRoute = page && /^\/(?!\/)[^[]*$/.test(page.route_pattern) ? page.route_pattern : null;
  const settings: SettingValues = isHomeSectionType(type)
    ? readSettings(type, section.settings)
    : {};
  // The page renders a missing or unknown background as its default, so the
  // select starts on that (src/lib/home.ts).
  const background = isBackground(section.background_variant)
    ? section.background_variant
    : type === 'hero_search'
      ? 'navy'
      : 'white';

  return (
    <div>
      <p className="text-sm">
        <Link href="/admin/pages" className="text-brand-700 hover:underline">
          ← Back to pages
        </Link>
      </p>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold break-words">
            {spec?.label ?? 'Page header'}: {section.section_key}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {page ? `${page.title} page (${page.route_pattern})` : 'Unknown page'} ·{' '}
            {section.is_enabled ? 'shown on the site' : 'hidden from the site'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isHome ? (
            <Link
              href={`/#${section.section_key}`}
              className="text-brand-700 text-sm hover:underline"
            >
              View on site
            </Link>
          ) : pageRoute ? (
            <Link href={pageRoute} className="text-brand-700 text-sm hover:underline">
              View page
            </Link>
          ) : null}
          <form action={toggleSection}>
            <input type="hidden" name="id" value={section.id} />
            <input type="hidden" name="page_id" value={section.page_id} />
            <input type="hidden" name="enabled" value={section.is_enabled ? 'false' : 'true'} />
            <input type="hidden" name="return" value="editor" />
            <button type="submit" className={smallBtn}>
              {section.is_enabled ? 'Hide section' : 'Show section'}
            </button>
          </form>
        </div>
      </div>
      <Notice ok={sp.ok} error={sp.error} />

      <form action={saveSection} className="surface-card mt-6 grid gap-4 p-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <h2 className="text-lg font-semibold">Content</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {spec
              ? spec.description
              : `The ${page?.title ?? ''} page shows this copy in its header.`}
            {isHome
              ? ' Text may say {brand}, which is replaced with the brand name from Settings.'
              : null}
          </p>
        </div>
        <input type="hidden" name="id" value={section.id} />
        <input type="hidden" name="page_id" value={section.page_id} />
        <TextInput
          label="Heading"
          name="heading"
          maxLength={200}
          defaultValue={section.heading}
          required={type === 'hero_search'}
          hint={type === 'hero_search' ? 'The main heading (h1) of the page.' : undefined}
          wide
        />
        <TextBox
          label="Subheading"
          name="subheading"
          maxLength={400}
          rows={2}
          defaultValue={section.subheading}
        />
        {spec?.body ? (
          <TextBox
            label={spec.body}
            name="body"
            maxLength={8000}
            rows={12}
            defaultValue={section.body}
          />
        ) : null}
        {!spec || spec.cta ? (
          <>
            <TextInput
              label="Button label"
              name="cta_label"
              maxLength={100}
              defaultValue={section.cta_label}
              hint="Leave both button fields blank for no button."
            />
            <TextInput
              label="Button link"
              name="cta_url"
              maxLength={500}
              defaultValue={section.cta_url}
              placeholder="/business-directory or https://example.com"
            />
          </>
        ) : null}
        {spec ? (
          <SelectInput
            label="Background"
            name="background_variant"
            options={BACKGROUNDS.map((b) => ({ value: b, label: BACKGROUND_LABELS[b] }))}
            defaultValue={background}
          />
        ) : null}
        {spec?.itemLimit ? (
          <label className="block text-sm">
            <span className="font-medium">{spec.itemLimit.label}</span>
            <input
              type="number"
              name="item_limit"
              required
              min={spec.itemLimit.min}
              max={spec.itemLimit.max}
              step={1}
              defaultValue={Math.min(
                spec.itemLimit.max,
                Math.max(spec.itemLimit.min, section.item_limit ?? spec.itemLimit.default),
              )}
              className={inputCls}
            />
            <Hint>
              From {spec.itemLimit.min} to {spec.itemLimit.max}.
            </Hint>
          </label>
        ) : null}
        {spec?.image ? (
          <div className="sm:col-span-2">
            <MediaSelect
              name="image_id"
              label={spec.image}
              options={media}
              defaultValue={section.image_id}
            />
          </div>
        ) : null}
        {spec?.settings.map((s) => (
          <SettingField key={s.key} spec={s} value={settings[s.key] ?? s.default} />
        ))}
        <div className="sm:col-span-2">
          <SubmitButton>Save section</SubmitButton>
        </div>
      </form>

      {itemSpec ? (
        <Items
          sectionId={section.id}
          spec={itemSpec}
          items={items}
          media={media}
          refOptions={refOptions}
        />
      ) : null}
    </div>
  );
}

function Items({
  sectionId,
  spec,
  items,
  media,
  refOptions,
}: {
  sectionId: string;
  spec: ItemSpec;
  items: ItemRow[];
  media: MediaOption[];
  refOptions: Option[];
}) {
  const full = items.length >= spec.max;
  const refLabels = new Map(refOptions.map((o) => [o.value, o.label]));

  return (
    <section aria-labelledby="items-heading" className="mt-10">
      <h2 id="items-heading" className="text-lg font-semibold">
        {capitalise(plural(spec.noun))}{' '}
        <span className="text-sm font-normal text-[var(--text-muted)]">
          ({items.length} of at most {spec.max})
        </span>
      </h2>
      <p className="mt-1 max-w-2xl text-sm text-[var(--text-muted)]">{spec.hint}</p>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--text-muted)]">No {plural(spec.noun)} yet.</p>
      ) : (
        <ol className="mt-4 space-y-4">
          {items.map((item, i) => {
            const name =
              item.title?.trim() ||
              (item.ref_id ? refLabels.get(item.ref_id) : undefined) ||
              `Untitled ${spec.noun}`;
            const ids = (
              <>
                <input type="hidden" name="section_id" value={sectionId} />
                <input type="hidden" name="id" value={item.id} />
              </>
            );
            return (
              <li
                key={item.id}
                className={`surface-card p-4 ${item.is_enabled ? '' : 'bg-[var(--surface-2)]'}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="min-w-0 font-medium break-words">
                    {i + 1}. {name}
                    {item.is_enabled ? null : (
                      <span className="ml-2 text-xs font-normal text-[var(--text-muted)]">
                        (hidden)
                      </span>
                    )}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <form action={moveItem}>
                      {ids}
                      <input type="hidden" name="direction" value="up" />
                      <button type="submit" className={smallBtn} disabled={i === 0}>
                        Move up<span className="sr-only"> {name}</span>
                      </button>
                    </form>
                    <form action={moveItem}>
                      {ids}
                      <input type="hidden" name="direction" value="down" />
                      <button type="submit" className={smallBtn} disabled={i === items.length - 1}>
                        Move down<span className="sr-only"> {name}</span>
                      </button>
                    </form>
                    <form action={toggleItem}>
                      {ids}
                      <input
                        type="hidden"
                        name="enabled"
                        value={item.is_enabled ? 'false' : 'true'}
                      />
                      <button type="submit" className={smallBtn}>
                        {item.is_enabled ? 'Hide' : 'Show'}
                        <span className="sr-only"> {name}</span>
                      </button>
                    </form>
                    <form action={deleteItem}>
                      {ids}
                      <DangerButton>
                        Delete<span className="sr-only"> {name}</span>
                      </DangerButton>
                    </form>
                  </div>
                </div>
                <form action={saveItem} className="mt-4 grid gap-4 sm:grid-cols-2">
                  {ids}
                  <ItemFields spec={spec} item={item} media={media} refOptions={refOptions} />
                  <div className="sm:col-span-2">
                    <Check label="Enabled" name="is_enabled" defaultChecked={item.is_enabled} />
                  </div>
                  <div className="sm:col-span-2">
                    <SubmitButton>Save {spec.noun}</SubmitButton>
                  </div>
                </form>
              </li>
            );
          })}
        </ol>
      )}

      <form action={saveItem} className="surface-card mt-6 p-5">
        <h3 className="font-semibold">Add {spec.noun}</h3>
        {full ? (
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            This section already has its maximum of {spec.max} {plural(spec.noun)}. Delete one to
            add another.
          </p>
        ) : null}
        <input type="hidden" name="section_id" value={sectionId} />
        <fieldset
          disabled={full}
          className="mt-4 grid min-w-0 gap-4 disabled:opacity-60 sm:grid-cols-2"
        >
          <ItemFields spec={spec} item={null} media={media} refOptions={refOptions} />
          <div className="sm:col-span-2">
            <Check label="Enabled" name="is_enabled" defaultChecked />
          </div>
          <div className="sm:col-span-2">
            <SubmitButton>Add {spec.noun}</SubmitButton>
          </div>
        </fieldset>
      </form>
    </section>
  );
}

/** Only the fields the section type labels; the others are not rendered for it. */
function ItemFields({
  spec,
  item,
  media,
  refOptions,
}: {
  spec: ItemSpec;
  item: ItemRow | null;
  media: MediaOption[];
  refOptions: Option[];
}) {
  const refOnly = !spec.title && !spec.subtitle && !spec.body && !spec.image && !spec.url;
  return (
    <>
      {spec.ref ? (
        <div className="sm:col-span-2">
          <input type="hidden" name="ref_type" value={spec.ref} />
          <SelectInput
            label={REF_LABELS[spec.ref].label}
            name="ref_id"
            options={refOptions}
            defaultValue={item?.ref_id}
            required={refOnly}
            emptyLabel={refOnly ? REF_LABELS[spec.ref].choose : 'None'}
            savedLabel="Saved choice (not in this list)"
          />
        </div>
      ) : null}
      {spec.title ? (
        <TextInput label={spec.title} name="title" maxLength={200} defaultValue={item?.title} />
      ) : null}
      {spec.subtitle ? (
        <TextInput
          label={spec.subtitle}
          name="subtitle"
          maxLength={200}
          defaultValue={item?.subtitle}
        />
      ) : null}
      {spec.body ? (
        <TextBox
          label={spec.body}
          name="body"
          maxLength={4000}
          rows={5}
          defaultValue={item?.body}
        />
      ) : null}
      {spec.icon ? <IconField label={spec.icon} saved={item?.icon ?? null} /> : null}
      {spec.image ? (
        <MediaSelect
          name="image_id"
          label={spec.image}
          options={media}
          defaultValue={item?.image_id}
        />
      ) : null}
      {spec.url ? (
        <TextInput
          label={spec.url}
          name="url"
          maxLength={500}
          defaultValue={item?.url}
          placeholder="/business-directory or https://example.com"
        />
      ) : null}
    </>
  );
}

function Hint({ children }: { children: ReactNode }) {
  return <span className="mt-1 block text-xs text-[var(--text-muted)]">{children}</span>;
}

function TextInput({
  label,
  name,
  maxLength,
  defaultValue,
  placeholder,
  hint,
  required,
  wide,
}: {
  label: string;
  name: string;
  maxLength: number;
  defaultValue?: string | null;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  wide?: boolean;
}) {
  return (
    <label className={`block text-sm ${wide ? 'sm:col-span-2' : ''}`}>
      <span className="font-medium">
        {label}
        {required ? <span className="text-red-700"> *</span> : null}
      </span>
      <input
        name={name}
        maxLength={maxLength}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue ?? ''}
        className={inputCls}
      />
      {hint ? <Hint>{hint}</Hint> : null}
    </label>
  );
}

function TextBox({
  label,
  name,
  maxLength,
  rows,
  defaultValue,
}: {
  label: string;
  name: string;
  maxLength: number;
  rows: number;
  defaultValue?: string | null;
}) {
  return (
    <label className="block text-sm sm:col-span-2">
      <span className="font-medium">{label}</span>
      <textarea
        name={name}
        maxLength={maxLength}
        rows={rows}
        defaultValue={defaultValue ?? ''}
        className={areaCls}
      />
    </label>
  );
}

function SelectInput({
  label,
  name,
  options,
  defaultValue,
  hint,
  required,
  emptyLabel,
  savedLabel,
}: {
  label: string;
  name: string;
  options: readonly Option[];
  defaultValue?: string | null;
  hint?: string;
  required?: boolean;
  /** Adds an empty first option with this text. */
  emptyLabel?: string;
  /** Keeps a saved value that is not among the options, so a save cannot drop it. */
  savedLabel?: string;
}) {
  const unlisted =
    savedLabel && defaultValue && !options.some((o) => o.value === defaultValue)
      ? defaultValue
      : null;
  return (
    <label className="block text-sm">
      <span className="font-medium">
        {label}
        {required ? <span className="text-red-700"> *</span> : null}
      </span>
      <select
        name={name}
        required={required}
        defaultValue={defaultValue ?? ''}
        className={inputCls}
      >
        {emptyLabel ? <option value="">{emptyLabel}</option> : null}
        {unlisted ? <option value={unlisted}>{savedLabel}</option> : null}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint ? <Hint>{hint}</Hint> : null}
    </label>
  );
}

function SettingField({ spec, value }: { spec: SettingSpec; value: string | boolean }) {
  const name = `setting.${spec.key}`;
  if (spec.kind === 'boolean') {
    return (
      <div className="text-sm sm:col-span-2">
        <label className="flex items-center gap-2">
          <input type="checkbox" name={name} defaultChecked={value === true} className="size-4" />
          <span className="font-medium">{spec.label}</span>
        </label>
        {spec.hint ? <Hint>{spec.hint}</Hint> : null}
      </div>
    );
  }
  if (spec.kind === 'select') {
    return (
      <SelectInput
        label={spec.label}
        name={name}
        options={spec.options}
        defaultValue={String(value)}
        hint={spec.hint}
      />
    );
  }
  return (
    <TextInput
      label={spec.label}
      name={name}
      maxLength={spec.max}
      defaultValue={String(value)}
      placeholder={spec.default}
      hint={[spec.hint, `Blank restores the default, “${spec.default}”.`].filter(Boolean).join(' ')}
    />
  );
}

/** The preview draws the saved icon; the select has no client script to follow it live. */
function IconField({ label, saved }: { label: string; saved: string | null }) {
  const unknown = saved && !isIconName(saved) ? saved : null;
  return (
    <div className="flex items-end gap-2 text-sm">
      <label className="block min-w-0 flex-1">
        <span className="font-medium">{label}</span>
        <select name="icon" defaultValue={saved ?? ''} className={inputCls}>
          <option value="">No icon</option>
          {unknown ? <option value={unknown}>{unknown} (not available)</option> : null}
          {ICON_NAMES.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
      <span
        title="Saved icon"
        className="text-brand-700 flex size-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)]"
      >
        <Icon name={saved ?? undefined} size={20} />
      </span>
    </div>
  );
}
