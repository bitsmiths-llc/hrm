-- BIT-16: Payoneer export artifacts — Module 2 / Payroll
-- Adds `payroll_exports` (one row per generated Payoneer file) + admin RLS, and
-- the private `payroll-exports` storage bucket + an admin-only object policy.
--
-- Divergences from the BIT-16 ticket text, made to fit this project as it
-- actually exists (same rationale as the leave/medical/overtime/payroll
-- migrations):
--   * The ticket's SQL calls `auth.is_admin()`; the `auth` schema is reserved
--     on this project (BIT-3), so the policy uses `public.is_admin()`.
--   * A `run_id` index is added (the admin history drill-down looks exports up
--     by run, newest first) — mirrors medical_claims_run_idx / overtime_run_idx.
--   * `run_id` is `on delete cascade` (consistent with payslips): if a run is
--     ever removed, its export rows go with it.
--   * The bucket is private with an xlsx/csv MIME allow-list and a 10 MB cap.
--     The export file is written server-side through the service-role client
--     (which bypasses RLS); the admin storage policy is what lets an admin mint
--     signed download URLs for the run-history artifact links, and — being the
--     only policy — is what keeps a non-admin out of the bucket entirely.

-- ---------------------------------------------------------------------------
-- 1. payroll_exports — an audit row per Payoneer file generated for a run.
-- ---------------------------------------------------------------------------
create table payroll_exports (
  id          uuid primary key default gen_random_uuid(),
  run_id      uuid not null references payroll_runs(id) on delete cascade,
  exported_by uuid references employees(id),
  file_path   text,
  exported_at timestamptz not null default now()
);

-- History drill-down lists a run's exports, newest first.
create index payroll_exports_run_idx on payroll_exports (run_id, exported_at desc);

alter table payroll_exports enable row level security;

-- Admins only. Employees never read export artifacts — this single policy is
-- the whole access model (negative case: a non-admin sees nothing).
create policy exports_admin
on payroll_exports
for all
using (public.is_admin())
with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 2. Private `payroll-exports` bucket at `<run_id>/payoneer-<ts>.xlsx`.
--    Written server-side (service-role, RLS-bypassing); the admin object policy
--    gates the download-link reads from history.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payroll-exports',
  'payroll-exports',
  false,
  10485760,  -- 10 MB
  array[
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ]
)
on conflict (id) do nothing;

create policy payroll_exports_admin
on storage.objects
for all
using (bucket_id = 'payroll-exports' and public.is_admin())
with check (bucket_id = 'payroll-exports' and public.is_admin());
