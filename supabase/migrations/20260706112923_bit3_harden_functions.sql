-- BIT-3 follow-up: resolve Supabase security-linter warnings on the functions
-- introduced by 20260706103204_bit3_database_schemas.sql (lints 0011, 0028, 0029).

-- 1. Pin search_path. Each body already schema-qualifies every referenced object
--    (auth.jwt(), public.is_admin(), pg_catalog now()), so '' is safe.
alter function public.set_updated_at() set search_path = '';
alter function public.is_admin() set search_path = '';
alter function public.guard_employee_columns() set search_path = '';

-- 2. Trigger functions are invoked only by their triggers, never by API clients.
--    Remove the default PUBLIC EXECUTE so they are not exposed as PostgREST RPC
--    endpoints (mirror_role_to_jwt is SECURITY DEFINER — the important one).
--    is_admin() is intentionally left executable: RLS policies call it as the
--    querying (anon/authenticated) role.
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.mirror_role_to_jwt() from public, anon, authenticated;
revoke execute on function public.guard_employee_columns() from public, anon, authenticated;
