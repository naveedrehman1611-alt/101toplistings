import 'server-only';
import { createClient } from './supabase-server';
import { mediaUrl } from './media';

/** The newest library images, as choices for the OG image picker. */
export async function getOgOptions(limit = 6) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('media')
    .select('id, path')
    .eq('folder', 'library')
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data ?? []).map((m) => ({
    id: m.id as string,
    url: mediaUrl(m.path as string),
    name: String(m.path).split('/').pop() ?? String(m.path),
  }));
}
