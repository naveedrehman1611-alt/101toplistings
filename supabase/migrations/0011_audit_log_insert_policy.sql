-- Found by probing RLS as a real signed-in admin before shipping: audit_logs
-- had a SELECT policy but no INSERT policy, so with RLS enabled every insert
-- was denied. The admin actions would have appeared to succeed while silently
-- recording nothing, leaving criterion 56 unmet.
--
-- Staff may append. actor_id is pinned to auth.uid() so an entry cannot be
-- attributed to someone else. There is deliberately still no UPDATE or DELETE
-- policy: an audit trail that can be rewritten is not an audit trail.
create policy audit_logs_staff_insert on audit_logs
  for insert
  with check (has_min_role('moderator') and actor_id = auth.uid());
