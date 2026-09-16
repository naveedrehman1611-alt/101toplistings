import { supabase } from '@/lib/supabase';

/**
 * Approved reviews for one listing.
 *
 * Every string below was typed by a member of the public, so it is rendered as
 * text and nothing else — no dangerouslySetInnerHTML anywhere in this file, and
 * no Markdown pass that would smuggle markup back in. `author_email` is never
 * selected, let alone rendered: 0015 keeps it for moderators only.
 *
 * Columns are listed explicitly rather than `select *`, which is what 0015's
 * closing note asks for.
 */

type Author = { display_name: string | null };

type ReviewRow = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  author_name: string | null;
  created_at: string;
  reply_body: string | null;
  replied_at: string | null;
  // PostgREST returns an object for this to-one embed; supabase-js types an
  // un-generated schema's embeds as arrays. Accept both.
  author?: Author | Author[] | null;
};

const COLUMNS = 'id, rating, title, body, author_name, created_at, reply_body, replied_at';

function formatDate(iso: string): string {
  // Fixed locale and UTC so the server-rendered string and the hydrated one match.
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(iso));
}

/** Anonymous rows carry author_name; account rows carry a profile. */
function displayName(review: ReviewRow): string {
  const profile = Array.isArray(review.author) ? review.author[0] : review.author;
  const name = review.author_name?.trim() || profile?.display_name?.trim();
  return name && name.length > 0 ? name : 'Verified reviewer';
}

function Rating({ value }: { value: number }) {
  const rounded = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <span className="text-sm" aria-label={`${rounded} out of 5`}>
      <span aria-hidden className="text-accent-500">
        {'★'.repeat(rounded)}
        <span className="text-ink-300">{'★'.repeat(5 - rounded)}</span>
      </span>
    </span>
  );
}

async function fetchReviews(listingId: string, limit: number): Promise<ReviewRow[]> {
  // profiles is not readable by anon (profiles_self_read, 0008), so the embed is
  // a best effort for account-authored reviews; if PostgREST rejects the join the
  // plain columns are still worth rendering.
  const withAuthor = await supabase
    .from('reviews')
    .select(`${COLUMNS}, author:profiles!reviews_author_id_fkey(display_name)`)
    .eq('listing_id', listingId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (!withAuthor.error) return (withAuthor.data ?? []) as ReviewRow[];

  const { data } = await supabase
    .from('reviews')
    .select(COLUMNS)
    .eq('listing_id', listingId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as ReviewRow[];
}

export async function ReviewList({ listingId, limit = 20 }: { listingId: string; limit?: number }) {
  const reviews = await fetchReviews(listingId, limit);

  if (reviews.length === 0) {
    return <p className="text-[var(--text-muted)]">No reviews yet — be the first to write one.</p>;
  }

  return (
    <ul className="flex flex-col gap-5">
      {reviews.map((review) => (
        <li
          key={review.id}
          className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Rating value={review.rating} />
            <time
              dateTime={review.created_at}
              className="text-xs text-[var(--text-muted)] tabular-nums"
            >
              {formatDate(review.created_at)}
            </time>
          </div>

          {review.title ? <p className="mt-2 font-semibold">{review.title}</p> : null}

          {review.body ? (
            <p className="mt-2 leading-relaxed whitespace-pre-line text-[var(--text-muted)]">
              {review.body}
            </p>
          ) : null}

          <p className="mt-3 text-sm font-medium">{displayName(review)}</p>

          {review.reply_body ? (
            // Indented and labelled: a reader must never mistake the business's
            // answer for another customer's review.
            <div className="border-brand-700 mt-4 border-l-2 bg-[var(--surface-2)] p-4 pl-4">
              <p className="text-brand-700 text-xs font-semibold tracking-wide uppercase">
                Response from the business
                {review.replied_at ? (
                  <>
                    {' · '}
                    <time dateTime={review.replied_at} className="font-normal normal-case">
                      {formatDate(review.replied_at)}
                    </time>
                  </>
                ) : null}
              </p>
              <p className="mt-2 text-sm leading-relaxed whitespace-pre-line">
                {review.reply_body}
              </p>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
