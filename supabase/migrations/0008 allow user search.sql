-- 0008_allow_user_search.sql
-- The original policy from 0001 only let a user read their own row, which
-- silently breaks Network search (candidates need to find OTHER candidates).
-- This adds a second, more permissive select policy — Postgres OR's
-- multiple policies for the same command together, so this effectively
-- opens read access to any logged-in user searching for connections.
create policy "Authenticated users can search other users" on users
  for select using (auth.role() = 'authenticated');