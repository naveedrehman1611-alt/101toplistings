-- 0026 — one brand name, again
--
-- 0018 normalised every stored spelling to "RankYouSite", the name that matches
-- the domain (rankyousite.com). Text edited in admin since then brought the old
-- spellings back: the live Organization schema says "RankYourSite" and the home
-- description says "Rank You Site". Search engines read those as different
-- names, so this repeats 0018's renames with a pattern that also catches the
-- half-spaced forms ("RankYou Site", "Rank YouSite"), and adds blog posts.
--
-- Safe to re-run: each update only touches text that still has an old spelling.

update settings
   set value = to_jsonb(regexp_replace(value #>> '{}', 'Rank ?Your ?Site|Rank You ?Site|RankYou Site', 'RankYouSite', 'gi')),
       updated_at = now()
 where jsonb_typeof(value) = 'string'
   and value #>> '{}' ~* 'Rank ?Your ?Site|Rank You ?Site|RankYou Site';

update page_sections
   set heading    = regexp_replace(heading,    'Rank ?Your ?Site|Rank You ?Site|RankYou Site', 'RankYouSite', 'gi'),
       subheading = regexp_replace(subheading, 'Rank ?Your ?Site|Rank You ?Site|RankYou Site', 'RankYouSite', 'gi'),
       body       = regexp_replace(body,       'Rank ?Your ?Site|Rank You ?Site|RankYou Site', 'RankYouSite', 'gi'),
       cta_label  = regexp_replace(cta_label,  'Rank ?Your ?Site|Rank You ?Site|RankYou Site', 'RankYouSite', 'gi'),
       updated_at = now()
 where concat_ws(' ', heading, subheading, body, cta_label) ~* 'Rank ?Your ?Site|Rank You ?Site|RankYou Site';

update seo_meta
   set title       = regexp_replace(title,       'Rank ?Your ?Site|Rank You ?Site|RankYou Site', 'RankYouSite', 'gi'),
       description = regexp_replace(description, 'Rank ?Your ?Site|Rank You ?Site|RankYou Site', 'RankYouSite', 'gi')
 where concat_ws(' ', title, description) ~* 'Rank ?Your ?Site|Rank You ?Site|RankYou Site';

update menu_items
   set label = regexp_replace(label, 'Rank ?Your ?Site|Rank You ?Site|RankYou Site', 'RankYouSite', 'gi')
 where label ~* 'Rank ?Your ?Site|Rank You ?Site|RankYou Site';

update pages
   set title = regexp_replace(title, 'Rank ?Your ?Site|Rank You ?Site|RankYou Site', 'RankYouSite', 'gi')
 where title ~* 'Rank ?Your ?Site|Rank You ?Site|RankYou Site';

update blog_posts
   set title      = regexp_replace(title,      'Rank ?Your ?Site|Rank You ?Site|RankYou Site', 'RankYouSite', 'gi'),
       standfirst = regexp_replace(standfirst, 'Rank ?Your ?Site|Rank You ?Site|RankYou Site', 'RankYouSite', 'gi'),
       body       = regexp_replace(body,       'Rank ?Your ?Site|Rank You ?Site|RankYou Site', 'RankYouSite', 'gi')
 where concat_ws(' ', title, standfirst, body) ~* 'Rank ?Your ?Site|Rank You ?Site|RankYou Site';
