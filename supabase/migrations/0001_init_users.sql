-- 0001_init_users.sql
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('candidate', 'company-admin')),
  linkedin_id text,
  name text,
  headline text,
  photo_url text,
  star_count int not null default 0,
  created_at timestamptz not null default now()
);

alter table users enable row level security;

-- temporary permissive policies for development — tighten in 0007
create policy "Users can view own row" on users
  for select using (auth.uid() = id);

create policy "Users can insert own row" on users
  for insert with check (auth.uid() = id);

create policy "Users can update own row" on users
  for update using (auth.uid() = id);