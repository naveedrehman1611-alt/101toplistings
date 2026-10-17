import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { requireRole, roleAtLeast } from '@/lib/auth';
import { setListingStatus } from '@/lib/admin-actions';
import {
  CellText,
  ErrorNotice,
  PageHeader,
  Pill,
  Tag,
  ago,
  label,
  rowAct,
  toneOf,
} from '@/components/admin/kit';
import { DataTable, type TableRow } from '@/components/admin/data-table';
import { ConfirmButton } from '@/components/admin/dialog';
import { ExportCsvButton } from '@/components/admin/export-button';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Listings' };

const STATUSES = ['all', 'pending', 'approved', 'rejected', 'suspended', 'draft'] as const;
type Status = (typeof STATUSES)[number];
type ListingStatus = Exclude<Status, 'all' | 'draft'>;
const LIMIT = 500;

type Row = {
  id: string;
  slug: string;
  name: string;
  status: string;
  verification: string;
  is_featured: boolean;
  category_id: string | null;
  city_id: string | null;
  area_id: string | null;
  updated_at: string;
  owner: { display_name: string | null } | null;
};

/** One status change, posted to the existing moderation action. */
function StatusButton({
  id,
  name,
  to,
  children,
  className,
}: {
  id: string;
  name: string;
  to: ListingStatus;
  children: React.ReactNode;
  className: string;
}) {
  const act = async () => {
    'use server';
    await setListingStatus(id, to);
  };
  if (to === 'rejected' || to === 'suspended') {
    return (
      <form action={act}>
        <ConfirmButton
          className={className}
          title={to === 'rejected' ? `Reject ${name}?` : `Suspend ${name}?`}
          body={
            to === 'rejected'
              ? 'It stays off the public site. You can approve it later.'
              : 'It is hidden from the public site until you restore it.'
          }
          ok={to === 'rejected' ? 'Reject' : 'Suspend'}
          danger
        >
          {children}
        </ConfirmButton>
      </form>
    );
  }
  return (
    <form action={act}>
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  );
}

