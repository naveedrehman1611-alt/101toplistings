import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import { updateSetting, type ActionResult } from '@/lib/admin-actions';
import { mediaUrl } from '@/lib/media';
import { Notice } from '@/components/admin-ui';
import { MediaSelect, type MediaOption } from '@/components/admin/media-select';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Settings' };

// Also the order the groups are shown in; any other group follows these.
const GROUP_LABELS: Record<string, string> = {
  brand: 'Brand',
  header: 'Header',
  footer: 'Footer',
  contact: 'Contact',
  social: 'Social links',
  seo: 'SEO',
  general: 'General',
};

const SOCIAL_HELP = 'An empty value hides the icon in the footer.';

const HELP: Record<string, string> = {
  'brand.name':
    'Shown in the header, the footer and every page title. Homepage and footer copy say {brand} where the name goes, so a rebrand is this one edit.',
  'brand.name_accent':
    'The end of the brand name drawn in orange in the logo wordmark, such as Site in RankYouSite. It must be how the name ends; leave it blank for one colour.',
  'brand.logo_light_media_id':
    'Logo shown on white backgrounds (inner-page header). Upload it in Media first. Until one is chosen, the brand name is drawn as a wordmark.',
  'brand.logo_dark_media_id':
    'Logo shown on dark backgrounds (homepage header, footer). Falls back to the light logo.',
  'brand.tagline':
    'Not shown by the current design: the line under the footer logo is footer.tagline.',
  'brand.domain': 'Display only — the canonical URL comes from NEXT_PUBLIC_SITE_URL.',
  'header.login_label': 'Text of the sign-in link in the header.',
  'header.login_url': 'Where the sign-in link goes: a path on this site, such as /login.',
  'header.register_label': 'Text of the sign-up link in the header.',
  'header.register_url': 'Where the sign-up link goes: a path on this site, such as /register.',
  'header.cta_label': 'Text of the button at the end of the header.',
  'header.cta_url':
    'Where the header button goes: a path on this site, such as /dashboard/listings/new.',
  'footer.tagline': 'The line under the logo in the footer. {brand} becomes the brand name.',
  'footer.locations_heading':
    'Heading of the footer column of city links. Edit the links in Menus → Locations.',
  'footer.links_heading':
    'Heading of the footer column of page links. Edit the links in Menus → Useful Links.',
  'footer.newsletter_heading': 'Heading of the newsletter sign-up in the footer.',
  'footer.newsletter_text':
    'The line above the newsletter email box. {brand} becomes the brand name.',
  'footer.newsletter_placeholder': 'Placeholder text inside the newsletter email box.',
  'footer.newsletter_button': 'Label of the newsletter subscribe button.',
  'footer.copyright': 'Follows the year in the footer bottom bar. {brand} becomes the brand name.',
  'contact.email': 'Rendered in the footer and on the contact page.',
  'contact.phone': 'Phone number shown in the footer. Leave it blank to show none.',
  'contact.address': 'Postal address shown in the footer. Leave it blank to show none.',
  'social.facebook': `Full https:// address of the Facebook page. ${SOCIAL_HELP}`,
  'social.instagram': `Full https:// address of the Instagram profile. ${SOCIAL_HELP}`,
  'social.x': `Full https:// address of the X (Twitter) profile. ${SOCIAL_HELP}`,
  'social.linkedin': `Full https:// address of the LinkedIn page. ${SOCIAL_HELP}`,
  'social.youtube': `Full https:// address of the YouTube channel. ${SOCIAL_HELP}`,
  'seo.default_title': 'Fallback title, and the homepage title.',
  'seo.default_description': 'Fallback meta description.',
  'seo.location_page_min_listings':
    'A city page below this many listings is served noindex, so thin pages stay out of search.',
};

type Row = { key: string; value: unknown; group: string | null };

/**
 * A key's own prefix names its group when that is a known one, so
 * footer.copyright (seeded into "general" by 0013) sits with the footer.
 */
function groupOf(row: Row): string {
  const prefix = row.key.split('.')[0];
  return prefix in GROUP_LABELS ? prefix : (row.group ?? 'general');
}

