-- 0015 — let visitors leave a review without an account
-- Owner decision: "review koi bhi add kar sakta hai bina login ke."
--
-- 0008's reviews_author_insert requires author_id = auth.uid(), so an anonymous
-- visitor cannot insert at all today. This opens that path, but only for rows that
-- are provably harmless until a moderator acts on them:
--   * status is pinned to 'pending'  -> nothing is public until approved
--   * author_id must be null          -> an anonymous row cannot impersonate a user
--   * reply_body / moderated_* must be null
--   * the listing must actually be approved and visible
-- The public star rating is recomputed by reviews_recalc_rating from APPROVED rows
-- only (0007), so a flood of pending spam cannot move any rating.

alter table reviews add column author_name  text;
alter table reviews add column author_email text;

comment on column reviews.author_name is
  'Display name for a review left without an account. Null when author_id is set.';
comment on column reviews.author_email is
  'Contact address for an anonymous reviewer. Never rendered publicly; moderation only.';

-- Exactly one of the two identities, never both, never neither.
alter table reviews add constraint reviews_identity_shape check (
  (author_id is not null and author_name is null)
  or
  (author_id is null and author_name is not null and length(btrim(author_name)) between 2 and 80)
);

alter table reviews add constraint reviews_author_email_shape check (
  author_email is null or author_email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
);

-- A review with no words is not a review; it is a rating drive-by.
alter table reviews add constraint reviews_anon_body_required check (
  author_id is not null or (body is not null and length(btrim(body)) >= 20)
);

create index reviews_anon_recent_idx
  on reviews(listing_id, created_at desc)
  where author_id is null;

-- ---------------------------------------------------------------------------
-- Volume guard
-- ---------------------------------------------------------------------------
-- Without accounts there is no per-person key to rate-limit on, so the limit is
-- per listing: at most 5 unmoderated anonymous reviews may be queued against one
-- business at a time. A bot can still make noise, but it cannot bury the queue,
-- and a real second reviewer is never blocked on a listing that is being moderated.
-- Application-level defences (honeypot field, submit-timing check) sit in front of
-- this; this is the backstop that holds even if those are bypassed.

create or replace function guard_anonymous_review()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  queued integer;
begin
  if new.author_id is not null then
    return new;
  end if;

  select count(*) into queued
    from reviews r
   where r.listing_id = new.listing_id
     and r.author_id is null
     and r.status = 'pending';

  if queued >= 5 then
    raise exception 'too many pending reviews for this listing; try again later'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger reviews_guard_anonymous
  before insert on reviews
  for each row execute function guard_anonymous_review();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
-- reviews_author_insert (0008) stays as-is for signed-in reviewers. This is an
-- additional permissive policy for the anonymous path.

create policy reviews_anon_insert on reviews
  for insert to anon, authenticated
  with check (
    author_id is null
    and author_name is not null
    and status = 'pending'
    and reply_body is null
    and reply_by is null
    and replied_at is null
    and moderated_by is null
    and moderated_at is null
    and exists (
      select 1 from listings l
       where l.id = reviews.listing_id
         and l.status = 'approved'
    )
  );

-- Anonymous rows are never readable until approved: reviews_public_read (0008)
-- already gates on status = 'approved', and author_email must not reach the client
-- even then. The public review query must select explicit columns, never `select *`.
