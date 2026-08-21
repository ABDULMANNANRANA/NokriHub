-- 0002_cvs.sql
create table if not exists cvs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  template_id text not null,
  data jsonb not null default '{}'::jsonb,
  pdf_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table cvs enable row level security;

create policy "Users manage own CVs" on cvs
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);