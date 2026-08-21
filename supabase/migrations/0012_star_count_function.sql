-- 0012_star_count_function.sql
-- Atomic increment avoids a race condition where two near-simultaneous
-- hires could both read the same starting count and one increment gets lost.
--
-- SECURITY DEFINER is required here: the actor calling this is the
-- COMPANY marking a hire, not the recommender themselves, so the existing
-- "Users can update own row" RLS policy (auth.uid() = id) would otherwise
-- block it. This function is scoped to ONLY increment star_count by 1 —
-- it can't be used to set arbitrary values or touch any other column.
create or replace function increment_star_count(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update users set star_count = star_count + 1 where id = target_user_id;
end;
$$;

grant execute on function increment_star_count(uuid) to authenticated;