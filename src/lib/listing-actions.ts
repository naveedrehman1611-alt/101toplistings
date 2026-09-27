'use server';

import { createClient } from './supabase-server';
import { requireRole, requireUser } from './auth';
import { writeAudit } from './audit';
import { check, runAndReturn } from './action-flow';
import { FormError, bool, text, uuid } from './form-data';
import { freeSlug, parseHours, parseListingForm, writeHours } from './listing-input';

const STATUSES = ['approved', 'pending', 'draft', 'rejected', 'suspended'] as const;
const VERIFICATIONS = ['unverified', 'pending', 'verified', 'rejected'] as const;

function pick<T extends readonly string[]>(
  value: string | null,
  allowed: T,
  label: string,
): T[number] {
  if (value && (allowed as readonly string[]).includes(value)) return value as T[number];
  throw new FormError(`Choose a ${label}.`);
}

/** Admin create/update. Staff may set every field, including publishing ones. */
export async function saveListingAsStaff(fd: FormData) {
  const user = await requireRole('moderator');
  const id = uuid(fd, 'id');
  await runAndReturn(id ? `/admin/listings/${id}` : '/admin/listings', async () => {
    const supabase = await createClient();
    const base = await parseListingForm(fd, supabase);
    const hours = parseHours(fd);
    const status = pick(text(fd, 'status', 20), STATUSES, 'status');

    const row = {
      ...base,
      status,
      verification: pick(text(fd, 'verification', 20), VERIFICATIONS, 'verification'),
      is_featured: bool(fd, 'is_featured'),
      seo_title: text(fd, 'seo_title', 200),
      seo_description: text(fd, 'seo_description', 300),
      slug: await freeSlug(supabase, text(fd, 'slug', 120) ?? base.name, id ?? undefined),
      last_updated_by: user.id,
    };

    if (id) {
      const before = check(await supabase.from('listings').select('*').eq('id', id).maybeSingle());
      if (!before) throw new FormError('Listing not found.');
      const patch = {
        ...row,
        // Publishing stamps the date once; re-approving must not reorder the feed.
        published_at:
          status === 'approved' && !before.published_at
            ? new Date().toISOString()
            : before.published_at,
      };
      const after = check(
        await supabase.from('listings').update(patch).eq('id', id).select('*').maybeSingle(),
      );
      await writeHours(supabase, id, hours);
      await writeAudit(user.id, 'update', 'listing', id, before, after);
      return `Saved ${row.name}.`;
    }

    const after = check(
      await supabase
        .from('listings')
        .insert({
          ...row,
          created_by: user.id,
          published_at: status === 'approved' ? new Date().toISOString() : null,
        })
        .select('*')
        .single(),
    );
    await writeHours(supabase, after.id, hours);
    await writeAudit(user.id, 'create', 'listing', after.id, null, after);
    return `Added ${row.name}.`;
  });
}

export async function deleteListing(fd: FormData) {
  const user = await requireRole('admin');
  await runAndReturn('/admin/listings', async () => {
    const id = uuid(fd, 'id');
    if (!id) throw new FormError('Nothing selected.');
    const supabase = await createClient();
    const before = check(await supabase.from('listings').select('*').eq('id', id).maybeSingle());
    if (!before) throw new FormError('Listing not found.');
    check(await supabase.from('listings').delete().eq('id', id));
    await writeAudit(user.id, 'delete', 'listing', id, before, null);
    return `Deleted ${before.name}.`;
  });
}

// ---------------------------------------------------------------------------
// Business owners
// ---------------------------------------------------------------------------
// Owners submit as 'pending' and can never publish, verify or feature their own
// listing. The RLS insert/update policies enforce the same thing at the database.

export async function submitOwnListing(fd: FormData) {
  const user = await requireUser('/dashboard/listings/new');
  await runAndReturn('/dashboard', async () => {
    const supabase = await createClient();
    const base = await parseListingForm(fd, supabase);
    const hours = parseHours(fd);
    const after = check(
      await supabase
        .from('listings')
        .insert({
          ...base,
          slug: await freeSlug(supabase, base.name),
          owner_user_id: user.id,
          created_by: user.id,
          last_updated_by: user.id,
          status: 'pending',
          verification: 'unverified',
        })
        .select('id, name')
        .single(),
    );
    if (!after) throw new FormError('The listing could not be saved.');
    await writeHours(supabase, after.id, hours);
    return `Thanks — ${after.name} was submitted and will appear once it has been reviewed.`;
  });
}

export async function updateOwnListing(fd: FormData) {
  const user = await requireUser('/dashboard');
  const id = uuid(fd, 'id');
  await runAndReturn(id ? `/dashboard/listings/${id}` : '/dashboard', async () => {
    if (!id) throw new FormError('Nothing selected.');
    const supabase = await createClient();
    const { data: own } = await supabase
      .from('listings')
      .select('id, owner_user_id')
      .eq('id', id)
      .maybeSingle();
    if (!own || own.owner_user_id !== user.id) throw new FormError('Listing not found.');

    const base = await parseListingForm(fd, supabase);
    const hours = parseHours(fd);
    check(
      await supabase
        .from('listings')
        .update({ ...base, last_updated_by: user.id })
        .eq('id', id)
        .eq('owner_user_id', user.id),
    );
    await writeHours(supabase, id, hours);
    return `Saved ${base.name}.`;
  });
}