export default async function AdminListings({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const user = await requireRole('moderator');
  const canDelete = roleAtLeast(user.role, 'admin');
  const sp = await searchParams;
  const status: Status = STATUSES.includes(sp.status as Status) ? (sp.status as Status) : 'all';
  const q = sp.q?.trim().replace(/[%_\\]/g, '') ?? '';

  const supabase = await createClient();
  // Reads `listings`, not `public_listings`: moderation needs the rows the
  // public view deliberately hides, and the internal status columns with them.
  let query = supabase
    .from('listings')
    .select(
      'id, slug, name, status, verification, is_featured, category_id, city_id, area_id, updated_at, owner:profiles!listings_owner_user_id_fkey(display_name)',
    )
    .order('updated_at', { ascending: false })
    .limit(LIMIT);
  if (status !== 'all') query = query.eq('status', status);
  if (q) query = query.ilike('name', `%${q}%`);

  const countOf = async (s: Status) => {
    let c = supabase.from('listings').select('*', { count: 'exact', head: true });
    if (s !== 'all') c = c.eq('status', s);
    if (q) c = c.ilike('name', `%${q}%`);
    return (await c).count ?? 0;
  };

  const [{ data, error }, counts, { data: cats }, { data: cities }, { data: areas }] =
    await Promise.all([
      query,
      Promise.all(STATUSES.map(countOf)),
      supabase.from('categories').select('id, name'),
      supabase.from('cities').select('id, name'),
      supabase.from('areas').select('id, name'),
    ]);
  const listings = (data ?? []) as unknown as Row[];
  const catName = new Map((cats ?? []).map((c) => [c.id as string, c.name as string]));
  const cityName = new Map((cities ?? []).map((c) => [c.id as string, c.name as string]));
  const areaName = new Map((areas ?? []).map((c) => [c.id as string, c.name as string]));

  const qs = (s: Status) => {
    const p = new URLSearchParams();
    if (s !== 'all') p.set('status', s);
    if (q) p.set('q', q);
    const str = p.toString();
    return `/admin/listings${str ? `?${str}` : ''}`;
  };

  const rows: TableRow[] = listings.map((l) => {
    const cat = l.category_id ? (catName.get(l.category_id) ?? '—') : '—';
    const city = l.city_id ? (cityName.get(l.city_id) ?? '—') : '—';
    const area = l.area_id ? areaName.get(l.area_id) : undefined;
    const owner = l.owner?.display_name ?? '—';
    const verified = l.verification === 'verified';
    return {
      id: l.id,
      search: [l.name, l.slug, cat, city, area, owner].join(' '),
      sort: { name: l.name, cat, city, owner, status: l.status, updated: l.updated_at },
      cells: [
        <>
          <Link
            href={`/admin/listings/${l.id}`}
            className="max-w-full truncate font-semibold text-[#062347] hover:text-[#1884E7] hover:no-underline"
          >
            {l.name}
          </Link>
          <div className="max-w-full truncate text-xs text-[#64748B]">/listing/{l.slug}</div>
          {verified || l.is_featured ? (
            <div className="flex flex-wrap gap-1">
              {verified ? <Tag tone="teal">Verified</Tag> : null}
              {l.is_featured ? <Tag tone="gold">Featured</Tag> : null}
            </div>
          ) : null}
        </>,
        <CellText key="c">{cat}</CellText>,
        <CellText key="l" sub={area}>
          {city}
        </CellText>,
        <CellText key="o">{owner}</CellText>,
        <Pill key="s" tone={toneOf(l.status)}>
          {label(l.status)}
        </Pill>,
        <CellText key="u">{ago(l.updated_at)}</CellText>,
      ],
      actions: (
        <>
          {l.status === 'pending' || l.status === 'rejected' || l.status === 'draft' ? (
            <StatusButton id={l.id} name={l.name} to="approved" className={rowAct.ok}>
              Approve
            </StatusButton>
          ) : null}
          {l.status === 'pending' ? (
            <StatusButton id={l.id} name={l.name} to="rejected" className={rowAct.bad}>
              Reject
            </StatusButton>
          ) : null}
          {l.status === 'approved' ? (
            <StatusButton id={l.id} name={l.name} to="suspended" className={rowAct.base}>
              Suspend
            </StatusButton>
          ) : null}
          {l.status === 'suspended' ? (
            <StatusButton id={l.id} name={l.name} to="approved" className={rowAct.ok}>
              Restore
            </StatusButton>
          ) : null}
          <Link href={`/admin/listings/${l.id}`} className={`${rowAct.base} hover:no-underline`}>
            Edit
          </Link>
        </>
      ),
      csv: [l.name, cat, city, area ?? '', owner, l.status, l.verification],
    };
  });

  const total = counts[STATUSES.indexOf(status)] ?? 0;

  return (
    <>
      <PageHeader
        title="Listings"
        description="Approve new submissions and keep business details accurate."
        actions={[{ label: 'Add listing', href: '/admin/listings/new', primary: true }]}
      >
        <ExportCsvButton
          filename="listings.csv"
          header={['Name', 'Category', 'City', 'Area', 'Owner', 'Status', 'Verification']}
          rows={rows.map((r) => r.csv ?? [])}
        />
      </PageHeader>
      {error ? <ErrorNotice>Could not load listings: {error.message}</ErrorNotice> : null}

      <DataTable
        columns={[
          { key: 'name', label: 'Listing', width: 'minmax(220px,2.2fr)' },
          { key: 'cat', label: 'Category' },
          { key: 'city', label: 'Location' },
          { key: 'owner', label: 'Owner' },
          { key: 'status', label: 'Status', width: '120px' },
          { key: 'updated', label: 'Updated', width: '110px' },
        ]}
        rows={rows}
        filters={STATUSES.map((s, i) => ({
          value: s,
          label: label(s),
          count: counts[i],
          href: qs(s),
        }))}
        activeFilter={status}
        searchPlaceholder="Search name, owner, city…"
        searchParam="q"
        initialQuery={q}
        actionsWidth="210px"
        footnote={total > LIMIT ? `newest ${LIMIT} of ${total} loaded` : undefined}
        bulk={[
          { label: 'Approve', tone: 'ok', op: 'listing_status', arg: 'approved' },
          {
            label: 'Reject',
            op: 'listing_status',
            arg: 'rejected',
            confirm: {
              title: 'Reject {n} listings?',
              body: 'They stay off the public site.',
              ok: 'Reject',
              danger: true,
            },
          },
          { label: 'Suspend', op: 'listing_status', arg: 'suspended' },
          ...(canDelete
            ? [
                {
                  label: 'Delete permanently',
                  tone: 'bad' as const,
                  op: 'listing_delete' as const,
                  confirm: {
                    title: 'Delete {n} listings permanently?',
                    body: 'Their hours and reviews go too. This can’t be undone.',
                    ok: 'Delete permanently',
                    danger: true,
                  },
                },
              ]
            : []),
        ]}
      />
      {canDelete ? null : (
        <p className="m-0 text-xs text-[#64748B]">
          Only an Admin can delete a listing. Suspend it to hide it from the site.
        </p>
      )}
    </>
  );
}
