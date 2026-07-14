-- BIT-14: Overtime (logging & approvals) + Projects — Module 2 / Payroll
-- Adds the admin-managed `projects` lookup and the `overtime_logs` table + RLS.
-- Only approved hours ever feed payroll; pay itself is resolved at run time
-- (M2.4), so this table deliberately has NO rate or pay columns.
--
-- Divergences from the BIT-14 ticket text, made to fit this project as it
-- actually exists (same rationale as the leave/BIT-12 and medical/BIT-13
-- migrations):
--   * request_status already exists (created by m2_leave) — not recreated.
--   * RLS references public.is_admin() / auth.uid(); the `auth` schema is
--     reserved on this project (BIT-3), so there is no auth.is_admin().
--   * Admin-notify-on-submit and the approve/reject decision email are handled
--     in the server actions (supabaseAdmin + Resend), mirroring leave/medical —
--     this project has no pg_net extension and no notify-admins Edge Function,
--     so there is deliberately NO pg_net trigger here.
--   * overtime_logs.project_id is a hard FK to projects(id) (the ticket's
--     optional FK variant), not a free-text project column.
--   * The reject-reason column is named rejection_reason to match leave/medical
--     and the shared OvertimeLog type / StatusCell (the ticket calls it
--     reject_reason).
--   * payroll_run_id is a bare uuid for now; its FK to payroll_runs is wired in
--     a later payroll migration (do not reference payroll_runs here).

-- ---------------------------------------------------------------------------
-- 1. projects — admin-managed lookup that feeds the overtime dropdown.
--    "Remove" is a soft delete (is_active = false) so historical overtime logs
--    keep resolving through their FK even after a project is retired.
-- ---------------------------------------------------------------------------
create table projects (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_projects_updated
before update on projects
for each row execute function set_updated_at();

alter table projects enable row level security;

-- Any authenticated user reads the list (the overtime dropdown); only admins
-- create or (soft-)deactivate projects.
create policy projects_select_authenticated
on projects
for select
to authenticated
using (true);

create policy projects_insert_admin
on projects
for insert
with check (public.is_admin());

create policy projects_update_admin
on projects
for update
using (public.is_admin())
with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 2. overtime_logs
--    hours is numeric(5,2) so 2.5 stores exactly; a positive check backstops
--    the Zod rule (0 / negative fails). rejection_reason is populated only when
--    an admin rejects (surfaced in the decision email + the employee's history).
--    payroll_run_id stays NULL until a payroll lock sweeps the log (M2.4); the
--    engine picks up only approved, previously-unswept logs.
-- ---------------------------------------------------------------------------
create table overtime_logs (
  id               uuid primary key default gen_random_uuid(),
  employee_id      uuid not null references employees(id) on delete cascade,
  work_date        date not null,
  hours            numeric(5, 2) not null check (hours > 0),
  project_id       uuid not null references projects(id),
  task             text not null,
  status           request_status not null default 'pending',
  rejection_reason text,
  reviewed_by      uuid references employees(id),
  reviewed_at      timestamptz,
  payroll_run_id   uuid,                                  -- FK added in M2.4
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Own-history reads (employee_id + work_date) and the approved-hours payroll
-- sweep (employee_id + status).
create index overtime_logs_employee_idx
  on overtime_logs (employee_id, status, work_date);

-- Partial index for the admin pending queue, newest first.
create index overtime_logs_pending_idx
  on overtime_logs (created_at) where status = 'pending';

create trigger trg_overtime_updated
before update on overtime_logs
for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- 3. RLS
--    - employees read/insert only their own logs, and the insert is pinned to
--      status = 'pending' so an employee can never self-approve.
--    - admins do everything (public.is_admin() reads the JWT app_metadata.role).
-- ---------------------------------------------------------------------------
alter table overtime_logs enable row level security;

create policy overtime_select_own
on overtime_logs
for select
using (employee_id = auth.uid());

create policy overtime_insert_own
on overtime_logs
for insert
with check (employee_id = auth.uid() and status = 'pending');

create policy overtime_admin_all
on overtime_logs
for all
using (public.is_admin())
with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 4. Seed the initial project list so the overtime dropdown isn't empty.
--    (Previously the app's mock projects; admins manage the list from Settings.)
-- ---------------------------------------------------------------------------
insert into projects (name) values
  ('HRM Frontend'),
  ('Client API'),
  ('Design System'),
  ('Client Website Redesign')
on conflict (name) do nothing;
