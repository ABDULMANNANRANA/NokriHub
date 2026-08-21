-- 0007_add_email_to_users.sql
alter table users add column if not exists email text;