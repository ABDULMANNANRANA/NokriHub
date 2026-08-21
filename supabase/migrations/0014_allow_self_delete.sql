-- 0014_allow_self_delete.sql
-- No delete policy existed on users before this — RLS blocks all deletes
-- by default without an explicit permissive policy. This lets a user
-- delete ONLY their own row. Every dependent table (cvs, jobs, connections,
-- recommendation_requests, recommendations) already has
-- "on delete cascade" on its user foreign keys, so this one delete
-- cleans up everything tied to that account.
create policy "Users can delete own row" on users
  for delete using (auth.uid() = id);