function groupRank(group: string): number {
  const i = Object.keys(GROUP_LABELS).indexOf(group);
  return i === -1 ? Number.MAX_SAFE_INTEGER : i;
}

/** The action's outcome goes in the URL, so the page can show it without client JavaScript. */
function outcome(result: ActionResult): string {
  const params = new URLSearchParams(result.ok ? { ok: result.message } : { error: result.error });
  return `/admin/settings?${params.toString()}`;
}

const btnCls =
  'bg-brand-700 hover:bg-brand-800 h-10 rounded-lg px-4 text-sm font-medium text-white disabled:opacity-40';

export default async function AdminSettings({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  await requireRole('admin');
  const sp = await searchParams;
  const supabase = await createClient();

  const [{ data: settings }, { data: media }] = await Promise.all([
    supabase.from('settings').select('key, value, group:group').order('key'),
    supabase
      .from('media')
      .select('id, path, alt')
      .eq('folder', 'library')
      .order('created_at', { ascending: false })
      .limit(200),
  ]);
  const mediaOptions: MediaOption[] = (
    (media ?? []) as { id: string; path: string; alt: string | null }[]
  ).map((m) => ({ id: m.id, url: mediaUrl(m.path), alt: m.alt }));

  const groups = new Map<string, Row[]>();
  for (const row of (settings ?? []) as Row[]) {
    const g = groupOf(row);
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g)!.push(row);
  }
  const ordered = [...groups.entries()].sort(
    ([a], [b]) => groupRank(a) - groupRank(b) || a.localeCompare(b),
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="mt-3 max-w-2xl text-sm text-[var(--text-muted)]">
        These rows are what the public site renders. No component holds a brand name or contact
        detail of its own, so changing a value here changes it everywhere — including page titles
        and Open Graph tags.
      </p>
      <Notice ok={sp.ok} error={sp.error} />

      {ordered.map(([group, rows]) => (
        <section key={group} className="mt-8">
          <h2 className="text-lg font-semibold">{GROUP_LABELS[group] ?? group}</h2>
          <div className="mt-4 space-y-4">
            {rows.map((row) => {
              const raw = typeof row.value === 'string' ? row.value : JSON.stringify(row.value);
              const isJsonBlob = typeof row.value === 'object' && row.value !== null;
              const isMedia = row.key.endsWith('_media_id') && !isJsonBlob;
              // Only the key is bound into the action, not the whole row.
              const key = row.key;
              const save = async (formData: FormData) => {
                'use server';
                redirect(outcome(await updateSetting(key, String(formData.get('value') ?? ''))));
              };
              if (isMedia) {
                return (
                  <form key={row.key} action={save} className="surface-card p-4">
                    <MediaSelect
                      name="value"
                      label={row.key}
                      options={mediaOptions}
                      defaultValue={typeof row.value === 'string' ? row.value : ''}
                      hint={HELP[row.key]}
                    />
                    <button type="submit" className={`${btnCls} mt-3`}>
                      Save
                    </button>
                  </form>
                );
              }
              return (
                <form key={row.key} action={save} className="surface-card p-4">
                  <label htmlFor={`s-${row.key}`} className="block text-sm font-medium">
                    {row.key}
                  </label>
                  {HELP[row.key] ? (
                    <p className="mt-1 text-xs text-[var(--text-muted)]">{HELP[row.key]}</p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <input
                      id={`s-${row.key}`}
                      name="value"
                      defaultValue={raw}
                      readOnly={isJsonBlob}
                      className="focus:border-brand-500 h-10 min-w-0 flex-1 rounded-lg border border-[var(--border)] px-3 text-sm outline-none read-only:bg-[var(--surface-2)] read-only:text-[var(--text-muted)]"
                    />
                    <button type="submit" disabled={isJsonBlob} className={btnCls}>
                      Save
                    </button>
                  </div>
                  {isJsonBlob ? (
                    <p className="mt-2 text-xs text-[var(--text-muted)]">
                      Structured value — editing this needs a dedicated form, which is not built
                      yet. Shown read-only rather than risking a malformed write.
                    </p>
                  ) : null}
                </form>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
