import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import { addSection, deleteSection, moveSection, toggleSection } from '@/lib/section-actions';
import { SECTION_TYPES, isHomeSectionType } from '@/lib/sections';
import { FormField, PageHeader, PreviewNotice, inputCls, rowAct, selectCls } from '@/components/admin/kit';
import { ConfirmButton, ModalForm } from '@/components/admin/dialog';
import { OrderRow, moveBtn } from '@/components/admin/order-list';
import { TabbedCard } from '@/components/admin/tabbed-card';

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

function typeLabel(type: string): string {
  return isHomeSectionType(type) ? SECTION_TYPES[type].label : type;
}

function preview(text: string | null): string | null {
  const t = text?.trim();
  if (!t) return null;
  return t.length > 120 ? `${t.slice(0, 119)}…` : t;
}

function SectionRow({ s, n, first, last }: { s: Section; n: number; first: boolean; last: boolean }) {
  // Only builder sections can be added back, so a page's own header is not deletable.
  const deletable = isHomeSectionType(s.section_type);
  const name = preview(s.heading) ?? s.section_key;
  const ids = (
    <>
      <input type="hidden" name="id" value={s.id} />
      <input type="hidden" name="page_id" value={s.page_id} />
    </>
  );
  return (
    <OrderRow n={n} label={name} sub={`${typeLabel(s.section_type)} · ${s.section_key}`} hidden={!s.is_enabled}>
      <form action={moveSection}>
        {ids}
        <input type="hidden" name="direction" value="up" />
        <button type="submit" className={moveBtn} disabled={first} aria-label={`Move ${name} up`}>
          ↑
        </button>
      </form>
      <form action={moveSection}>
        {ids}
        <input type="hidden" name="direction" value="down" />
        <button type="submit" className={moveBtn} disabled={last} aria-label={`Move ${name} down`}>
          ↓
        </button>
      </form>
      <form action={toggleSection}>
        {ids}
        <input type="hidden" name="enabled" value={s.is_enabled ? 'false' : 'true'} />
        <button type="submit" className={rowAct.base}>
          {s.is_enabled ? 'Hide' : 'Show'}
        </button>
      </form>
      <Link href={`/admin/pages/sections/${s.id}`} className={`${rowAct.base} hover:no-underline`}>
        Edit
      </Link>
      {deletable ? (
        <form action={deleteSection}>
          {ids}
          <input type="hidden" name="confirm" value="on" />
          <ConfirmButton
            className={rowAct.bad}
            title={`Delete “${name}”?`}
            body={
              s.section_type === 'hero_search'
                ? 'This is the hero: its heading is the page’s main heading and it holds the search bar. Its photo, settings and category tiles go too. Hide it instead if you may want it back.'
                : 'The section and its items are removed from the homepage. Hide it instead if you may want it back.'
            }
            ok="Delete"
            danger
          >
            Delete
          </ConfirmButton>
        </form>
      ) : null}
    </OrderRow>
  );
}

export default async function AdminPages() {
  await requireRole('editor');
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

  const tabs = pages.map((page) => {
    const rows = sections.filter((s) => s.page_id === page.id);
    const isHome = page.slug === 'home';
    const hasHero = rows.some((s) => s.section_type === 'hero_search');
    return {
      id: page.id,
      label: page.title,
      content: (
        <>
          {rows.map((s, i) => (
            <SectionRow key={s.id} s={s} n={i + 1} first={i === 0} last={i === rows.length - 1} />
          ))}
          {rows.length === 0 ? (
            <p className="m-0 px-4 py-8 text-center text-sm text-[#64748B]">No sections on this page yet.</p>
          ) : null}
        </>
      ),
      footer: isHome ? (
        <ModalForm
          trigger="+ Add section"
          triggerClassName="cursor-pointer border-0 bg-transparent p-0 text-[13.5px] font-semibold text-[#0C8226]"
          title="Add a section"
          body="New sections start hidden at the end of the homepage. Fill one in, move it into place, then choose Show."
          action={addSection}
          ok="Add section"
        >
          <FormField label="Section type" htmlFor="sec-type" required>
            <select id="sec-type" name="type" required defaultValue="" className={selectCls}>
              <option value="" disabled>
                Choose a type…
              </option>
              {Object.entries(SECTION_TYPES).map(([type, spec]) => {
                const taken = type === 'hero_search' && hasHero;
                return (
                  <option key={type} value={type} disabled={taken}>
                    {spec.label}
                    {taken ? ' (already on the page)' : ''}
                  </option>
                );
              })}
            </select>
          </FormField>
          <FormField label="Heading" htmlFor="sec-heading" help="Optional: you can also add it in the section editor.">
            <input id="sec-heading" name="heading" maxLength={200} className={inputCls} />
          </FormField>
        </ModalForm>
      ) : (
        <span className="text-[12.5px] text-[#64748B]">
          {page.route_pattern} · this page has a fixed layout; edit its header copy.
        </span>
      ),
    };
  });

  return (
    <>
      <PageHeader
        title="Pages & sections"
        description="Build the homepage from sections: edit, reorder, hide, add or delete them. Homepage copy may say {brand} for the brand name."
        actions={[{ label: 'Preview homepage ↗', href: '/', external: true }]}
      />
      <PreviewNotice>
        The live homepage currently uses the fixed Stitch layout, so edits to the homepage sections are
        saved here but do not change the homepage yet.
      </PreviewNotice>
      {tabs.length ? (
        <TabbedCard tabs={tabs} />
      ) : (
        <p className="m-0 text-sm text-[#64748B]">No pages exist. Run the migrations to create them.</p>
      )}
    </>
  );
}
