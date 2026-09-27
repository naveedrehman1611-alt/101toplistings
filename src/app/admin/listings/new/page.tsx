import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { saveListingAsStaff } from '@/lib/listing-actions';
import { getListingFormOptions } from '@/lib/listing-options';
import { ListingForm } from '@/components/listing-form';
import { Notice } from '@/components/admin-ui';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Add listing' };

export default async function NewListing({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireRole('moderator');
  const sp = await searchParams;
  const { categories, cities } = await getListingFormOptions();

  return (
    <div>
      <p className="text-sm">
        <Link href="/admin/listings" className="text-brand-700 hover:underline">
          ← Listings
        </Link>
      </p>
      <h1 className="mt-2 text-2xl font-semibold">Add a listing</h1>
      <Notice error={sp.error} />
      {cities.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-[var(--border)] p-5 text-sm">
          Add at least one city under{' '}
          <Link href="/admin/locations" className="text-brand-700 hover:underline">
            Locations
          </Link>{' '}
          first — every listing belongs to a city.
        </p>
      ) : (
        <div className="mt-6">
          <ListingForm
            action={saveListingAsStaff}
            categories={categories}
            cities={cities}
            staff
            submitLabel="Add listing"
          />
        </div>
      )}
    </div>
  );
}
