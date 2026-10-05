-- The init policies used (true) with no role, which granted the anon key full
-- read and write on applicant names and emails. The API routes use the
-- service role, which bypasses RLS, so no policy is needed for the forms.
-- Applied to project qnfvdlyhhlwccwhcrgcl on 2026-10-04.
drop policy if exists "service role full access on applications" on public.applications;
drop policy if exists "service role full access on partnerships" on public.partnerships;
drop policy if exists "service role full access on email_signups" on public.email_signups;
revoke all on public.applications, public.partnerships, public.email_signups from anon, authenticated;
