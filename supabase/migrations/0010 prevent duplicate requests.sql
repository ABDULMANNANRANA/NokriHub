-- 0010_prevent_duplicate_requests.sql
-- A candidate/recommender pair can only have ONE pending request per job
-- at a time. This is enforced at the database level so it can't be
-- bypassed by a bug or a race condition in the app — only 'pending'
-- rows are constrained, so a new request is allowed again after a
-- previous one was accepted or declined.
create unique index if not exists idx_unique_pending_request
  on recommendation_requests (job_id, candidate_id, recommender_id)
  where status = 'pending';