/**
 * Optional per-aspect ratings (migration 0018). The overall score stays in
 * reviews.rating; these sit beside it and never feed the listing's average.
 */
export const REVIEW_CRITERIA = [
  { key: 'rating_service', label: 'Service' },
  { key: 'rating_hospitality', label: 'Hospitality' },
  { key: 'rating_pricing', label: 'Pricing' },
] as const;

export type ReviewCriterionKey = (typeof REVIEW_CRITERIA)[number]['key'];

/**
 * True when PostgREST rejected a request because a column does not exist yet:
 * 42703 on a select, PGRST204 on an insert. Reads and writes of the 0018
 * columns fall back to the pre-0018 shape on this, so the site keeps working
 * on a database where the migration has not been applied.
 */
export function isMissingColumnError(error: { code?: string } | null | undefined): boolean {
  return error?.code === '42703' || error?.code === 'PGRST204';
}
