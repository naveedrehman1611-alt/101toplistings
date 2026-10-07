import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import { deleteMenuItem, moveMenuItem, saveMenuItem, toggleMenuItem } from '@/lib/menu-actions';
import { Check, DangerButton, Field, Notice, Select, SubmitButton } from '@/components/admin-ui';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Menus' };

type Menu = { id: string; location: string; name: string };
type Item = {
  id: string;
  menu_id: string;
  parent_id: string | null;
  label: string;
  url: string;
  sort_order: number;
  is_external: boolean;
  is_visible: boolean;
};

// Matches the order the layout renders them in.
const LOCATION_ORDER = ['header', 'mobile', 'footer'];

const smallBtn =
  'rounded-lg border border-[var(--border)] px-2.5 py-1 text-xs hover:bg-[var(--surface-2)] disabled:opacity-40';

export default async function AdminMenus({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; ok?: string; error?: string }>;
}) {
  await requireRole('editor');
  const sp = await searchParams;
  const supabase = await createClient();
  const [{ data: menuData }, { data: itemData }] = await Promise.all([
    supabase.from('menus').select('id, location, name').order('name'),
    supabase
      .from('menu_items')
      .select('id, menu_id, parent_id, label, url, sort_order, is_external, is_visible')
      .order('sort_order')
      .order('id'),
  ]);
  const menus = ((menuData ?? []) as Menu[]).sort(
    (a, b) => LOCATION_ORDER.indexOf(a.location) - LOCATION_ORDER.indexOf(b.location),
  );
  const items = (itemData ?? []) as Item[];
  const editing = sp.edit ? items.find((i) => i.id === sp.edit) : undefined;
  const menuName = (m: Menu) => `${m.name} (${m.location})`;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Menus</h1>
      <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
        The header, mobile and footer navigation. Links are either a path on this site, such as
        /business-directory, or a full http(s):// address. Hidden links stay here but are not shown.
      </p>
      <Notice ok={sp.ok} error={sp.error} />

      <form action={saveMenuItem} className="surface-card mt-6 grid gap-4 p-5 sm:grid-cols-2">
        <h2 className="text-lg font-semibold sm:col-span-2">
          {editing ? `Edit ${editing.label}` : 'Add a link'}
        </h2>
        {editing ? (
          <input type="hidden" name="id" value={editing.id} />
        ) : (
          <div className="sm:col-span-2">
            <Select
              label="Menu"
              name="menu_id"
              required
              options={menus.map((m) => ({ value: m.id, label: menuName(m) }))}
            />
          </div>
        )}
        <Field label="Label" name="label" required defaultValue={editing?.label} />
        <Field
          label="URL"
          name="url"
          required
          defaultValue={editing?.url}
          placeholder="/business-directory or https://example.com"
        />
        <Check
          label="Visible"
          name="is_visible"
          defaultChecked={editing ? editing.is_visible : true}
        />
        <div className="flex items-center gap-3 sm:col-span-2">
          <SubmitButton>{editing ? 'Save changes' : 'Add link'}</SubmitButton>
          {editing ? (
            <Link href="/admin/menus" className="text-brand-700 text-sm hover:underline">
              Cancel
            </Link>
          ) : null}
        </div>
      </form>

      {menus.map((menu) => {
        const rows = items.filter((i) => i.menu_id === menu.id);
        // Reordering is among siblings, so first/last is per parent.
        const siblingsOf = (i: Item) => rows.filter((r) => r.parent_id === i.parent_id);
        return (
          <section key={menu.id} className="mt-8">
            <h2 className="text-lg font-semibold">{menuName(menu)}</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[40rem] text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left">
                    <th className="py-2 font-medium">Label</th>
                    <th className="py-2 font-medium">URL</th>
                    <th className="py-2 font-medium">Order</th>
                    <th className="py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((item) => {
                    const siblings = siblingsOf(item);
                    const pos = siblings.findIndex((s) => s.id === item.id);
                    return (
                      <tr
                        key={item.id}
                        className={`border-b border-[var(--border)] last:border-0 ${
                          item.is_visible ? '' : 'text-[var(--text-muted)]'
                        }`}
                      >
                        <td className="py-3">
                          <span className="font-medium">
                            {item.parent_id ? '↳ ' : ''}
                            {item.label}
                          </span>
                          {item.is_visible ? null : <span className="ml-2 text-xs">(hidden)</span>}
                        </td>
                        <td className="py-3 break-all">
                          {item.url}
                          {item.is_external ? (
                            <span className="ml-1 text-xs">(external)</span>
                          ) : null}
                        </td>
                        <td className="py-3">
                          <div className="flex gap-1">
                            <form action={moveMenuItem}>
                              <input type="hidden" name="id" value={item.id} />
                              <input type="hidden" name="direction" value="up" />
                              <button
                                type="submit"
                                className={smallBtn}
                                disabled={pos <= 0}
                                aria-label={`Move ${item.label} up`}
                              >
                                ↑
                              </button>
                            </form>
                            <form action={moveMenuItem}>
                              <input type="hidden" name="id" value={item.id} />
                              <input type="hidden" name="direction" value="down" />
                              <button
                                type="submit"
                                className={smallBtn}
                                disabled={pos === siblings.length - 1}
                                aria-label={`Move ${item.label} down`}
                              >
                                ↓
                              </button>
                            </form>
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link href={`/admin/menus?edit=${item.id}`} className={smallBtn}>
                              Edit
                            </Link>
                            <form action={toggleMenuItem}>
                              <input type="hidden" name="id" value={item.id} />
                              <button type="submit" className={smallBtn}>
                                {item.is_visible ? 'Hide' : 'Show'}
                              </button>
                            </form>
                            <form action={deleteMenuItem}>
                              <input type="hidden" name="id" value={item.id} />
                              <DangerButton>Delete</DangerButton>
                            </form>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {rows.length === 0 ? (
                <p className="mt-4 text-sm text-[var(--text-muted)]">No links in this menu yet.</p>
              ) : null}
            </div>
          </section>
        );
      })}
      {menus.length === 0 ? (
        <p className="mt-8 text-sm text-[var(--text-muted)]">
          No menus exist. Run migration 0013 to create the four the layout renders.
        </p>
      ) : null}
    </div>
  );
}
