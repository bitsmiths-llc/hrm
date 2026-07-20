-- Per-employee leave + medical allowance overrides (admin → Employees → detail →
-- Profile → Employment & Payroll Configuration).
--
-- Until now leave_pool_days / medical_accrual_monthly / medical_cap were global
-- only: every employee shared the payroll_settings singleton. This adds nullable
-- per-employee override columns and teaches the two balance RPCs to resolve
-- coalesce(override, global, baseline). NULL means "inherit the global" -- it is
-- NOT the same as 0, which is a real override meaning "no allowance at all".
--
-- Shape follows the ot_multiplier_override precedent already on this table (a
-- nullable column resolved with coalesce(override, default) inside the payroll
-- functions), so per-employee config stays on the employment_details satellite
-- rather than in a new table. RLS needs no change: employment_read_own already
-- lets an employee read their own row (so the SECURITY INVOKER balance RPCs can
-- resolve their override) and employment_admin gates writes to admins.
--
-- DEPLOY IMPACT: every override lands NULL, so every employee keeps resolving to
-- the current global value. No existing balance changes on deploy.
--
-- BEHAVIOURAL NOTE (inherited from the global settings, intended): both balances
-- are derived on every read and never stored, so setting an override is
-- RETROACTIVE for that employee exactly as a settings change is retroactive for
-- everyone -- it re-prices their whole history, not just future accrual. Lowering
-- one employee's medical cap below their already-approved spend drops their
-- `available` to 0. Already-*paid* claims are unaffected (payroll pays claims_sum
-- in full, and locked payslips are frozen).

-- 1. The override columns. Nullable = inherit. The CHECK mirrors the app-side
--    schema and the existing payroll_settings_medical_nonneg / leave_pool_days
--    backstops, so a direct or bypassed write can't poison a pool. No `not valid`
--    needed: every existing row gets NULL, which passes.
alter table employment_details
  add column if not exists leave_pool_days_override         integer,
  add column if not exists medical_accrual_monthly_override integer,
  add column if not exists medical_cap_override             integer;

alter table employment_details
  drop constraint if exists employment_details_allowance_overrides_nonneg;

alter table employment_details
  add constraint employment_details_allowance_overrides_nonneg
    check (
      (leave_pool_days_override is null or leave_pool_days_override >= 0)
      and (medical_accrual_monthly_override is null
           or medical_accrual_monthly_override >= 0)
      and (medical_cap_override is null or medical_cap_override >= 0)
    );

comment on column employment_details.leave_pool_days_override is
  'Per-employee annual leave pool in days. NULL = inherit payroll_settings.leave_pool_days.';
comment on column employment_details.medical_accrual_monthly_override is
  'Per-employee medical monthly accrual in PKR. NULL = inherit payroll_settings.medical_accrual_monthly.';
comment on column employment_details.medical_cap_override is
  'Per-employee medical balance cap in PKR. NULL = inherit payroll_settings.medical_cap.';

-- 2. leave_balance() resolves the pool per employee. The scalar subquery over
--    employment_details yields NULL both when the employee has no override and
--    when they have no employment_details row at all (a not-yet-onboarded
--    invitee), so either way coalesce falls through to the global. Signature and
--    return columns are unchanged, so create-or-replace keeps grants/ownership
--    and no types regen is needed for this one.
create or replace function public.leave_balance(
  p_employee uuid,
  p_year int default extract(year from now())::int
)
returns table (pool_total int, used numeric, remaining numeric)
language sql
stable
set search_path = ''
as $$
  with settings as (
    select coalesce(max(leave_pool_days), 22) as pool
    from public.payroll_settings
    where id = true
  ),
  resolved as (
    select coalesce(
      (select leave_pool_days_override
         from public.employment_details
        where employee_id = p_employee),
      (select pool from settings)
    ) as pool
  )
  select
    (select pool from resolved) as pool_total,
    coalesce(sum(num_days), 0) as used,
    (select pool from resolved) - coalesce(sum(num_days), 0) as remaining
  from public.leave_requests
  where employee_id = p_employee
    and status = 'approved'
    and leave_type in ('paid', 'sick', 'half_day')
    and extract(year from start_date) = p_year
$$;

-- 3. medical_balance() resolves cap + monthly accrual per employee, and now also
--    RETURNS them. Returning them is the point: the cap/accrual the UI displays
--    must be the same pair the accrual math used. They were previously merged in
--    client-side from the global settings (hooks/queries/medical.ts), which is
--    exactly the "settings that looked global but changed nothing an employee
--    could actually claim" class of bug that m2_medical_balance_use_settings
--    fixed -- an overridden employee would have seen the global cap beside an
--    overridden `accrued`.
--
--    Changing the OUT columns needs a drop first (create-or-replace cannot alter
--    a return type). Safe to drop: no other SQL function calls this one --
--    calculate_payroll only mentions it in a comment, having stopped capping
--    against it in m2_medical_reimbursement_fix. The drop loses the implicit
--    grant from Supabase's default privileges, so it's re-granted explicitly
--    below rather than left to chance.
--
--    The nested coalesce keeps the defensive property the original called out:
--    resolved.cap can never be NULL (override → global → 50000 baseline), so
--    least() can never silently drop the cap and accrue without bound.
drop function if exists public.medical_balance(uuid);

create function public.medical_balance(p_employee uuid)
returns table (
  accrued         int,
  spent           int,
  available       int,
  cap             int,
  monthly_accrual int
)
language sql
stable
set search_path = ''
as $$
  with settings as (
    select
      coalesce(max(medical_cap), 50000)            as cap,
      coalesce(max(medical_accrual_monthly), 5000) as monthly
    from public.payroll_settings
    where id = true
  ),
  overrides as (
    select medical_cap_override             as cap,
           medical_accrual_monthly_override as monthly
    from public.employment_details
    where employee_id = p_employee
  ),
  resolved as (
    select
      coalesce((select cap from overrides), (select cap from settings))         as cap,
      coalesce((select monthly from overrides), (select monthly from settings)) as monthly
  ),
  joined as (
    select coalesce(activated_at, created_at) as start_at
    from public.employees
    where id = p_employee
  ),
  months as (
    select greatest(
      0,
      (extract(year  from age(now(), (select start_at from joined))) * 12
     + extract(month from age(now(), (select start_at from joined))))::int
    ) as m
  ),
  acc as (
    select least(
      (select cap from resolved),
      (select monthly from resolved) * (select m from months)
    )::int as accrued
  ),
  spend as (
    select coalesce(sum(amount), 0)::int as spent
    from public.medical_claims
    where employee_id = p_employee and status = 'approved'
  )
  select
    (select accrued from acc)::int,
    (select spent from spend)::int,
    greatest(0, (select accrued from acc) - (select spent from spend))::int,
    (select cap from resolved)::int,
    (select monthly from resolved)::int
$$;

grant execute on function public.medical_balance(uuid) to authenticated;
