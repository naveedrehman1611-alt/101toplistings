'use server';

import { createClient } from './supabase-server';
import { requireRole } from './auth';
import { writeAudit } from './audit';
import { check, runAndReturn } from './action-flow';
import { FormError, bool, num, required, text, uuid } from './form-data';
import { checkLink, checkRedirectSource } from './link-rules';
import { MAX_SOURCE_LENGTH } from './redirects';
import { NOINDEX_ROBOTS, isSeoRoute } from './seo';

// Each action re-checks the role itself: a Server Action is a public endpoint,
// so the admin layout's check does not protect it. RLS enforces it a third time.

// ---------------------------------------------------------------------------
// SEO overrides for the static routes (editor+)
// ---------------------------------------------------------------------------

function seoRoute(fd: FormData) {
  const route = text(fd, 'route', 100);
  // Only the routes whose pages read an override; anything else would be a
  // row that silently does nothing.
  if (!route || !isSeoRoute(route)) throw new FormError('Unknown page.');
  return route;
}

export async function saveSeoOverride(fd: FormData) {
  const user = await requireRole('editor');
  await runAndReturn('/admin/seo', async () => {
    const supabase = await createClient();
    const route = seoRoute(fd);
    const row = {
      title: text(fd, 'title', 120),
      description: text(fd, 'description', 320),
      robots: bool(fd, 'noindex') ? NOINDEX_ROBOTS : null,
      in_sitemap: bool(fd, 'in_sitemap'),
      updated_at: new Date().toISOString(),
    };
    const before = check(
      await supabase.from('seo_meta').select('*').eq('route', route).maybeSingle(),
    );

    // A row that overrides nothing is removed, so the table only ever holds
    // real overrides and "no row" keeps meaning "page defaults".
    const isDefault = !row.title && !row.description && !row.robots && row.in_sitemap;
    if (isDefault) {
      if (!before) return `${route} already uses its defaults.`;
      check(await supabase.from('seo_meta').delete().eq('id', before.id));
      await writeAudit(user.id, 'delete', 'seo_meta', before.id, before, null);
      return `${route} is back to its defaults.`;
    }

    // Updated or inserted by hand: the route index is partial (where route is
    // not null), which PostgREST's upsert cannot target.
    if (before) {
      const after = check(
        await supabase.from('seo_meta').update(row).eq('id', before.id).select('*').maybeSingle(),
      );
      await writeAudit(user.id, 'update', 'seo_meta', before.id, before, after);
    } else {
      const after = check(
        await supabase
          .from('seo_meta')
          .insert({ ...row, route })
          .select('*')
          .single(),
      );
      await writeAudit(user.id, 'create', 'seo_meta', after.id, null, after);
    }
    return `Saved SEO for ${route}.`;
  });
}

// ---------------------------------------------------------------------------
// Redirects (admin+): a wrong rule can send real traffic off-site
// ---------------------------------------------------------------------------

const STATUS_CODES = [301, 302, 307, 308];

export async function saveRedirect(fd: FormData) {
  const user = await requireRole('admin');
  await runAndReturn('/admin/redirects', async () => {
    const supabase = await createClient();
    const source = checkRedirectSource(required(fd, 'source', 'Source', MAX_SOURCE_LENGTH));
    if (source.length > MAX_SOURCE_LENGTH) throw new FormError('Source is too long.');
    const destination = checkLink(required(fd, 'destination', 'Destination', 1000), 'Destination');
    const statusCode = num(fd, 'status_code', 'Status code') ?? 301;
    if (!STATUS_CODES.includes(statusCode)) throw new FormError('Choose 301, 302, 307 or 308.');

    if (!destination.isExternal) {
      // A same-site destination that points back at the source, directly or
      // through one other rule, would bounce the browser forever.
      const target = new URL(destination.url, 'http://localhost').pathname;
      if (target === source) throw new FormError('A redirect cannot point at itself.');
      const back = check(
        await supabase.from('redirects').select('destination').eq('source', target).maybeSingle(),
      );
      if (back && new URL(back.destination, 'http://localhost').pathname === source) {
        throw new FormError(`${target} already redirects to ${source}; that would loop.`);
      }
    }

    const existing = check(
      await supabase.from('redirects').select('id').eq('source', source).maybeSingle(),
    );
    if (existing) throw new FormError(`${source} already redirects. Delete that rule first.`);

    const after = check(
      await supabase
        .from('redirects')
        .insert({ source, destination: destination.url, status_code: statusCode })
        .select('*')
        .single(),
    );
    await writeAudit(user.id, 'create', 'redirect', after.id, null, after);
    return `Added ${source} → ${destination.url}.`;
  });
}

export async function deleteRedirect(fd: FormData) {
  const user = await requireRole('admin');
  await runAndReturn('/admin/redirects', async () => {
    const supabase = await createClient();
    const id = uuid(fd, 'id');
    if (!id) throw new FormError('Nothing selected.');
    const before = check(await supabase.from('redirects').select('*').eq('id', id).maybeSingle());
    if (!before) throw new FormError('Redirect not found.');
    check(await supabase.from('redirects').delete().eq('id', id));
    await writeAudit(user.id, 'delete', 'redirect', id, before, null);
    return `Deleted the redirect from ${before.source}.`;
  });
}
