-- 0009_pipeline_and_hires.sql

-- track where each recommendation sits in the company's hiring pipeline
alter table recommendations
  add column if not exists status text not null default 'new'
  check (status in ('new', 'reviewed', 'hired', 'rejected'));

-- companies need to be able to move status forward — no update policy existed before
create policy "Company can update status of own job's recommendations" on recommendations
  for update using (
    auth.uid() in (select company_id from jobs where jobs.id = recommendations.job_id)
  );

-- outcome records — this is what Phase 2's star calculation will eventually read
create table if not exists hires (
  id uuid primary key default gen_random_uuid(),
  recommendation_id uuid not null references recommendations(id) on delete cascade,
  job_id uuid not null references jobs(id) on delete cascade,
  hired_at timestamptz not null default now()
);

alter table hires enable row level security;

create policy "Involved parties can view hires" on hires
  for select using (
    auth.uid() in (select company_id from jobs where jobs.id = hires.job_id)
    or auth.uid() in (select candidate_id from recommendations where recommendations.id = hires.recommendation_id)
    or auth.uid() in (select recommender_id from recommendations where recommendations.id = hires.recommendation_id)
  );

create policy "Company can record a hire for own job" on hires
  for insert with check (
    auth.uid() in (select company_id from jobs where jobs.id = hires.job_id)
  );