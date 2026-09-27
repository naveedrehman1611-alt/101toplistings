import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { requireRole } from '@/lib/auth';
import { deleteListing, saveListingAsStaff } from '@/lib/listing-actions';
import { LISTING_EDIT_COLUMNS, getListingFormOptions } from '@/lib/listing-options';
import { ListingForm, type EditableHour, type EditableListing } from '@/components/listing-form';
import { DangerButton, Notice } from '@/components/admin-ui';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Edit listing' };

export default async function EditListing({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const user = await requireRole('moderator');
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createClient();
  const [{ data: listing }, { data: hours }, options] = await Promise.all([
    supabase.from('listings').select(LISTING_EDIT_COLUMNS).eq('id', id).maybeSingle(),
    supabase
      .from('opening_hours')
      .select('day_of_week, opens_at, closes_at, is_closed, is_24h')
      .eq('listing_id', id),
    getListingFormOptions(),
  ]);
  if (!listing) notFound();
  const l = listing as unknown as EditableListing;

  return (
    <div>
      <p className="text-sm">
        <Link href="/admin/listings" className="text-brand-700 hover:underline">
          ← Listings
        </Link>
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{l.name}</h1>
        {l.status === 'approved' ? (
          <Link href={`/listing/${l.slug}`} className="text-brand-700 text-sm hover:underline">
            View public page →
          </Link>
        ) : (
          <span className="text-sm text-[var(--text-muted)]">Not public ({l.status})</span>
        )}
      </div>
      <Notice ok={sp.ok} error={sp.error} />

      <div className="mt-6">
        <ListingForm
          action={saveListingAsStaff}
          listing={l}
          hours={(hours ?? []) as EditableHour[]}
          categories={options.categories}
          cities={options.cities}
          staff
          submitLabel="Save changes"
        />
      </div>

      {user.role === 'admin' || user.role === 'super_admin' ? (
        <form action={deleteListing} className="mt-10 border-t border-[var(--border)] pt-6">
          <input type="hidden" name="id" value={l.id} />
          <p className="mb-3 text-sm text-[var(--text-muted)]">
            Deleting removes the listing, its hours and its reviews permanently. Suspending hides it
            and can be undone.
          </p>
          <DangerButton>Delete listing permanently</DangerButton>
        </form>
      ) : null}
    </div>
  );
}
