import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import { updateSetting } from '@/lib/admin-actions';
import {
  FormField,
  PageHeader,
  Section,
  inputCls,
  selectCls,
  textareaCls,
} from '@/components/admin/kit';
import { FormShell, type Panel } from '@/components/admin/form-shell';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Settings' };

// Also the order the tabs are shown in; any other group follows these.
const GROUP_LABELS: Record<string, string> = {
  brand: 'Brand',
  header: 'Header',
  footer: 'Footer',
  contact: 'Contact',
  social: 'Social links',
  seo: 'SEO defaults',
  general: 'General',
};

/** Plain-language labels, so nobody has to read footer.newsletter_text. */
const LABEL: Record<string, string> = {
  'brand.name': 'Brand name',
  'brand.name_accent': 'Accent part of the name',
  'brand.logo_light_media_id': 'Logo on light backgrounds',
  'brand.logo_dark_media_id': 'Logo on dark backgrounds',
  'brand.tagline': 'Tagline',
  'brand.domain': 'Domain',
  'header.login_label': 'Sign-in link text',
  'header.login_url': 'Sign-in link',
  'header.register_label': 'Sign-up link text',
  'header.register_url': 'Sign-up link',
  'header.cta_label': 'Header button label',
  'header.cta_url': 'Header button link',
  'footer.tagline': 'Line under the footer logo',
  'footer.about': 'About text',
  'footer.locations_heading': 'Locations column heading',
  'footer.links_heading': 'Links column heading',
  'footer.newsletter_heading': 'Newsletter heading',
  'footer.newsletter_text': 'Newsletter text',
  'footer.newsletter_placeholder': 'Newsletter email placeholder',
  'footer.newsletter_button': 'Newsletter button label',
  'footer.trust_line': 'Trust line',
  'footer.copyright': 'Copyright line',
  'contact.email': 'Support email',
  'contact.phone': 'Phone',
  'contact.address': 'Office address',
  'social.facebook': 'Facebook',
  'social.instagram': 'Instagram',
  'social.x': 'X (Twitter)',
  'social.linkedin': 'LinkedIn',
  'social.youtube': 'YouTube',
  'seo.default_title': 'Default page title',
  'seo.default_description': 'Default meta description',
  'seo.location_page_min_listings': 'Listings a city page needs to be indexed',
};

/** Longer values get a textarea. */
const LONG = new Set([
  'footer.about',
  'footer.tagline',
  'contact.address',
  'seo.default_description',
  'footer.trust_line',
]);

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
  'footer.trust_line':
    'Text after the five stars in the pill under the footer blurb, such as "5.0 Google Rating · 500+ Clients Ranked". Leave it blank to hide the pill.',
  'footer.copyright': 'Follows the year in the footer bottom bar. {brand} becomes the brand name.',
  'contact.email': 'Rendered in the footer and on the contact page.',
  'contact.phone': 'Not shown by the current footer design.',
  'contact.address':
    'Location shown in the footer, linked to Google Maps. Only enter a real address; leave it blank to show "Serving businesses worldwide" instead.',
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
  const prefix = row.key.split('.')[0]!;
  return prefix in GROUP_LABELS ? prefix : (row.group ?? 'general');
}

function groupRank(group: string): number {
  const i = Object.keys(GROUP_LABELS).indexOf(group);
  return i === -1 ? Number.MAX_SAFE_INTEGER : i;
}

const asText = (v: unknown) => (typeof v === 'string' ? v : JSON.stringify(v));
const isBlob = (v: unknown) => typeof v === 'object' && v !== null;

/**
 * Saves every changed field in one go. Each change still goes through
 * updateSetting, which checks the role, validates the value for its key and
 * writes the audit entry; unchanged and structured values are skipped.
 */
