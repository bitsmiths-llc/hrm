-- Wire the leave pool to payroll_settings.leave_pool_days. Mirrors the medical
-- change (m2_medical_balance_use_settings, which swapped medical_balance()'s
-- hard-coded 50000/5000 for medical_cap/medical_accrual_monthly): leave_balance()
-- still carried the bootstrap literal 22 while the admin Settings screen already
-- wrote leave_pool_days, so the setting had no effect on any balance.
--
-- Fix: read leave_pool_days from the payroll_settings singleton. coalesce(., 22)
-- preserves the old value if the row is somehow absent, so this is behaviour-
-- preserving while leave_pool_days = 22 (the seeded default). The balance is
-- still derived on every read (never stored), so an admin changing the pool
-- reflows every employee's used/remaining immediately and retroactively.
--
-- The scalar subquery sits where the literal 22 did (a constant-like expression
-- in an aggregate query with no GROUP BY, exactly as before). Signature and
-- return columns are unchanged, so no supabase types regen is needed. Grants and
-- ownership survive create-or-replace. search_path='' + public.-qualified tables
-- keeps linter 0011 satisfied, matching the original definition.

create or replace function leave_balance(
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
  )
  select
    (select pool from settings) as pool_total,
    coalesce(sum(num_days), 0) as used,
    (select pool from settings) - coalesce(sum(num_days), 0) as remaining
  from public.leave_requests
  where employee_id = p_employee
    and status = 'approved'
    and leave_type in ('paid', 'sick', 'half_day')
    and extract(year from start_date) = p_year
$$;
