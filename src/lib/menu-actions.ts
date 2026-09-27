'use server';

import { createClient } from './supabase-server';
import { requireRole } from './auth';
import { writeAudit } from './audit';
import { check, runAndReturn } from './action-flow';
import { FormError, bool, required, text, uuid } from './form-data';
import { checkLink } from './link-rules';

// Each action re-checks the role itself: a Server Action is a public endpoint,
// so the admin layout's check does not protect it. RLS enforces it a third time.

const PATH = '/admin/menus';

type MenuItemRow = {
  id: string;
  menu_id: string;
  parent_id: string | null;
  label: string;
  url: string;
  sort_order: number;
  is_external: boolean;
  is_visible: boolean;
};

async function loadItem(supabase: Awaited<ReturnType<typeof createClient>>, id: string) {
  const row = check(
    await supabase.from('menu_items').select('*').eq('id', id).maybeSingle(),
  ) as MenuItemRow | null;
  if (!row) throw new FormError('Menu item not found.');
  return row;
}

export async function saveMenuItem(fd: FormData) {
  const user = await requireRole('editor');
  await runAndReturn(PATH, async () => {
    const supabase = await createClient();
    const id = uuid(fd, 'id');
    const label = required(fd, 'label', 'Label', 80);
    const link = checkLink(required(fd, 'url', 'URL', 500), 'URL');
    const isVisible = bool(fd, 'is_visible');

    const before = id ? await loadItem(supabase, id) : null;
    // An edit keeps its menu; the menu_id field only matters for a new item.
    const menuId = before?.menu_id ?? uuid(fd, 'menu_id');
    if (!menuId) throw new FormError('Choose a menu.');
    const menu = check(await supabase.from('menus').select('id').eq('id', menuId).maybeSingle());
    if (!menu) throw new FormError('Menu not found.');

    // The header and footer key their links by URL, so a repeat would collide.
    let dupes = supabase
      .from('menu_items')
      .select('id', { count: 'exact', head: true })
      .eq('menu_id', menuId)
      .eq('url', link.url);
    if (before) dupes = dupes.neq('id', before.id);
    const { count } = await dupes;
    if (count) throw new FormError('That menu already links to this URL.');

    const row = { label, url: link.url, is_external: link.isExternal, is_visible: isVisible };
    if (before) {
      const after = check(
        await supabase.from('menu_items').update(row).eq('id', before.id).select('*').maybeSingle(),
      );
      await writeAudit(user.id, 'update', 'menu_item', before.id, before, after);
      return `Saved ${label}.`;
    }

    // New items go to the end of the menu.
    const last = check(
      await supabase
        .from('menu_items')
        .select('sort_order')
        .eq('menu_id', menuId)
        .order('sort_order', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ) as { sort_order: number } | null;
    const after = check(
      await supabase
        .from('menu_items')
        .insert({ ...row, menu_id: menuId, sort_order: (last?.sort_order ?? 0) + 10 })
        .select('*')
        .single(),
    );
    await writeAudit(user.id, 'create', 'menu_item', after.id, null, after);
    return `Added ${label}.`;
  });
}

export async function deleteMenuItem(fd: FormData) {
  const user = await requireRole('editor');
  await runAndReturn(PATH, async () => {
    const supabase = await createClient();
    const id = uuid(fd, 'id');
    if (!id) throw new FormError('Nothing selected.');
    const before = await loadItem(supabase, id);
    // parent_id cascades, so deleting a parent would silently take its children.
    const { count } = await supabase
      .from('menu_items')
      .select('id', { count: 'exact', head: true })
      .eq('parent_id', id);
    if (count)
      throw new FormError(`${before.label} has ${count} child link(s). Remove them first.`);
    check(await supabase.from('menu_items').delete().eq('id', id));
    await writeAudit(user.id, 'delete', 'menu_item', id, before, null);
    return `Deleted ${before.label}.`;
  });
}

export async function toggleMenuItem(fd: FormData) {
  const user = await requireRole('editor');
  await runAndReturn(PATH, async () => {
    const supabase = await createClient();
    const id = uuid(fd, 'id');
    if (!id) throw new FormError('Nothing selected.');
    const before = await loadItem(supabase, id);
    const after = check(
      await supabase
        .from('menu_items')
        .update({ is_visible: !before.is_visible })
        .eq('id', id)
        .select('*')
        .maybeSingle(),
    );
    await writeAudit(user.id, 'update', 'menu_item', id, before, after);
    return after?.is_visible ? `${before.label} is shown.` : `${before.label} is hidden.`;
  });
}

/**
 * Moves an item one place up or down among its siblings. The whole sibling
 * list is renumbered 10, 20, 30… rather than swapping two values, because
 * seeded or hand-edited rows can share a sort_order, and a swap of equal
 * values would do nothing.
 */
export async function moveMenuItem(fd: FormData) {
  const user = await requireRole('editor');
  await runAndReturn(PATH, async () => {
    const supabase = await createClient();
    const id = uuid(fd, 'id');
    if (!id) throw new FormError('Nothing selected.');
    const direction = text(fd, 'direction', 10);
    if (direction !== 'up' && direction !== 'down') throw new FormError('Unknown direction.');
    const item = await loadItem(supabase, id);

    let siblingsQuery = supabase
      .from('menu_items')
      .select('id, label, sort_order')
      .eq('menu_id', item.menu_id);
    siblingsQuery = item.parent_id
      ? siblingsQuery.eq('parent_id', item.parent_id)
      : siblingsQuery.is('parent_id', null);
    const siblings = check(await siblingsQuery.order('sort_order').order('id')) as Pick<
      MenuItemRow,
      'id' | 'label' | 'sort_order'
    >[];

    const from = siblings.findIndex((s) => s.id === id);
    const to = direction === 'up' ? from - 1 : from + 1;
    if (from < 0 || to < 0 || to >= siblings.length) {
      return `${item.label} is already at the ${direction === 'up' ? 'top' : 'bottom'}.`;
    }
    const reordered = [...siblings];
    [reordered[from], reordered[to]] = [reordered[to], reordered[from]];

    const before = siblings.map((s) => ({ id: s.id, sort_order: s.sort_order }));
    const after = reordered.map((s, i) => ({ id: s.id, sort_order: (i + 1) * 10 }));
    for (const row of after) {
      const old = before.find((b) => b.id === row.id);
      if (old?.sort_order === row.sort_order) continue;
      check(
        await supabase.from('menu_items').update({ sort_order: row.sort_order }).eq('id', row.id),
      );
    }
    await writeAudit(user.id, 'update', 'menu_item', id, { order: before }, { order: after });
    return `Moved ${item.label} ${direction}.`;
  });
}