async function saveSettings(fd: FormData) {
  'use server';
  await requireRole('admin');
  const supabase = await createClient();
  const { data } = await supabase.from('settings').select('key, value');
  const current = new Map(((data ?? []) as Row[]).map((r) => [r.key, r.value]));
  const saved: string[] = [];
  const errors: string[] = [];
  for (const [name, raw] of fd.entries()) {
    if (!name.startsWith('s:') || typeof raw !== 'string') continue;
    const key = name.slice(2);
    if (!current.has(key)) continue;
    const before = current.get(key);
    if (isBlob(before) || raw.trim() === asText(before ?? '').trim()) continue;
    const res = await updateSetting(key, raw);
    if (res.ok) saved.push(LABEL[key] ?? key);
    else errors.push(res.error);
  }
  const params = new URLSearchParams(
    errors.length
      ? { error: errors.join(' ') }
      : { ok: saved.length ? `Saved ${saved.join(', ')}.` : 'Nothing changed.' },
  );
  redirect(`/admin/settings?${params.toString()}`);
}

export default async function AdminSettings() {
  await requireRole('admin');
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
  const mediaOptions = ((media ?? []) as { id: string; path: string; alt: string | null }[]).map(
    (m) => {
      const file = m.path.split('/').pop() ?? m.path;
      return { id: m.id, label: m.alt?.trim() ? `${m.alt} (${file})` : file };
    },
  );

  const groups = new Map<string, Row[]>();
  for (const row of (settings ?? []) as Row[]) {
    const g = groupOf(row);
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g)!.push(row);
  }
  const ordered = [...groups.entries()].sort(
    ([a], [b]) => groupRank(a) - groupRank(b) || a.localeCompare(b),
  );

  const field = (row: Row) => {
    const id = `set-${row.key.replace(/\W/g, '-')}`;
    const name = `s:${row.key}`;
    const label = LABEL[row.key] ?? row.key;
    const help = HELP[row.key];
    if (isBlob(row.value)) {
      return (
        <FormField
          key={row.key}
          label={label}
          htmlFor={id}
          full
          help="A structured value: it needs a dedicated form, which is not built yet, so it is shown read-only."
        >
          <input
            id={id}
            readOnly
            value={asText(row.value)}
            className={`${inputCls} bg-[#F8FAFC] text-[#64748B]`}
          />
        </FormField>
      );
    }
    if (row.key.endsWith('_media_id')) {
      const value = typeof row.value === 'string' ? row.value : '';
      const listed = mediaOptions.some((o) => o.id === value);
      return (
        <FormField
          key={row.key}
          label={label}
          htmlFor={id}
          full
          help={<>{help} Upload images under Media first.</>}
        >
          <select id={id} name={name} defaultValue={value} className={selectCls}>
            <option value="">No image</option>
            {value && !listed ? (
              <option value={value}>Saved image (not in the library list)</option>
            ) : null}
            {mediaOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </FormField>
      );
    }
    const text = asText(row.value ?? '');
    return (
      <FormField
        key={row.key}
        label={label}
        htmlFor={id}
        full={LONG.has(row.key) || row.key.startsWith('social.')}
        help={help}
      >
        {LONG.has(row.key) ? (
          <textarea id={id} name={name} rows={3} defaultValue={text} className={textareaCls} />
        ) : (
          <input
            id={id}
            name={name}
            type={typeof row.value === 'number' ? 'number' : 'text'}
            defaultValue={text}
            className={inputCls}
          />
        )}
      </FormField>
    );
  };

  const panels: Panel[] = ordered.map(([group, rows]) => ({
    id: group,
    label: GROUP_LABELS[group] ?? group,
    content: <Section title={GROUP_LABELS[group] ?? group}>{rows.map(field)}</Section>,
  }));

  return (
    <>
      <PageHeader
        title="Settings"
        description="Brand, header, footer, contact and SEO defaults. These values are what the public site renders, so a change here shows everywhere, including page titles and share cards."
      />
      {panels.length ? (
        <FormShell action={saveSettings} panels={panels} />
      ) : (
        <p className="m-0 text-sm text-[#64748B]">
          No settings rows yet. Run the migrations to create them.
        </p>
      )}
    </>
  );
}
