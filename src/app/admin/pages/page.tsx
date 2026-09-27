import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import { addSection, deleteSection, moveSection, toggleSection } from '@/lib/section-actions';
import { SECTION_TYPES, isHomeSectionType } from '@/lib/sections';
import { DangerButton, Notice, SubmitButton } from '@/components/admin-ui';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Pages & sections' };

type Page = { id: string; slug: string; title: string; route_pattern: string };
type Section = {
  id: string;
  page_id: string;
  section_key: string;
  section_type: string;
  sort_order: number;
  is_enabled: boolean;
  heading: string | null;
};

const smallBtn =
  'rounded-lg border border-[var(--border)] px-2.5 py-1 text-xs hover:bg-[var(--surface-2)] disabled:opacity-40';

const inputCls =
  'mt-1 h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus:border-brand-500';

function typeLabel(type: string): string {
  return isHomeSectionType(type) ? SECTION_TYPES[type].label : type;
}

function preview(text: string | null): string | null {
  const t = text?.trim();
  if (!t) return null;
  return t.length > 120 ? `${t.slice(0, 119)}…` : t;
}

export default async function AdminPages({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  await requireRole('editor');
  const sp = await searchParams;
  const supabase = await createClient();

  const [{ data: pageData }, { data: sectionData }] = await Promise.all([
    supabase.from('pages').select('id, slug, title, route_pattern').order('title'),
    supabase
      .from('page_sections')
      .select('id, page_id, section_key, section_type, sort_order, is_enabled, heading')
      .order('sort_order')
      .order('id'),
  ]);
  // The homepage builder first; the other pages have a header section each.
  const pages = ((pageData ?? []) as Page[]).sort(
    (a, b) => Number(b.slug === 'home') - Number(a.slug === 'home'),
  );
  const sections = (sectionData ?? []) as Section[];

  return (
    <div>
      <h1 className="text-2xl font-semibold">Pages &amp; sections</h1>
      <p className="mt-3 max-w-2xl text-sm text-[var(--text-muted)]">
        The homepage is built from the sections below, top to bottom: edit, reorder, hide, add or
        delete them. A hidden section stays here but is not shown on the site. The other pages have
        a header whose copy you can edit. Homepage copy may say {'{brand}'}, which is replaced with
        the brand name from Settings.
      </p>
      <Notice ok={sp.ok} error={sp.error} />

      {pages.map((page) => {
        const rows = sections.filter((s) => s.page_id === page.id);
        const isHome = page.slug === 'home';
        return (
          <section key={page.id} className="mt-8">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-semibold">{page.title}</h2>
              <code className="text-xs text-[var(--text-muted)]">{page.route_pattern}</code>
            </div>

            {rows.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--text-muted)]">No sections on this page yet.</p>
            ) : (
              <ol className="mt-3 space-y-3">
                {rows.map((s, i) => (
                  <SectionRow key={s.id} section={s} first={i === 0} last={i === rows.length - 1} />
                ))}
              </ol>
            )}

            {isHome ? (
              <AddSection hasHero={rows.some((s) => s.section_type === 'hero_search')} />
            ) : null}
          </section>
        );
      })}
      {pages.length === 0 ? (
        <p className="mt-8 text-sm text-[var(--text-muted)]">
          No pages exist. Run the migrations to create them.
        </p>
      ) : null}
    </div>
  );
}

function SectionRow({
  section: s,
  first,
  last,
}: {
  section: Section;
  first: boolean;
  last: boolean;
}) {
  const heading = preview(s.heading);
  // Only builder sections can be added back, so a page's own header is not deletable.
  const deletable = isHomeSectionType(s.section_type);
  const ids = (
    <>
      <input type="hidden" name="id" value={s.id} />
      <input type="hidden" name="page_id" value={s.page_id} />
    </>
  );

  return (
    <li className={`surface-card p-4 ${s.is_enabled ? '' : 'bg-[var(--surface-2)]'}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-[var(--text-muted)]">
            <code>{s.section_key}</code> · {typeLabel(s.section_type)}
          </p>
          <p className={`mt-1 break-words ${heading ? 'font-medium' : 'text-[var(--text-muted)]'}`}>
            {heading ?? 'No heading'}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs ${
            s.is_enabled
              ? 'bg-brand-50 text-brand-800'
              : 'border border-[var(--border)] text-[var(--text-muted)]'
          }`}
        >
          {s.is_enabled ? 'Shown' : 'Hidden'}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Link
          href={`/admin/pages/sections/${s.id}`}
          className="bg-brand-700 hover:bg-brand-800 rounded-lg px-3 py-1 text-xs font-medium text-white"
        >
          Edit<span className="sr-only"> {s.section_key}</span>
        </Link>
        <form action={toggleSection}>
          {ids}
          <input type="hidden" name="enabled" value={s.is_enabled ? 'false' : 'true'} />
          <button type="submit" className={smallBtn}>
            {s.is_enabled ? 'Hide' : 'Show'}
            <span className="sr-only"> {s.section_key}</span>
          </button>
        </form>
        <form action={moveSection}>
          {ids}
          <input type="hidden" name="direction" value="up" />
          <button type="submit" className={smallBtn} disabled={first}>
            Move up<span className="sr-only"> {s.section_key}</span>
          </button>
        </form>
        <form action={moveSection}>
          {ids}
          <input type="hidden" name="direction" value="down" />
          <button type="submit" className={smallBtn} disabled={last}>
            Move down<span className="sr-only"> {s.section_key}</span>
          </button>
        </form>
        {deletable ? (
          <form action={deleteSection} className="flex flex-wrap items-center gap-2 sm:ml-auto">
            {ids}
            <label className="flex items-center gap-1.5 text-xs">
              <input type="checkbox" name="confirm" required className="size-4" />
              Confirm<span className="sr-only"> deleting {s.section_key}</span>
            </label>
            <DangerButton>
              Delete<span className="sr-only"> {s.section_key}</span>
            </DangerButton>
          </form>
        ) : null}
      </div>
      {s.section_type === 'hero_search' ? (
        <p className="mt-2 text-xs text-red-800">
          Warning: this is the hero. Its heading is the page&apos;s main heading and it holds the
          search bar. Deleting it also deletes its photo choice, settings and category tiles; hide
          it instead if you may want it back.
        </p>
      ) : null}
    </li>
  );
}

function AddSection({ hasHero }: { hasHero: boolean }) {
  return (
    <form action={addSection} className="surface-card mt-4 grid gap-4 p-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <h3 className="text-base font-semibold">Add a section</h3>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          New sections start hidden at the end of the homepage. Fill one in, move it into place,
          then choose Show.
        </p>
      </div>
      <label className="block text-sm sm:col-span-2">
        <span className="font-medium">
          Section type<span className="text-red-700"> *</span>
        </span>
        <select name="type" required defaultValue="" className={inputCls}>
          <option value="" disabled>
            Choose a type…
          </option>
          {Object.entries(SECTION_TYPES).map(([type, spec]) => {
            const taken = type === 'hero_search' && hasHero;
            return (
              <option key={type} value={type} disabled={taken}>
                {spec.label} — {spec.description}
                {taken ? ' (already on the page)' : ''}
              </option>
            );
          })}
        </select>
      </label>
      <label className="block text-sm sm:col-span-2">
        <span className="font-medium">Heading</span>
        <input name="heading" maxLength={200} className={inputCls} />
        <span className="mt-1 block text-xs text-[var(--text-muted)]">
          Optional: you can also add it in the section editor.
        </span>
      </label>
      <div className="sm:col-span-2">
        <SubmitButton>Add section</SubmitButton>
      </div>
    </form>
  );
}
