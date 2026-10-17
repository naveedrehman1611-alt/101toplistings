import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import { deleteMenuItem, moveMenuItem, saveMenuItem, toggleMenuItem } from '@/lib/menu-actions';
import { FormField, PageHeader, SwitchField, inputCls, rowAct } from '@/components/admin/kit';
import { ConfirmButton, ModalForm } from '@/components/admin/dialog';
import { OrderRow, moveBtn } from '@/components/admin/order-list';
import { TabbedCard } from '@/components/admin/tabbed-card';

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

function LinkFields({ item, menuId }: { item?: Item; menuId?: string }) {
  const k = item?.id ?? `new-${menuId}`;
  return (
    <>
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      {menuId ? <input type="hidden" name="menu_id" value={menuId} /> : null}
      <FormField label="Label" htmlFor={`ml-${k}`} required>
        <input
          id={`ml-${k}`}
          name="label"
          required
          maxLength={80}
          defaultValue={item?.label}
          placeholder="e.g. Deals"
          className={inputCls}
        />
      </FormField>
      <FormField
        label="Link"
        htmlFor={`mu-${k}`}
        required
        help="A path on this site, such as /business-directory, or a full https:// address."
      >
        <input
          id={`mu-${k}`}
          name="url"
          required
          defaultValue={item?.url}
          placeholder="/deals"
          className={inputCls}
        />
      </FormField>
      <SwitchField
        name="is_visible"
        label="Visible"
        defaultChecked={item ? item.is_visible : true}
      />
    </>
  );
}

export default async function AdminMenus() {
  await requireRole('editor');
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
  // Two menus can share a location (the footer has columns), so name them both.
  const sharedLocation = (m: Menu) => menus.filter((x) => x.location === m.location).length > 1;
  const tabLabel = (m: Menu) =>
    sharedLocation(m) ? `${m.name}` : m.location.charAt(0).toUpperCase() + m.location.slice(1);

  const tabs = menus.map((menu) => {
    const rows = items.filter((i) => i.menu_id === menu.id);
    // Parents in order, each followed by its children.
    const ordered = rows
      .filter((r) => !r.parent_id)
      .flatMap((p) => [p, ...rows.filter((c) => c.parent_id === p.id)]);
    const orphans = rows.filter((r) => r.parent_id && !rows.some((p) => p.id === r.parent_id));
    const list = [...ordered, ...orphans];
    return {
      id: menu.id,
      label: tabLabel(menu),
      content: (
        <>
          {list.map((item, i) => {
            // Reordering is among siblings, so first/last is per parent.
            const siblings = rows.filter((r) => r.parent_id === item.parent_id);
            const pos = siblings.findIndex((s) => s.id === item.id);
            return (
              <OrderRow
                key={item.id}
                n={i + 1}
                label={item.label}
                sub={`${item.url}${item.is_external ? ' ↗' : ''}`}
                hidden={!item.is_visible}
                indent={!!item.parent_id}
              >
                <form action={moveMenuItem}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="direction" value="up" />
                  <button
                    type="submit"
                    className={moveBtn}
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
                    className={moveBtn}
                    disabled={pos === siblings.length - 1}
                    aria-label={`Move ${item.label} down`}
                  >
                    ↓
                  </button>
                </form>
                <form action={toggleMenuItem}>
                  <input type="hidden" name="id" value={item.id} />
                  <button type="submit" className={rowAct.base}>
                    {item.is_visible ? 'Hide' : 'Show'}
                  </button>
                </form>
                <ModalForm
                  trigger="Edit"
                  triggerClassName={rowAct.base}
                  title={`Edit “${item.label}”`}
                  action={saveMenuItem}
                  ok="Save"
                >
                  <LinkFields item={item} />
                </ModalForm>
                <form action={deleteMenuItem}>
                  <input type="hidden" name="id" value={item.id} />
                  <ConfirmButton
                    className={rowAct.bad}
                    title={`Delete “${item.label}”?`}
                    body="The link is removed from this menu. Hide it instead to keep it for later."
                    ok="Delete"
                    danger
                  >
                    Delete
                  </ConfirmButton>
                </form>
              </OrderRow>
            );
          })}
          {list.length === 0 ? (
            <p className="m-0 px-4 py-8 text-center text-sm text-[#64748B]">
              No links in this menu yet.
            </p>
          ) : null}
        </>
      ),
      footer: (
        <ModalForm
          trigger={`+ Add link`}
          triggerClassName="cursor-pointer border-0 bg-transparent p-0 text-[13.5px] font-semibold text-[#0C8226]"
          title={`Add link to ${tabLabel(menu)}`}
          action={saveMenuItem}
          ok="Add link"
        >
          <LinkFields menuId={menu.id} />
        </ModalForm>
      ),
    };
  });

  return (
    <>
      <PageHeader
        title="Menus"
        description="Order and visibility of the Header, Mobile and Footer links. Hidden links stay here but are not shown."
      />
      {tabs.length ? (
        <TabbedCard tabs={tabs} />
      ) : (
        <p className="m-0 text-sm text-[#64748B]">
          No menus exist. Run migration 0013 to create the ones the layout renders.
        </p>
      )}
    </>
  );
}
