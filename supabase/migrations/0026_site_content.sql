-- 0026 — site content overrides
--
-- Every piece of copy, every link and every image on the public pages has a
-- default in code (src/lib/content/pages/*.ts). A row here overrides one
-- section of one page: `key` is "<page>.<section>", such as "home.hero", and
-- `data` holds the edited field values. Deleting a row restores the defaults,
-- so the site renders the same with this table empty as it did before it
-- existed. The field schema lives in code, not here, so the app validates
-- every write and drops anything it does not recognise on read.
--
-- Safe to re-run.

create table if not exists site_content (
  key        text primary key check (key ~ '^[a-z0-9_-]+\.[a-z0-9_-]+$'),
  data       jsonb not null default '{}'::jsonb,
  is_enabled boolean not null default true,
  updated_by uuid references profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table site_content enable row level security;

-- World-readable: the public pages render it. Editors and above may change it,
-- the same as the SEO manager.
drop policy if exists site_content_public_read on site_content;
create policy site_content_public_read on site_content for select using (true);

drop policy if exists site_content_editor_write on site_content;
create policy site_content_editor_write on site_content
  for all using (has_min_role('editor')) with check (has_min_role('editor'));
