import { createClient } from '@/lib/supabase-server';
import { requireRole, roleAtLeast, type Role } from '@/lib/auth';
import { updateUser } from '@/lib/user-actions';
import { CellText, ErrorNotice, PageHeader, Pill, ago, rowAct } from '@/components/admin/kit';
import { DataTable, type TableRow } from '@/components/admin/data-table';
import { ConfirmButton } from '@/components/admin/dialog';
import { AutoSubmitSelect } from '@/components/admin/auto-submit-select';
import { ROLE_LABEL } from '@/components/admin/nav';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Users' };

const ROLES: Role[] = ['user', 'business_owner', 'moderator', 'editor', 'admin', 'super_admin'];
const FILTERS = [
  'all',
  'staff',
  'super_admin',
  'admin',
  'editor',
  'moderator',
  'business_owner',
  'user',
  'suspended',
] as const;
type F = (typeof FILTERS)[number];
const LIMIT = 500;

const FILTER_LABEL: Record<F, string> = {
  all: 'All',
  staff: 'Staff',
  super_admin: 'Super admin',
  admin: 'Admin',
  editor: 'Editor',
  moderator: 'Moderator',
  business_owner: 'Business owners',
  user: 'Users',
  suspended: 'Suspended',
};

type Row = {
  id: string;
  role: Role;
  display_name: string | null;
  is_suspended: boolean;
  created_at: string;
};

export default async function AdminUsers({
  searchParams,
}: {
  searchParams: Promise<{ show?: string; q?: string }>;
}) {
  const actor = await requireRole('admin');
  const sp = await searchParams;
  const show: F = FILTERS.includes(sp.show as F) ? (sp.show as F) : 'all';
  const q = (sp.q ?? '')
    .trim()
    .slice(0, 80)
    .replace(/[%_\\]/g, '');

  const supabase = await createClient();
  // The same filter on the list and on each count; typed loosely because
  // the Supabase builder generics are too deep to carry through a helper.
  type Q = {
    in(c: string, v: string[]): Q;
    eq(c: string, v: unknown): Q;
    ilike(c: string, v: string): Q;
  };
  function apply<T>(query: T, f: F): T {
    let x = query as unknown as Q;
    if (f === 'staff') x = x.in('role', ['moderator', 'editor', 'admin', 'super_admin']);
    else if (f === 'suspended') x = x.eq('is_suspended', true);
    else if (f !== 'all') x = x.eq('role', f);
    if (q) x = x.ilike('display_name', `%${q}%`);
    return x as unknown as T;
  }

  const [{ data, error }, counts] = await Promise.all([
    apply(
      supabase
        .from('profiles')
        .select('id, role, display_name, is_suspended, created_at')
        .order('created_at', { ascending: false })
        .limit(LIMIT),
      show,
    ),
    Promise.all(
      FILTERS.map(
        async (f) =>
          (await apply(supabase.from('profiles').select('id', { count: 'exact', head: true }), f))
            .count ?? 0,
      ),
    ),
  ]);
  const users = (data ?? []) as Row[];

  // Listing counts show who is an active business owner at a glance.
  const ids = users.map((u) => u.id);
  const { data: owned } = ids.length
    ? await supabase.from('listings').select('owner_user_id').in('owner_user_id', ids)
    : { data: [] as { owner_user_id: string }[] };
  const listingCount = new Map<string, number>();
  for (const l of owned ?? [])
    listingCount.set(l.owner_user_id, (listingCount.get(l.owner_user_id) ?? 0) + 1);

  const isSuper = actor.role === 'super_admin';
  // Only a super admin can make someone an Admin or Super admin.
  const grantable = ROLES.filter((r) => isSuper || !roleAtLeast(r, 'admin'));
  const qs = `?show=${show}${q ? `&q=${encodeURIComponent(q)}` : ''}`;
  const href = (f: F) => `/admin/users?show=${f}${q ? `&q=${encodeURIComponent(q)}` : ''}`;

  const rows: TableRow[] = users.map((u) => {
    const self = u.id === actor.id;
    // Nobody edits themselves here; only a super admin edits another admin.
    const locked = self || (!isSuper && roleAtLeast(u.role, 'admin'));
    const name = u.display_name ?? 'Unnamed';
    const status = u.is_suspended ? 'suspended' : 'active';
    const n = listingCount.get(u.id) ?? 0;
    return {
      id: u.id,
      selectable: false,
      search: `${name} ${u.role}`,
      sort: { name, role: ROLES.indexOf(u.role), listings: n, status, joined: u.created_at },
      cells: [
        <CellText key="n" bold sub={<code className="text-[11px]">{u.id.slice(0, 8)}</code>}>
          {name}
          {self ? <span className="font-normal text-[#64748B]"> (you)</span> : null}
        </CellText>,
        locked ? (
          <CellText key="r" sub={self ? undefined : 'Only a Super admin can change'}>
            {ROLE_LABEL[u.role]}
          </CellText>
        ) : (
          <form key="r" action={updateUser}>
            <input type="hidden" name="id" value={u.id} />
            <input type="hidden" name="qs" value={qs} />
            <AutoSubmitSelect
              name="role"
              defaultValue={u.role}
              aria-label={`Role for ${name}`}
              className="h-[30px] rounded-md border border-[#E2E8F0] bg-white px-1.5 text-[13px]"
            >
              {grantable.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r]}
                </option>
              ))}
            </AutoSubmitSelect>
          </form>
        ),
        <CellText key="l">{n}</CellText>,
        <Pill key="s" tone={status}>
          {u.is_suspended ? 'Suspended' : 'Active'}
        </Pill>,
        <CellText key="j">{ago(u.created_at)}</CellText>,
      ],
      actions: locked ? null : (
        <form action={updateUser}>
          <input type="hidden" name="id" value={u.id} />
          <input type="hidden" name="qs" value={qs} />
          <input type="hidden" name="suspend" value={u.is_suspended ? 'false' : 'true'} />
          {u.is_suspended ? (
            <button type="submit" className={rowAct.ok}>
              Restore
            </button>
          ) : (
            <ConfirmButton
              className={rowAct.bad}
              title={`Suspend ${name}?`}
              body="They’ll be signed out and can’t log in until restored."
              ok="Suspend"
              danger
            >
              Suspend
            </ConfirmButton>
          )}
        </form>
      ),
    };
  });

  const total = counts[FILTERS.indexOf(show)] ?? 0;

  return (
    <>
      <PageHeader
        title="Users"
        description={`Team members and their roles. Give someone a staff role to open the admin to them, or suspend an account to sign it out everywhere. ${counts[0]} accounts.`}
      />
      {error ? <ErrorNotice>Could not load users: {error.message}</ErrorNotice> : null}
      <DataTable
        columns={[
          { key: 'name', label: 'User', width: 'minmax(220px,1.8fr)' },
          { key: 'role', label: 'Role', width: '180px' },
          { key: 'listings', label: 'Listings', width: '100px' },
          { key: 'status', label: 'Status', width: '120px' },
          { key: 'joined', label: 'Joined', width: '120px' },
        ]}
        rows={rows}
        filters={FILTERS.map((f, i) => ({
          value: f,
          label: FILTER_LABEL[f],
          count: counts[i],
          href: href(f),
        }))}
        activeFilter={show}
        searchPlaceholder="Search by name…"
        searchParam="q"
        initialQuery={q}
        actionsWidth="120px"
        emptyText="No users match."
        footnote={
          total > LIMIT ? `newest ${LIMIT} of ${total} loaded; search to narrow` : undefined
        }
      />
    </>
  );
}
