-- 0016_company_can_view_recommended_cvs.sql
create policy "Company can view CV attached to their job's recommendation" on cvs
  for select using (
    auth.uid() in (
      select j.company_id
      from recommendations r
      join jobs j on j.id = r.job_id
      where r.cv_id = cvs.id
    )
  );