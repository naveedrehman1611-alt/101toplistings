'use server';

import { randomBytes } from 'node:crypto';
import { createClient } from './supabase-server';
import { requireRole } from './auth';
import { writeAudit } from './audit';
import { check, runAndReturn } from './action-flow';
import { FormError, bool, num, text, uuid } from './form-data';
import { checkLink } from './link-rules';
import { tableTag } from './supabase';
import {
  isBackground,
  isHomeSectionType,
  sectionSpec,
  type ItemSpec,
  type RefType,
  type SectionSpec,
} from './sections';
import { isIconName } from '@/components/icons';

// The page builder behind Admin → Pages & sections. Each action re-checks the
// role itself: a Server Action is a public endpoint, so the admin layout's check
// does not protect it. RLS enforces it a third time.
//
// Every field is written only when the section type's spec (src/lib/sections.ts)
// shows it in the editor, so a hidden field is never cleared by a save.

const LIST = '/admin/pages';

type Client = Awaited<ReturnType<typeof createClient>>;

type SectionRow = {
  id: string;
  page_id: string;
  section_key: string;
  section_type: string;
  sort_order: number;
  is_enabled: boolean;
  heading: string | null;
  settings: unknown;
};

type ItemRow = {
  id: string;
  section_id: string;
  sort_order: number;
  title: string | null;
  is_enabled: boolean;
};

type Ordered = { id: string; sort_order: number };

type Scope = { tags: string[]; paths: { path: string }[] };

/** Where each item reference points, and how to name it in a message. */
const REFS: Record<RefType, { table: string; noun: string; one: string }> = {
  category: { table: 'categories', noun: 'category', one: 'a category' },
  city: { table: 'cities', noun: 'city', one: 'a city' },
  listing: { table: 'listings', noun: 'business', one: 'a business' },
  blog_post: { table: 'blog_posts', noun: 'article', one: 'an article' },
};

/** What a section or item write makes stale: the cached section reads and the pages showing them. */
function pageScope(): Scope {
  return {
    tags: [tableTag('page_sections'), tableTag('section_items')],
    paths: [{ path: '/' }, { path: LIST }],
  };
}

/**
 * Adds the edited page's own route. The route is only known once the write has
 * loaded the section; runAndReturn reads the scope after the write resolves.
 */
function addRoute(scope: Scope, route: string) {
  if (route !== '/' && !route.includes('[')) scope.paths.push({ path: route });
}

/** The editor of the section a form posted, or the list when the id is missing or malformed. */
function editorFor(fd: FormData, key: string): string {
  try {
    const id = uuid(fd, key);
    return id ? `${LIST}/sections/${id}` : LIST;
  } catch {
    return LIST;
  }
}

function requireId(fd: FormData, key: string): string {
  const id = uuid(fd, key);
  if (!id) throw new FormError('Nothing selected.');
  return id;
}

function readDirection(fd: FormData): 'up' | 'down' {
  const direction = text(fd, 'direction', 10);
  if (direction !== 'up' && direction !== 'down') throw new FormError('Unknown direction.');
  return direction;
}

/** The state a show/hide form asks for, so a stale page cannot flip it the wrong way. */
function wantedState(fd: FormData, current: boolean): boolean {
  const wanted = text(fd, 'enabled', 5);
  return wanted === 'true' ? true : wanted === 'false' ? false : !current;
}

function jsonObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

async function loadSection(supabase: Client, id: string) {
  const data = check(
    await supabase
      .from('page_sections')
      .select('*, page:pages(route_pattern)')
      .eq('id', id)
      .maybeSingle(),
  ) as (SectionRow & { page: { route_pattern: string } | null }) | null;
  if (!data) throw new FormError('Section not found. It may have been deleted.');
  const { page, ...section } = data;
  const spec = isHomeSectionType(section.section_type) ? sectionSpec(section.section_type) : null;
  return { section, route: page?.route_pattern ?? '/', spec };
}

/** Forms name the page they were rendered for; a mismatch means a stale or forged form. */
function assertPage(fd: FormData, section: SectionRow) {
  const pageId = uuid(fd, 'page_id');
  if (pageId && pageId !== section.page_id) {
    throw new FormError('That section belongs to another page. Reload and try again.');
  }
}

async function loadItem(supabase: Client, id: string, sectionId: string): Promise<ItemRow> {
  const row = check(
    await supabase.from('section_items').select('*').eq('id', id).maybeSingle(),
  ) as ItemRow | null;
  if (!row) throw new FormError('Item not found. It may have been deleted.');
  if (row.section_id !== sectionId) throw new FormError('That item belongs to another section.');
  return row;
}

