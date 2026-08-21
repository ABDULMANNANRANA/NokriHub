-- 0006_recommendations.sql
create table if not exists recommendations (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references recommendation_requests(id) on delete set null,
  job_id uuid not null references jobs(id) on delete cascade,
  candidate_id uuid not null references users(id) on delete cascade,
  recommender_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table recommendations enable row level security;

-- candidate, recommender, and the job's owning company can all see it
create policy "Involved parties can view" on recommendations
  for select using (
    auth.uid() = candidate_id
    or auth.uid() = recommender_id
    or auth.uid() in (select company_id from jobs where jobs.id = recommendations.job_id)
  );

-- created only as the result of an accepted request (see respondToRequest in the service)
create policy "Candidate or recommender can insert" on recommendations
  for insert with check (auth.uid() = recommender_id or auth.uid() = candidate_id);