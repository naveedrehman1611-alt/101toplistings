/**
 * The listings CSV format, shared by the export (src/app/admin/listings/export)
 * and the import (listing-import-actions.ts), so an exported file can be edited
 * and imported straight back. `category` and `city` are slugs; `created_at` is
 * written on export and ignored on import.
 */
export const LISTING_CSV_COLUMNS = [
  'id',
  'name',
  'slug',
  'status',
  'verification',
  'is_featured',
  'category',
  'city',
  'tagline',
  'description',
  'phone_primary',
  'phone_secondary',
  'email',
  'website',
  'address',
  'postal_code',
  'latitude',
  'longitude',
  'seo_title',
  'seo_description',
  'created_at',
] as const;

export type ListingCsvColumn = (typeof LISTING_CSV_COLUMNS)[number];
