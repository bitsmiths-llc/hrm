-- BIT-15 fix: employees could never see their own locked payslips.
--
-- `payslip_own_locked` gated visibility on
--   exists (select 1 from payroll_runs r where r.id = payroll_run_id and r.status = 'locked')
-- but `payroll_runs` is admin-only-select (`runs_admin_all`). An RLS policy's
-- subquery runs with the *querying* role's privileges, so for a non-admin that
-- subquery always returns zero rows → the payslip stayed hidden even after lock.
--
-- Fix: check the run's lock status through a SECURITY DEFINER helper that bypasses
-- `payroll_runs` RLS. It leaks nothing (a boolean for a run id you must already
-- know) — unlike opening `payroll_runs` to employees, which would expose
-- company-wide `total_payroll` / `locked_by`.

create or replace function public.run_is_locked(p_run_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from payroll_runs where id = p_run_id and status = 'locked'
  )
$$;

-- Callable by both roles so the policy evaluates cleanly for anyone hitting the
-- payslips endpoint (anon still matches no rows via employee_id = auth.uid()).
grant execute on function public.run_is_locked(uuid) to authenticated, anon;

drop policy payslip_own_locked on payslips;
create policy payslip_own_locked
on payslips
for select
using (employee_id = auth.uid() and public.run_is_locked(payroll_run_id));
