-- 0003_jobs.sql
create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references users(id) on delete cascade,
  title text not null,
  description text,
  skills text[] not null default '{}',
  location text,
  employment_type text,
  salary_band text,
  created_at timestamptz not null default now()
);

alter table jobs enable row level security;

-- anyone logged in can browse jobs (candidates need this for the Feed)
create policy "Any authenticated user can view jobs" on jobs
  for select using (auth.role() = 'authenticated');

-- only the owning company can create/edit/delete their own jobs
create policy "Companies manage own jobs" on jobs
  for all using (auth.uid() = company_id)
  with check (auth.uid() = company_id);