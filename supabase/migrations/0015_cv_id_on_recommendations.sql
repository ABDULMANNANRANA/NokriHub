-- 0015_cv_id_on_recommendations.sql
alter table recommendations
  add column if not exists cv_id uuid references cvs(id) on delete set null;