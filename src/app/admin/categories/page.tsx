import Link from 'next/link';
import type { Metadata } from 'next';
import { requireRole } from '@/lib/auth';
import { hasMinRole } from '@/lib/roles';
import { createClient } from '@/lib/supabase/server';
import {
  AdminButton,
  Card,
  FilterTabs,
  PageHeader,
  Pager,
  TableShell,
  Td,
  Th,
} from '@/components/admin/chrome';
import { Checkbox, Input, Select, Switch, Textarea } from '@/components/form';
import { EmptyState } from '@/components/ui';
import { deleteCategory, saveCategory } from './actions';

export const metadata: Metadata = { title: 'Categories' };

const PER_PAGE = 25;
const BASE = '/admin/categories';

const VIEWS = ['all', 'top', 'sub', 'featured'] as const;
type View = (typeof VIEWS)[number];

const VIEW_LABELS: Record<View, string> = {
  all: 'All',
  top: 'Top level',
  sub: 'Sub-categories',
  featured: 'Featured',
};

const ERRORS: Record<string, string> = {
  bad_input: 'That request was malformed, so nothing was saved.',
  name_required: 'A category needs a name of at least two characters.',
  slug_required: 'That name produced an empty slug. Enter a slug by hand.',
  slug_taken: 'That slug is already used by another category. Slugs must be unique.',
  self_parent: 'A category cannot be its own parent.',
  bad_sort: 'Sort order must be a whole number.',
  not_found: 'That category no longer exists.',
  save_failed: 'The category could not be saved. Try again.',
  delete_failed: 'The category could not be deleted. Try again.',
  confirm_required: 'Tick the confirmation box before deleting a category.',
};

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  parent_id: string | null;
  description: string | null;
  icon: string | null;
  sort_order: number;
  is_featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
};

const COLUMNS =
  'id, slug, name, parent_id, description, icon, sort_order, is_featured, seo_title, seo_description';

function parseView(raw: string | undefined): View {
  return (VIEWS as readonly string[]).includes(raw ?? '') ? (raw as View) : 'all';
}

