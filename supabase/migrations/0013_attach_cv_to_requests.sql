-- 0013_attach_cv_to_requests.sql
alter table recommendation_requests
  add column if not exists cv_id uuid references cvs(id) on delete set null;

-- The existing cvs policy only lets the OWNER read their own CVs.
-- This adds narrow, request-scoped read access: a recommender can view
-- ONLY the specific CV that was attached to a request sent to them —
-- not any of the candidate's other CVs.
create policy "Recommender can view CV attached to their request" on cvs
  for select using (
    auth.uid() in (
      select recommender_id from recommendation_requests
      where recommendation_requests.cv_id = cvs.id
    )
  );