function sectionName(section: SectionRow): string {
  return `the ${section.section_key} section`;
}

/** For messages that open with a name. */
function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function itemName(title: string | null, spec: SectionSpec | null): string {
  const noun = spec?.items?.noun ?? 'item';
  const t = title?.trim();
  return t ? `the ${noun} “${t.length > 60 ? `${t.slice(0, 59)}…` : t}”` : `the ${noun}`;
}

/** An image id from a picker; it must still exist, since the column would just go null. */
async function readMedia(supabase: Client, fd: FormData, key: string): Promise<string | null> {
  const id = uuid(fd, key);
  if (!id) return null;
  const row = check(await supabase.from('media').select('id').eq('id', id).maybeSingle());
  if (!row) throw new FormError('That image no longer exists. Choose another one.');
  return id;
}

function readLink(fd: FormData, key: string, label: string): string | null {
  const raw = text(fd, key, 500);
  return raw ? checkLink(raw, label).url : null;
}

/** The page shows a button only with both, so one without the other is refused, not hidden. */
function readCta(fd: FormData) {
  const label = text(fd, 'cta_label', 100);
  const url = readLink(fd, 'cta_url', 'Button link');
  if (Boolean(label) !== Boolean(url)) {
    throw new FormError('Give the button both a label and a link, or leave both blank.');
  }
  return { cta_label: label, cta_url: url };
}

function readLimit(fd: FormData, spec: NonNullable<SectionSpec['itemLimit']>): number {
  const n = num(fd, 'item_limit', spec.label);
  if (n === null) return spec.default;
  return Math.min(spec.max, Math.max(spec.min, Math.round(n)));
}

/** The type's typed settings from the form; keys it does not declare are never read. */
function readSettingFields(fd: FormData, spec: SectionSpec): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {};
  for (const s of spec.settings) {
    const field = `setting.${s.key}`;
    if (s.kind === 'boolean') {
      out[s.key] = bool(fd, field);
    } else if (s.kind === 'select') {
      const value = text(fd, field, 100);
      if (value !== null && !s.options.some((o) => o.value === value)) {
        throw new FormError(`Choose one of the listed options for ${s.label}.`);
      }
      out[s.key] = value ?? s.default;
    } else {
      // Blank restores the default, so a cleared field never leaves a label empty.
      out[s.key] = text(fd, field, s.max) ?? s.default;
    }
  }
  return out;
}

function readIcon(fd: FormData): string | null {
  const icon = text(fd, 'icon', 60);
  if (icon === null) return null;
  if (!isIconName(icon)) throw new FormError('Choose an icon from the list.');
  return icon;
}

/** A referenced row must exist, and the section must be the kind that references it. */
async function readRef(
  supabase: Client,
  fd: FormData,
  ref: RefType,
  sectionId: string,
  itemId: string | null,
): Promise<string | null> {
  const posted = text(fd, 'ref_type', 20);
  if (posted && posted !== ref) throw new FormError('That kind of link does not belong here.');
  const id = uuid(fd, 'ref_id');
  if (!id) return null;

  const { table, noun } = REFS[ref];
  let query = supabase.from(table).select('id').eq('id', id);
  // Pinned cards are read from public_listings, which only has approved rows.
  if (ref === 'listing') query = query.eq('status', 'approved');
  if (!check(await query.maybeSingle())) {
    throw new FormError(
      ref === 'listing'
        ? 'That business is not approved, so it cannot be shown. Choose another.'
        : `That ${noun} no longer exists. Choose another.`,
    );
  }

  // A pinned business or article listed twice would be shown twice.
  if (ref === 'listing' || ref === 'blog_post') {
    let dupes = supabase
      .from('section_items')
      .select('id', { count: 'exact', head: true })
      .eq('section_id', sectionId)
      .eq('ref_id', id);
    if (itemId) dupes = dupes.neq('id', itemId);
    const { count } = await dupes;
    if (count) throw new FormError(`That ${noun} is already pinned in this section.`);
  }
  return id;
}

/** An item with nothing in it renders nothing, so saving one is almost certainly a slip. */
function assertContent(row: Record<string, unknown>, spec: ItemSpec) {
  const refOnly = !spec.title && !spec.subtitle && !spec.body && !spec.image && !spec.url;
  if (spec.ref && refOnly && !row.ref_id) throw new FormError(`Choose ${REFS[spec.ref].one}.`);
  if (!['title', 'subtitle', 'body', 'image_id', 'url', 'ref_id'].some((k) => row[k])) {
    throw new FormError(`The ${spec.noun} is empty. Fill in at least one field.`);
  }
}

