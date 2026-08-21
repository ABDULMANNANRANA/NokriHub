-- 0004_connections.sql
create table if not exists connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references users(id) on delete cascade,
  addressee_id uuid not null references users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  unique (requester_id, addressee_id)
);

alter table connections enable row level security;

create policy "Users see connections involving them" on connections
  for select using (auth.uid() = requester_id or auth.uid() = addressee_id);

create policy "Users can send connection requests" on connections
  for insert with check (auth.uid() = requester_id);

create policy "Addressee can respond to a request" on connections
  for update using (auth.uid() = addressee_id);