function parsePage(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? '1', 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; page?: string; edit?: string; err?: string }>;
}) {
  // The layout only guarantees 'moderator'; categories are editor territory and
  // the RLS policy underneath says the same.
  const actor = await requireRole('editor', BASE);
  const sp = await searchParams;

  const view = parseView(sp.view);
  const page = parsePage(sp.page);
  const from = (page - 1) * PER_PAGE;

  const supabase = await createClient();

  const counts = await Promise.all(
    VIEWS.map(async (value) => {
      let q = supabase.from('categories').select('id', { count: 'exact', head: true });
      if (value === 'top') q = q.is('parent_id', null);
      if (value === 'sub') q = q.not('parent_id', 'is', null);
      if (value === 'featured') q = q.eq('is_featured', true);
      const { count } = await q;
      return { value, count: count ?? 0 };
    }),
  );

  let rowsQuery = supabase.from('categories').select(COLUMNS, { count: 'exact' });
  if (view === 'top') rowsQuery = rowsQuery.is('parent_id', null);
  if (view === 'sub') rowsQuery = rowsQuery.not('parent_id', 'is', null);
  if (view === 'featured') rowsQuery = rowsQuery.eq('is_featured', true);

  const { data, count } = await rowsQuery
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })
    .range(from, from + PER_PAGE - 1);

  const rows = (data ?? []) as CategoryRow[];
  const total = count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE));

  // Every category, for the parent picker and for resolving parent names.
  const { data: allData } = await supabase
    .from('categories')
    .select('id, name')
    .order('name', { ascending: true });
  const all = (allData ?? []) as { id: string; name: string }[];
  const names = new Map(all.map((c) => [c.id, c.name]));

  // Listing counts for the visible page only: PostgREST cannot GROUP BY, and 25
  // head-only counts are cheaper than pulling every listing id into the server.
  // These count the primary category_id; a listing filed here as a subcategory is
  // counted under its own row.
  const listingCounts = new Map(
    await Promise.all(
      rows.map(async (row): Promise<[string, number]> => {
        const { count: n } = await supabase
          .from('listings')
          .select('id', { count: 'exact', head: true })
          .eq('category_id', row.id);
        return [row.id, n ?? 0];
      }),
    ),
  );

  const editing = sp.edit === 'new' ? 'new' : (rows.find((r) => r.id === sp.edit)?.id ?? null);
  const editRow =
    editing && editing !== 'new' ? (rows.find((r) => r.id === editing) ?? null) : null;

  const query = {
    view: view !== 'all' ? view : undefined,
    page: page > 1 ? String(page) : undefined,
  };
  const qs = new URLSearchParams(
    Object.entries(query).filter((e): e is [string, string] => typeof e[1] === 'string'),
  ).toString();
  const listUrl = qs ? `${BASE}?${qs}` : BASE;
  const editUrl = (id: string) => `${BASE}?${qs ? `${qs}&` : ''}edit=${id}`;
  const returnTo = editing ? editUrl(editing) : listUrl;

  const error = sp.err ? ERRORS[sp.err] : undefined;
  const canDelete = hasMinRole(actor.role, 'admin');

  return (
    <>
      <PageHeader
        title="Categories"
        description="The taxonomy every listing, archive page and menu is filed under."
        action={
          editing ? (
            <AdminButton href={listUrl} variant="secondary">
              Close editor
            </AdminButton>
          ) : (
            <AdminButton href={editUrl('new')}>New category</AdminButton>
          )
        }
      />

      {error ? (
        <p
          role="alert"
          className="rounded-[var(--radius-card)] border border-[#ecc2be] bg-[#fbeceb] px-4 py-3 text-sm text-[#96231b]"
        >
          {error}
        </p>
      ) : null}

      {editing ? (
        <Card className="p-4">
          <h2 className="font-display text-lg font-semibold">
            {editRow ? `Edit ${editRow.name}` : 'New category'}
          </h2>
          <form action={saveCategory} className="mt-4 flex flex-col gap-4">
            {editRow ? <input type="hidden" name="id" value={editRow.id} /> : null}
            <input type="hidden" name="returnTo" value={returnTo} />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input name="name" label="Name" required defaultValue={editRow?.name ?? ''} />
              <Input
                name="slug"
                label="Slug"
                hint="Leave empty to derive it from the name."
                defaultValue={editRow?.slug ?? ''}
              />
              <Select
                name="parent_id"
                label="Parent category"
                placeholder="None — top level"
                defaultValue={editRow?.parent_id ?? ''}
                options={all
                  .filter((c) => c.id !== editRow?.id)
                  .map((c) => ({ value: c.id, label: c.name }))}
              />
              <Input
                name="icon"
                label="Icon"
                hint="Icon name or emoji shown on the category card."
                defaultValue={editRow?.icon ?? ''}
              />
              <Input
                name="sort_order"
                label="Sort order"
                type="number"
                step={1}
                defaultValue={String(editRow?.sort_order ?? 0)}
              />
              <Switch
                name="is_featured"
                label="Featured"
                hint="Featured categories appear on the home page grid."
                defaultChecked={editRow?.is_featured ?? false}
              />
            </div>

            <Textarea
              name="description"
              label="Description"
              rows={3}
              defaultValue={editRow?.description ?? ''}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input name="seo_title" label="SEO title" defaultValue={editRow?.seo_title ?? ''} />
              <Input
                name="seo_description"
                label="SEO description"
                defaultValue={editRow?.seo_description ?? ''}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <AdminButton type="submit">
                {editRow ? 'Save changes' : 'Create category'}
              </AdminButton>
              <AdminButton href={listUrl} variant="secondary">
                Cancel
              </AdminButton>
            </div>
          </form>

          {editRow && canDelete ? (
            <details className="mt-6 border-t border-[var(--border)] pt-4">
              <summary className="cursor-pointer text-sm font-medium text-[#96231b]">
                Delete this category
              </summary>
              <form action={deleteCategory} className="mt-3 flex flex-col gap-3">
                <input type="hidden" name="id" value={editRow.id} />
                <input type="hidden" name="returnTo" value={listUrl} />
                <p className="max-w-prose text-sm text-[var(--text-muted)]">
                  Deleting removes the category only — nothing else is deleted with it. The{' '}
                  <strong>{listingCounts.get(editRow.id) ?? 0} listing(s)</strong> filed here become
                  uncategorised, and any sub-category of it is promoted to top level, because both
                  foreign keys are <code>on delete set null</code>. The category page at{' '}
                  <code>/category/{editRow.slug}</code> will start returning 404.
                </p>
                <Checkbox
                  name="confirm"
                  required
                  label="I understand the listings under this category will lose their category."
                />
                <div>
                  <AdminButton type="submit" variant="danger">
                    Delete category
                  </AdminButton>
                </div>
              </form>
            </details>
          ) : null}
        </Card>
      ) : null}

      <FilterTabs
        basePath={BASE}
        param="view"
        current={view}
        options={counts.map((c) => ({
          value: c.value,
          label: VIEW_LABELS[c.value],
          count: c.count,
        }))}
      />

      {rows.length === 0 ? (
        <EmptyState
          title="No categories yet"
          body="Create the first category to start filing listings under it."
        />
      ) : (
        <TableShell>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Parent</Th>
              <Th>Listings</Th>
              <Th>Sort</Th>
              <Th>Featured</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <Td>
                  <Link
                    href={`/category/${row.slug}`}
                    className="text-brand-700 font-medium hover:underline"
                  >
                    {row.name}
                  </Link>
                  <span className="mt-0.5 block font-mono text-xs text-[var(--text-muted)]">
                    /{row.slug}
                  </span>
                </Td>
                <Td>
                  {row.parent_id ? (
                    (names.get(row.parent_id) ?? 'Unknown')
                  ) : (
                    <span className="text-[var(--text-muted)]">Top level</span>
                  )}
                </Td>
                <Td className="tabular-nums">{listingCounts.get(row.id) ?? 0}</Td>
                <Td className="tabular-nums">{row.sort_order}</Td>
                <Td>{row.is_featured ? 'Yes' : <span className="text-ink-400">No</span>}</Td>
                <Td>
                  <AdminButton href={editUrl(row.id)} variant="secondary">
                    Edit
                  </AdminButton>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}

      <Pager basePath={BASE} query={query} page={page} pageCount={pageCount} />
    </>
  );
}
