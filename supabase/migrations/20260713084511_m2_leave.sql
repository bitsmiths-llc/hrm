-- BIT-12: Leave (request, balance, approvals) — Module 2 / Payroll
-- Adds the leave_type / request_status enums, the leave_requests table + RLS,
-- and the canonical leave_balance() RPC.
--
-- Admin notification on submit and the approve/reject decision email to the
-- employee are handled in the server actions (supabaseAdmin + Resend), mirroring
-- onboarding's notifyAdminsOfSubmission — so there is deliberately NO pg_net
-- extension / Edge Function / trigger here.
--
-- is_admin(): the `auth` schema is reserved on this project (see BIT-3), so RLS
-- references public.is_admin(), not auth.is_admin().

-- ---------------------------------------------------------------------------
-- 1. Enums (shared across leave and — later — medical/overtime request types)
-- ---------------------------------------------------------------------------
create type leave_type as enum ('paid', 'sick', 'unpaid', 'half_day');
create type request_status as enum ('pending', 'approved', 'rejected');

-- ---------------------------------------------------------------------------
-- 2. leave_requests
--    num_days is numeric(4,1) so a Half Day stores exactly 0.5. rejection_reason
--    is populated only when an admin rejects (surfaced in the decision email and
--    the employee's history UI).
-- ---------------------------------------------------------------------------
create table leave_requests (
  id              uuid primary key default gen_random_uuid(),
  employee_id     uuid not null references employees(id) on delete cascade,
  leave_type      leave_type not null,
  reason          text not null,
  start_date      date not null,
  num_days        numeric(4, 1) not null,
  status          request_status not null default 'pending',
  rejection_reason text,
  reviewed_by     uuid references employees(id),
  reviewed_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Supports both the balance sum (employee_id + status + year-of start_date) and
-- the admin pending queue.
create index leave_requests_employee_idx
  on leave_requests (employee_id, status, start_date);

-- 3. updated_at trigger (reuses the shared set_updated_at() from BIT-3)
create trigger trg_leave_updated
before update on leave_requests
for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. RLS
--    - employees read/insert only their own rows, and the insert is pinned to
--      status = 'pending' so an employee can never self-approve.
--    - admins do everything (public.is_admin() reads the JWT app_metadata.role).
-- ---------------------------------------------------------------------------
alter table leave_requests enable row level security;

create policy leave_select_own
on leave_requests
for select
using (employee_id = auth.uid());

create policy leave_insert_own
on leave_requests
for insert
with check (employee_id = auth.uid() and status = 'pending');

create policy leave_admin_all
on leave_requests
for all
using (public.is_admin())
with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 5. leave_balance() — the single source of truth for the pool.
--    SECURITY INVOKER (default) so the inner select is subject to RLS: an
--    employee resolves their own balance, an admin can resolve anyone's.
--    Balance is derived on every read (never stored) so it can't drift on a
--    retroactive approval/rejection. Unpaid is excluded by design — it never
--    enters the pool. pool_total is a literal 22 for now (bootstrap default);
--    production replaces it with payroll_settings.leave_pool_days (M2.4).
--    search_path='' + public.-qualified table satisfies linter 0011.
-- ---------------------------------------------------------------------------
create or replace function leave_balance(
  p_employee uuid,
  p_year int default extract(year from now())::int
)
returns table (pool_total int, used numeric, remaining numeric)
language sql
stable
set search_path = ''
as $$
  select
    22 as pool_total,
    coalesce(sum(num_days), 0) as used,
    22 - coalesce(sum(num_days), 0) as remaining
  from public.leave_requests
  where employee_id = p_employee
    and status = 'approved'
    and leave_type in ('paid', 'sick', 'half_day')
    and extract(year from start_date) = p_year
$$;