/**
 * Moves a row one place among its ordered siblings. With distinct sort orders
 * it swaps values with its neighbour. Rows seeded or edited by hand can share
 * a value, where a swap would change nothing, so then the list is renumbered
 * 10, 20, 30… in its new order.
 */
async function reorder(
  supabase: Client,
  table: 'page_sections' | 'section_items',
  rows: Ordered[],
  id: string,
  direction: 'up' | 'down',
): Promise<{ before: Ordered[]; after: Ordered[] } | null> {
  const from = rows.findIndex((r) => r.id === id);
  const to = direction === 'up' ? from - 1 : from + 1;
  if (from < 0 || to < 0 || to >= rows.length) return null;

  const current = new Map(rows.map((r) => [r.id, r.sort_order]));
  const distinct = rows.every((r, i) => i === 0 || r.sort_order > rows[i - 1].sort_order);
  let after: Ordered[];
  if (distinct) {
    after = [
      { id: rows[from].id, sort_order: rows[to].sort_order },
      { id: rows[to].id, sort_order: rows[from].sort_order },
    ];
  } else {
    const moved = [...rows];
    [moved[from], moved[to]] = [moved[to], moved[from]];
    after = moved
      .map((r, i) => ({ id: r.id, sort_order: (i + 1) * 10 }))
      .filter((r) => current.get(r.id) !== r.sort_order);
  }
  for (const row of after) {
    check(await supabase.from(table).update({ sort_order: row.sort_order }).eq('id', row.id));
  }
  const before = after.map((r) => ({ id: r.id, sort_order: current.get(r.id) ?? 0 }));
  return { before, after };
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

export async function saveSection(fd: FormData) {
  const user = await requireRole('editor');
  const scope = pageScope();
  await runAndReturn(
    editorFor(fd, 'id'),
    async () => {
      const supabase = await createClient();
      const { section: before, route, spec } = await loadSection(supabase, requireId(fd, 'id'));
      assertPage(fd, before);
      addRoute(scope, route);

      const patch: Record<string, unknown> = {
        heading: text(fd, 'heading', 200),
        subheading: text(fd, 'subheading', 400),
      };
      if (before.section_type === 'hero_search' && !patch.heading) {
        throw new FormError('The hero needs a heading: it is the main heading of the page.');
      }
      // Sections outside the registry are page headers, whose pages render
      // only this copy and a button.
      if (!spec || spec.cta) Object.assign(patch, readCta(fd));
      if (spec) {
        if (spec.body) patch.body = text(fd, 'body', 8000);
        if (spec.image) patch.image_id = await readMedia(supabase, fd, 'image_id');
        if (spec.itemLimit) patch.item_limit = readLimit(fd, spec.itemLimit);
        const background = text(fd, 'background_variant', 20);
        if (!isBackground(background)) throw new FormError('Choose a background.');
        patch.background_variant = background;
        // Merged over the stored JSON, so keys a migration wrote survive.
        patch.settings = { ...jsonObject(before.settings), ...readSettingFields(fd, spec) };
      }

      const after = check(
        await supabase
          .from('page_sections')
          .update(patch)
          .eq('id', before.id)
          .select('*')
          .maybeSingle(),
      );
      await writeAudit(user.id, 'update', 'page_section', before.id, before, after);
      return `Saved ${sectionName(before)}.`;
    },
    scope,
  );
}

export async function addSection(fd: FormData) {
  const user = await requireRole('editor');
  const scope = pageScope();
  await runAndReturn(
    LIST,
    async () => {
      const supabase = await createClient();
      const type = text(fd, 'type', 40);
      if (!type || !isHomeSectionType(type)) throw new FormError('Choose a section type.');
      const page = check(
        await supabase.from('pages').select('id').eq('slug', 'home').maybeSingle(),
      ) as { id: string } | null;
      if (!page) throw new FormError('The homepage is missing from the pages table.');

      const siblings = check(
        await supabase
          .from('page_sections')
          .select('section_type, sort_order')
          .eq('page_id', page.id),
      ) as { section_type: string; sort_order: number }[];
      // The hero's heading is the page's only h1, and a second search bar would repeat the first.
      if (type === 'hero_search' && siblings.some((s) => s.section_type === 'hero_search')) {
        throw new FormError('The homepage already has a hero. Edit that one instead.');
      }

      const after = check(
        await supabase
          .from('page_sections')
          .insert({
            page_id: page.id,
            section_key: `${type}-${randomBytes(3).toString('hex')}`,
            section_type: type,
            sort_order: siblings.reduce((max, s) => Math.max(max, s.sort_order), 0) + 10,
            heading: text(fd, 'heading', 200),
            // Defaults are applied when the page renders.
            settings: {},
            // Nothing half-built goes live: it is shown once an editor turns it on.
            is_enabled: false,
          })
          .select('*')
          .single(),
      ) as SectionRow;
      await writeAudit(user.id, 'create', 'page_section', after.id, null, after);
      return `Added ${sectionName(after)} (${sectionSpec(type).label}) at the end of the homepage. It stays hidden until you enable it.`;
    },
    scope,
  );
}

export async function deleteSection(fd: FormData) {
  const user = await requireRole('editor');
  const scope = pageScope();
  await runAndReturn(
    LIST,
    async () => {
      const supabase = await createClient();
      const { section, route, spec } = await loadSection(supabase, requireId(fd, 'id'));
      assertPage(fd, section);
      // Only builder sections can be added back, so a page's own header is
      // never deleted; disabling it takes it off the page just the same.
      if (!spec) {
        throw new FormError(
          `${capitalise(sectionName(section))} is part of its page's layout and cannot be deleted. Disable it instead.`,
        );
      }
      if (!bool(fd, 'confirm')) throw new FormError('Tick Confirm to delete the section.');
      addRoute(scope, route);

      // Its items go with it (on delete cascade), so the audit row keeps them too.
      const items = check(
        await supabase
          .from('section_items')
          .select('*')
          .eq('section_id', section.id)
          .order('sort_order'),
      );
      check(await supabase.from('page_sections').delete().eq('id', section.id));
      await writeAudit(user.id, 'delete', 'page_section', section.id, { ...section, items }, null);
      return `Deleted ${sectionName(section)}.`;
    },
    scope,
  );
}

export async function moveSection(fd: FormData) {
  const user = await requireRole('editor');
  const scope = pageScope();
  await runAndReturn(
    LIST,
    async () => {
      const supabase = await createClient();
      const direction = readDirection(fd);
      const { section, route } = await loadSection(supabase, requireId(fd, 'id'));
      assertPage(fd, section);
      addRoute(scope, route);

      const siblings = check(
        await supabase
          .from('page_sections')
          .select('id, sort_order')
          .eq('page_id', section.page_id)
          .order('sort_order')
          .order('id'),
      ) as Ordered[];
      const change = await reorder(supabase, 'page_sections', siblings, section.id, direction);
      if (!change) {
        return `${capitalise(sectionName(section))} is already at the ${direction === 'up' ? 'top' : 'bottom'}.`;
      }
      await writeAudit(
        user.id,
        'update',
        'page_section',
        section.id,
        { order: change.before },
        { order: change.after },
      );
      return `Moved ${sectionName(section)} ${direction}.`;
    },
    scope,
  );
}

export async function toggleSection(fd: FormData) {
  const user = await requireRole('editor');
  const scope = pageScope();
  // The section editor has the same switch and asks to come back to itself.
  const back = text(fd, 'return', 10) === 'editor' ? editorFor(fd, 'id') : LIST;
  await runAndReturn(
    back,
    async () => {
      const supabase = await createClient();
      const { section: before, route } = await loadSection(supabase, requireId(fd, 'id'));
      assertPage(fd, before);
      addRoute(scope, route);

      const enabled = wantedState(fd, before.is_enabled);
      const after = check(
        await supabase
          .from('page_sections')
          .update({ is_enabled: enabled })
          .eq('id', before.id)
          .select('*')
          .maybeSingle(),
      );
      await writeAudit(user.id, 'update', 'page_section', before.id, before, after);
      return enabled
        ? `${capitalise(sectionName(before))} is shown on the site.`
        : `${capitalise(sectionName(before))} is hidden.`;
    },
    scope,
  );
}

// ---------------------------------------------------------------------------
// Items
// ---------------------------------------------------------------------------

/** Creates an item when the form has no id, otherwise updates that item. */
export async function saveItem(fd: FormData) {
  const user = await requireRole('editor');
  const scope = pageScope();
  await runAndReturn(
    editorFor(fd, 'section_id'),
    async () => {
      const supabase = await createClient();
      const { section, route, spec } = await loadSection(supabase, requireId(fd, 'section_id'));
      const items = spec?.items;
      if (!items) throw new FormError('This section has no items.');
      addRoute(scope, route);
      const id = uuid(fd, 'id');
      const before = id ? await loadItem(supabase, id, section.id) : null;

      const row: Record<string, unknown> = { is_enabled: bool(fd, 'is_enabled') };
      if (items.title) row.title = text(fd, 'title', 200);
      if (items.subtitle) row.subtitle = text(fd, 'subtitle', 200);
      if (items.body) row.body = text(fd, 'body', 4000);
      if (items.icon) row.icon = readIcon(fd);
      if (items.image) row.image_id = await readMedia(supabase, fd, 'image_id');
      if (items.url) row.url = readLink(fd, 'url', 'Link');
      if (items.ref) {
        const refId = await readRef(supabase, fd, items.ref, section.id, before?.id ?? null);
        row.ref_type = refId ? items.ref : null;
        row.ref_id = refId;
      }
      assertContent(row, items);

      if (before) {
        const after = check(
          await supabase
            .from('section_items')
            .update(row)
            .eq('id', before.id)
            .select('*')
            .maybeSingle(),
        ) as ItemRow | null;
        await writeAudit(user.id, 'update', 'section_item', before.id, before, after);
        return `Saved ${itemName(after?.title ?? null, spec)}.`;
      }

      const existing = check(
        await supabase.from('section_items').select('sort_order').eq('section_id', section.id),
      ) as { sort_order: number }[];
      if (existing.length >= items.max) {
        throw new FormError(`This section already has its maximum of ${items.max}.`);
      }
      const after = check(
        await supabase
          .from('section_items')
          .insert({
            ...row,
            section_id: section.id,
            sort_order: existing.reduce((max, r) => Math.max(max, r.sort_order), 0) + 10,
          })
          .select('*')
          .single(),
      ) as ItemRow;
      await writeAudit(user.id, 'create', 'section_item', after.id, null, after);
      return `Added ${itemName(after.title, spec)}.`;
    },
    scope,
  );
}

export async function deleteItem(fd: FormData) {
  const user = await requireRole('editor');
  const scope = pageScope();
  await runAndReturn(
    editorFor(fd, 'section_id'),
    async () => {
      const supabase = await createClient();
      const { section, route, spec } = await loadSection(supabase, requireId(fd, 'section_id'));
      addRoute(scope, route);
      const before = await loadItem(supabase, requireId(fd, 'id'), section.id);
      check(await supabase.from('section_items').delete().eq('id', before.id));
      await writeAudit(user.id, 'delete', 'section_item', before.id, before, null);
      return `Deleted ${itemName(before.title, spec)}.`;
    },
    scope,
  );
}

export async function moveItem(fd: FormData) {
  const user = await requireRole('editor');
  const scope = pageScope();
  await runAndReturn(
    editorFor(fd, 'section_id'),
    async () => {
      const supabase = await createClient();
      const direction = readDirection(fd);
      const { section, route, spec } = await loadSection(supabase, requireId(fd, 'section_id'));
      addRoute(scope, route);
      const item = await loadItem(supabase, requireId(fd, 'id'), section.id);

      const siblings = check(
        await supabase
          .from('section_items')
          .select('id, sort_order')
          .eq('section_id', section.id)
          .order('sort_order')
          .order('id'),
      ) as Ordered[];
      const change = await reorder(supabase, 'section_items', siblings, item.id, direction);
      if (!change) {
        return `${capitalise(itemName(item.title, spec))} is already at the ${direction === 'up' ? 'top' : 'bottom'}.`;
      }
      await writeAudit(
        user.id,
        'update',
        'section_item',
        item.id,
        { order: change.before },
        { order: change.after },
      );
      return `Moved ${itemName(item.title, spec)} ${direction}.`;
    },
    scope,
  );
}

export async function toggleItem(fd: FormData) {
  const user = await requireRole('editor');
  const scope = pageScope();
  await runAndReturn(
    editorFor(fd, 'section_id'),
    async () => {
      const supabase = await createClient();
      const { section, route, spec } = await loadSection(supabase, requireId(fd, 'section_id'));
      addRoute(scope, route);
      const before = await loadItem(supabase, requireId(fd, 'id'), section.id);

      const enabled = wantedState(fd, before.is_enabled);
      const after = check(
        await supabase
          .from('section_items')
          .update({ is_enabled: enabled })
          .eq('id', before.id)
          .select('*')
          .maybeSingle(),
      );
      await writeAudit(user.id, 'update', 'section_item', before.id, before, after);
      return enabled
        ? `${capitalise(itemName(before.title, spec))} is shown.`
        : `${capitalise(itemName(before.title, spec))} is hidden.`;
    },
    scope,
  );
}
