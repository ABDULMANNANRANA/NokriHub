-- 0005_recommendation_requests.sql
create table if not exists recommendation_requests (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  candidate_id uuid not null references users(id) on delete cascade,
  recommender_id uuid not null references users(id) on delete cascade,
  -- 'candidate'  = candidate asked the recommender ("Request a recommendation")
  -- 'recommender' = recommender proactively offered ("Recommend someone")
  requested_by text not null check (requested_by in ('candidate', 'recommender')),
  note text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  check (candidate_id <> recommender_id)
);

alter table recommendation_requests enable row level security;

create policy "Involved users can view" on recommendation_requests
  for select using (auth.uid() = candidate_id or auth.uid() = recommender_id);

-- only the initiating side can create it
create policy "Initiator can create" on recommendation_requests
  for insert with check (
    (requested_by = 'candidate' and auth.uid() = candidate_id) or
    (requested_by = 'recommender' and auth.uid() = recommender_id)
  );

-- only the OTHER side (the one being asked/offered to) can accept or decline
create policy "Target can respond" on recommendation_requests
  for update using (
    (requested_by = 'candidate' and auth.uid() = recommender_id) or
    (requested_by = 'recommender' and auth.uid() = candidate_id)
  );