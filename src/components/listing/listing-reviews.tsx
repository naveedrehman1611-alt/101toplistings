import { Stars } from '@/components/ui';
import type { ListingDetail, PublicReview } from '@/lib/queries';
import { REVIEW_CRITERIA, type ReviewCriterionKey } from '@/lib/review-criteria';
import { ReviewForm } from './review-form';

type ReviewedListing = Pick<
  ListingDetail,
  'id' | 'slug' | 'name' | 'rating_average' | 'review_count'
>;

/** A stored aspect rating, or null when the review skipped it (or predates 0018). */
function aspectValue(review: PublicReview, key: ReviewCriterionKey) {
  const v = review[key];
  return typeof v === 'number' && v >= 1 && v <= 5 ? v : null;
}

/**
 * The reviews section of the listing page: summary, approved reviews and the
 * form. Rendered into the statically cached page, so it reads nothing about
 * the visitor — the form's action checks who is signed in.
 */
export function ListingReviews({
  listing,
  reviews,
}: {
  listing: ReviewedListing;
  reviews: PublicReview[];
}) {
  const form = (
    <div className="surface-card mt-4 p-5">
      <ReviewForm listingId={listing.id} slug={listing.slug} />
    </div>
  );

  if (reviews.length === 0) {
    return (
      <section id="reviews" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-semibold">Be the first to review “{listing.name}”</h2>
        {form}
      </section>
    );
  }

  // Only 50 reviews are loaded; the stored count covers them all.
  const total = Math.max(listing.review_count, reviews.length);
  const hasOverall = listing.rating_average !== null && listing.review_count > 0;
  const aspects = REVIEW_CRITERIA.flatMap(({ key, label }) => {
    const values = reviews.map((r) => aspectValue(r, key)).filter((v) => v !== null);
    if (values.length === 0) return [];
    const average = values.reduce((sum, v) => sum + v, 0) / values.length;
    return [{ key, label, average, count: values.length }];
  });

  return (
    <section id="reviews" className="mt-10 scroll-mt-24">
      <h2 className="text-xl font-semibold">
        {total} review{total === 1 ? '' : 's'} for “{listing.name}”
      </h2>

      {hasOverall || aspects.length > 0 ? (
        <div className="surface-card mt-4 flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:gap-10">
          {hasOverall ? (
            <div className="shrink-0">
              <p className="text-sm text-[var(--text-muted)]">Overall rating</p>
              <div className="mt-1">
                <Stars value={listing.rating_average} count={listing.review_count} />
              </div>
            </div>
          ) : null}
          {aspects.length > 0 ? (
            <dl className="w-full max-w-md space-y-2 text-sm">
              {aspects.map((a) => (
                <div key={a.key} className="flex items-center gap-3">
                  <dt className="w-24 shrink-0">{a.label}</dt>
                  <dd className="flex flex-1 items-center gap-3">
                    <span
                      aria-hidden
                      className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--border)]"
                    >
                      <span
                        className="bg-accent-500 block h-full rounded-full"
                        style={{ width: `${(a.average / 5) * 100}%` }}
                      />
                    </span>
                    <span className="shrink-0 tabular-nums">
                      <span className="font-medium">{a.average.toFixed(1)}</span>
                      <span className="sr-only"> out of 5</span>{' '}
                      <span className="text-[var(--text-muted)]">({a.count})</span>
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      ) : null}

      {total > reviews.length ? (
        <p className="mt-4 text-sm text-[var(--text-muted)]">
          Showing the {reviews.length} most recent.
        </p>
      ) : null}

      <ul className="mt-4 space-y-4">
        {reviews.map((r) => {
          const rating = Math.min(5, Math.max(0, Math.round(r.rating)));
          const details = REVIEW_CRITERIA.flatMap(({ key, label }) => {
            const v = aspectValue(r, key);
            return v === null ? [] : [`${label} ${v}/5`];
          });
          return (
            <li key={r.id} className="surface-card p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  role="img"
                  aria-label={`${rating} out of 5 stars`}
                  className="text-accent-500"
                >
                  {'★'.repeat(rating)}
                  <span className="text-[var(--border)]">{'★'.repeat(5 - rating)}</span>
                </span>
                {r.title ? <span className="font-medium">{r.title}</span> : null}
              </div>
              {details.length > 0 ? (
                <p className="mt-1 text-xs text-[var(--text-muted)]">{details.join(' · ')}</p>
              ) : null}
              {r.body ? (
                <p className="mt-2 text-sm leading-relaxed whitespace-pre-line">{r.body}</p>
              ) : null}
              <p className="mt-2 text-xs text-[var(--text-muted)]">
                {r.author_name ?? 'Visitor'} ·{' '}
                <time dateTime={r.created_at}>
                  {new Date(r.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </time>
              </p>
              {r.reply_body ? (
                <div className="border-brand-500 mt-3 border-l-2 pl-3 text-sm">
                  <p className="font-medium">Reply from the business</p>
                  <p className="mt-1 whitespace-pre-line text-[var(--text-muted)]">
                    {r.reply_body}
                  </p>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      <h3 className="mt-10 text-lg font-semibold">Add a review</h3>
      {form}
    </section>
  );
}
