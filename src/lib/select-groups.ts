/**
 * Grouping for long native <select>s. A <select> counts every <option> as a
 * child, and the full category tree (~165) and city list (~100) are each far
 * past the 60 children an audit flags as excessive DOM width, so they are
 * rendered in <optgroup>s instead.
 */

/** Longer flat lists than this go into groups. */
export const MAX_FLAT_OPTIONS = 40;

type TreeItem = { id: string; parent_id?: string | null };

/**
 * Each top-level category with its children, in the tree order getCategories
 * returns. A child whose parent is missing from the list stands on its own.
 */
export function categoryTree<T extends TreeItem>(
  items: readonly T[],
): { root: T; children: T[] }[] {
  const ids = new Set(items.map((c) => c.id));
  const isChild = (c: T) => Boolean(c.parent_id && ids.has(c.parent_id));
  const groups = new Map<string, { root: T; children: T[] }>();
  for (const c of items) if (!isChild(c)) groups.set(c.id, { root: c, children: [] });
  for (const c of items) if (isChild(c)) groups.get(c.parent_id!)?.children.push(c);
  return [...groups.values()];
}

/** Items grouped by the first letter of their name (accents folded), letters in order. */
export function byInitial<T extends { name: string }>(
  items: readonly T[],
): { label: string; items: T[] }[] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const first = item.name.trim().normalize('NFD').charAt(0).toLocaleUpperCase('en');
    const label = /\p{L}/u.test(first) ? first : '#';
    groups.set(label, [...(groups.get(label) ?? []), item]);
  }
  return [...groups]
    .sort(([a], [b]) => a.localeCompare(b, 'en'))
    .map(([label, run]) => ({ label, items: run }));
}
