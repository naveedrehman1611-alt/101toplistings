import { after } from 'next/server';
import { SITE_URL } from './supabase';
import { isProductionDeploy } from './deploy-env';

/**
 * IndexNow: tells Bing (and the other engines that share it, such as Yandex)
 * that a URL was published, changed or removed, instead of waiting for a
 * crawl. Bing's index also feeds ChatGPT search and Copilot.
 *
 * The key is public by design: search engines fetch it from /<key>.txt (in
 * public/) to confirm the ping comes from the site's owner.
 */
export const INDEXNOW_KEY = 'd5a2a90914759e32efc9caa8968c7657';

const ENDPOINT = 'https://api.indexnow.org/indexnow';

/**
 * Pings IndexNow for site paths after the response is sent, so a save never
 * waits on it or fails because of it. Only production on the real domain
 * pings: a preview or local URL would be rejected, and would be noise.
 */
export function notifyIndexNow(paths: string[]): void {
  if (paths.length === 0 || !isProductionDeploy()) return;
  const host = new URL(SITE_URL).host;
  if (host.endsWith('.vercel.app') || host.endsWith('.netlify.app') || host.startsWith('localhost')) return;
  const urlList = [...new Set(paths)].map((p) => `${SITE_URL}${p}`);
  after(async () => {
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          host,
          key: INDEXNOW_KEY,
          keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
          urlList,
        }),
      });
      if (!res.ok) console.error(`[indexnow] ${res.status} for ${urlList.join(', ')}`);
    } catch (e) {
      console.error('[indexnow] ping failed:', e);
    }
  });
}
