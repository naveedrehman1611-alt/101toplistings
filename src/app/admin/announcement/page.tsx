import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import { getSettings, settingText } from '@/lib/queries';
import { PageHeader, PreviewNotice } from '@/components/admin/kit';
import { AnnouncementEditor, type AnnouncementDraft } from '@/components/admin/announcement-editor';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Announcement bar' };

/** announcements.variant → the editor's colour names. */
const VARIANT: Record<string, AnnouncementDraft['style']> = {
  info: 'navy',
  navy: 'navy',
  success: 'green',
  green: 'green',
  warning: 'gold',
  gold: 'gold',
  blue: 'blue',
};

export default async function AdminAnnouncement() {
  await requireRole('editor');
  const supabase = await createClient();
  const [{ data }, settings] = await Promise.all([
    supabase
      .from('announcements')
      .select('body, cta_label, cta_url, variant, starts_at, ends_at, is_enabled')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    getSettings(),
  ]);

  const initial: AnnouncementDraft = {
    on: data?.is_enabled ?? false,
    msg: (data?.body as string | undefined) ?? '',
    label: (data?.cta_label as string | null) ?? '',
    url: (data?.cta_url as string | null) ?? '',
    style: VARIANT[(data?.variant as string | undefined) ?? 'info'] ?? 'navy',
    dismiss: true,
    start: (data?.starts_at as string | null)?.slice(0, 10) ?? '',
    end: (data?.ends_at as string | null)?.slice(0, 10) ?? '',
  };

  return (
    <>
      <PageHeader
        title="Announcement bar"
        isNew
        description="A thin bar above the header on every public page."
      />
      <PreviewNotice>
        Preview:{' '}
        {data
          ? 'this shows the latest stored announcement, but'
          : 'there is no stored announcement yet, and'}{' '}
        saving here and showing the bar on the public site are not wired up yet.
      </PreviewNotice>
      <AnnouncementEditor
        initial={initial}
        brand={settingText(settings, 'brand.name', 'RankYouSite')}
      />
    </>
  );
}
