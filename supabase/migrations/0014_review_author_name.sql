-- 0014 — reviewer display name
--
-- Reviews are public but profiles are not (profiles_self_read), so an anonymous
-- visitor cannot join a review to its author's name. The name shown on a review
-- is copied onto the review when it is written, which also keeps it stable if
-- the author later renames their profile.

alter table reviews add column if not exists author_name text;

alter table reviews drop constraint if exists reviews_author_name_length;
alter table reviews add constraint reviews_author_name_length
  check (author_name is null or char_length(author_name) <= 80);
