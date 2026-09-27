import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { requireRole, roleAtLeast, type Role } from '@/lib/auth';
import { updateUser } from '@/lib/user-actions';
import { Notice } from '@/components/admin-ui';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Users' };

const ROLES: Role[] = ['user', 'business_owner', 'moderator', 'editor', 'admin', 'super_admin'];
const FILTERS = ['all', 'staff', 'business_owner', 'user', 'suspended'] as const;
const PAGE_SIZE = 50;

const label = (r: string) => r.replace('_', ' ');

export default async function AdminUsers({
  searchParams,
}: {
  searchParams: Promise<{ show?: string; q?: string; page?: string; ok?: string; error?: string }>;
}) {
  const actor = await requireRole('admin');
  const sp = await searchParams;
  const show = FILTERS.includes(sp.show as (typeof FILTERS)[number]) ? sp.show! : 'all';
  const q = (sp.q ?? '').trim().slice(0, 80);
  const page = Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1);

  const supabase = await createClient();
  let query = supabase
    .from('profiles')
    .select('id, role, display_name, is_suspended, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (show === 'staff') query = query.in('role', ['moderator', 'editor', 'admin', 'super_admin']);
  else if (show === 'suspended') query = query.eq('is_suspended', true);
  else if (show !== 'all') query = query.eq('role', show);
  if (q) query = query.ilike('display_name', `%${q.replace(/[%_\\]/g, '')}%`);
  const { data, count, error } = await query;
  const users = data ?? [];

  // Listing counts show who is an active business owner at a glance.
  const ids = users.map((u) => u.id as string);
  const { data: owned } = ids.length
    ? await supabase.from('listings').select('owner_user_id').in('owner_user_id', ids)
    : { data: [] as { owner_user_id: string }[] };
  const listingCount = new Map<string, number>();
  for (const l of owned ?? [])
    listingCount.set(l.owner_user_id, (listingCount.get(l.owner_user_id) ?? 0) + 1);

  const isSuper = actor.role === 'super_admin';
  const grantable = ROLES.filter((r) => isSuper || !roleAtLeast(r, 'admin'));
  const base = `?show=${show}${q ? `&q=${encodeURIComponent(q)}` : ''}`;
  const qs = `${base}${page > 1 ? `&page=${page}` : ''}`;
  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <div>
      <h1 className="text-2xl font-semibold">Users</h1>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        Everyone who has registered. Change a role to give someone access to the admin panel, or
        suspend an account to sign it out everywhere. {count ?? 0} total.
      </p>
      <Notice ok={sp.ok} error={sp.error ?? error?.message} />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={`/admin/users?show=${f}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
            className={`rounded-lg border px-3 py-1.5 text-sm capitalize ${
              show === f
                ? 'border-brand-500 bg-brand-50 text-brand-800'
                : 'border-[var(--border)] hover:bg-[var(--surface-2)]'
            }`}
          >
            {label(f)}
          </Link>
        ))}
        <form action="/admin/users" className="ml-auto flex gap-2">
          <input type="hidden" name="show" value={show} />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by name"
            aria-label="Search by name"
            className="focus:border-brand-500 h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none"
          />
          <button
            type="submit"
            className="h-9 rounded-lg border border-[var(--border)] px-3 text-sm hover:bg-[var(--surface-2)]"
          >
            Search
          </button>
        </form>
      </div>

      {users.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--text-muted)]">No users match.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[40rem] text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left">
                <th className="py-2 font-medium">Name</th>
                <th className="py-2 font-medium">Joined</th>
                <th className="py-2 font-medium">Listings</th>
                <th className="py-2 font-medium">Role</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const self = u.id === actor.id;
                // Nobody edits themselves here; only a super admin edits another admin.
                const locked = self || (!isSuper && roleAtLeast(u.role as Role, 'admin'));
                return (
                  <tr key={u.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2">
                      <span className="font-medium">{u.display_name ?? 'Unnamed'}</span>
                      {self ? <span className="text-brand-700 ml-2 text-xs">you</span> : null}
                      <p className="font-mono text-xs text-[var(--text-muted)]">
                        {String(u.id).slice(0, 8)}
                      </p>
                    </td>
                    <td className="py-2 text-[var(--text-muted)]">
                      {new Date(u.created_at).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-2">{listingCount.get(u.id) ?? 0}</td>
                    <td className="py-2">
                      {locked ? (
                        <span className="capitalize">{label(u.role)}</span>
                      ) : (
                        <form action={updateUser} className="flex items-center gap-2">
                          <input type="hidden" name="id" value={u.id} />
                          <input type="hidden" name="qs" value={qs} />
                          <select
                            name="role"
                            defaultValue={u.role}
                            aria-label={`Role for ${u.display_name ?? 'user'}`}
                            className="h-8 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-sm capitalize"
                          >
                            {grantable.map((r) => (
                              <option key={r} value={r}>
                                {label(r)}
                              </option>
                            ))}
                          </select>
                          <button
                            type="submit"
                            className="rounded-lg border border-[var(--border)] px-2.5 py-1 text-xs hover:bg-[var(--surface-2)]"
                          >
                            Save
                          </button>
                        </form>
                      )}
                    </td>
                    <td className="py-2">
                      {locked ? (
                        <span className={u.is_suspended ? 'text-red-800' : ''}>
                          {u.is_suspended ? 'Suspended' : 'Active'}
                        </span>
                      ) : (
                        <form action={updateUser}>
                          <input type="hidden" name="id" value={u.id} />
                          <input type="hidden" name="qs" value={qs} />
                          <input
                            type="hidden"
                            name="suspend"
                            value={u.is_suspended ? 'false' : 'true'}
                          />
                          <button
                            type="submit"
                            className={`rounded-lg border px-2.5 py-1 text-xs ${
                              u.is_suspended
                                ? 'border-[var(--border)] hover:bg-[var(--surface-2)]'
                                : 'border-red-300 text-red-800 hover:bg-red-50'
                            }`}
                          >
                            {u.is_suspended ? 'Restore' : 'Suspend'}
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 ? (
        <nav aria-label="Pages" className="mt-6 flex items-center gap-3 text-sm">
          {page > 1 ? (
            <Link
              href={`/admin/users${base}&page=${page - 1}`}
              className="text-brand-700 hover:underline"
            >
              ← Previous
            </Link>
          ) : null}
          <span className="text-[var(--text-muted)]">
            Page {page} of {pages}
          </span>
          {page < pages ? (
            <Link
              href={`/admin/users${base}&page=${page + 1}`}
              className="text-brand-700 hover:underline"
            >
              Next →
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
