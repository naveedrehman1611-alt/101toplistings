-- 0004 — reviews, favourites, claims
-- The reference site has NO observable review experience: eight listings were sampled
-- and all showed the zero state, no aggregateRating is ever emitted, and the token set
-- contains no star colour (reference-analysis.md, Prompt 5 §6). Criterion 16 still
-- requires reviews, so this is designed rather than copied.

create table reviews (
  id           uuid primary key default gen_random_uuid(),
  listing_id   uuid not null references listings(id) on delete cascade,
  author_id    uuid references profiles(id) on delete set null,
  rating       smallint not null check (rating between 1 and 5),
  title        text,
  body         text,
  status       review_status not null default 'pending',
  -- Owner or admin reply, per §9.5.4 "reply as owner or admin"
  reply_body   text,
  reply_by     uuid references profiles(id) on delete set null,
  replied_at   timestamptz,
  moderated_by uuid references profiles(id) on delete set null,
  moderated_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  -- One review per person per business.
  unique (listing_id, author_id)
);

create index reviews_listing_idx  on reviews(listing_id, status, created_at desc);
create index reviews_author_idx   on reviews(author_id);
create index reviews_moderation_idx on reviews(status, created_at desc) where status in ('pending','flagged');

create table favourites (
  user_id    uuid not null references profiles(id) on delete cascade,
  listing_id uuid not null references listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create index favourites_listing_idx on favourites(listing_id);

-- §7 "claims" — a business owner asserting ownership of an existing listing.
create table claims (
  id           uuid primary key default gen_random_uuid(),
  listing_id   uuid not null references listings(id) on delete cascade,
  claimant_id  uuid not null references profiles(id) on delete cascade,
  message      text,
  evidence_url text,
  status       submission_status not null default 'new',
  handled_by   uuid references profiles(id) on delete set null,
  handled_at   timestamptz,
  created_at   timestamptz not null default now(),
  unique (listing_id, claimant_id)
);

create index claims_status_idx  on claims(status, created_at desc);
create index claims_listing_idx on claims(listing_id);
