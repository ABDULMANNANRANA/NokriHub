-- 0011_job_status.sql
alter table jobs add column if not exists status text not null default 'open'
  check (status in ('open', 'closed'));