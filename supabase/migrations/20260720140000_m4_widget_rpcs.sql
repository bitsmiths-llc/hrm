-- BIT-19: Dashboard widget RPCs — payroll cycle cost + all-employee leave balances.
--
-- Two admin-only aggregations for the admin home (/admin). Both are thin roll-ups
-- over canonical sources — they never recompute pay or re-derive a balance:
--   * payroll_cycle_cost() sums the frozen payslip snapshots for a run (M2.4).
--   * leave_balances_all() maps the canonical leave_balance() (M2.1) over every
--     active employee in ONE call, so its numbers match the per-employee widget.
--
-- Both are cross-employee reads that RLS would deny, so both are `security
-- definer` (bypassing RLS) and therefore assert public.is_admin() themselves,
-- raising 42501 for non-admins — the same top-guard pattern as the M4 dashboard
-- RPCs (20260720120000). The `auth` schema is reserved on this project (BIT-3),
-- so the guard is public.is_admin(), never auth.is_admin().

-- ---------------------------------------------------------------------------
-- 1. payroll_cycle_cost(run_id) — total cost of one payroll run, as whole PKR.
--    Sums payslips.total_pay (integer, frozen at run time) and never touches the
--    pay engine. Returns 0 for a run with no payslips.
-- ---------------------------------------------------------------------------
create or replace function payroll_cycle_cost(run_id uuid)
returns int
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_total int;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select coalesce(sum(p.total_pay), 0)::int
    into v_total
    from payslips p
   where p.payroll_run_id = run_id;

  return v_total;
end;
$$;
revoke all on function payroll_cycle_cost(uuid) from public, anon;
grant execute on function payroll_cycle_cost(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 2. leave_balances_all(year) — one row per active employee wrapping the
--    canonical leave_balance() RPC for the given year. used/remaining are kept
--    `numeric` (not cast to int) so half-days (num_days 0.5) survive and the
--    figures equal the per-employee leave_balance() exactly; pool is int.
--    leave_balance() is security invoker but runs here with the definer's
--    privileges (past RLS) — exactly as employees_near_medical_cap() wraps
--    medical_balance() — so this reads every active employee's balance.
-- ---------------------------------------------------------------------------
create or replace function leave_balances_all(
  year int default extract(year from now())::int
)
returns table (
  employee_id uuid,
  full_name   text,
  remaining   numeric,
  used        numeric,
  pool        int
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  return query
    select e.id, e.full_name, (lb).remaining, (lb).used, (lb).pool_total
      from employees e,
           lateral leave_balance(e.id, year) lb
     where e.account_status = 'active'
     order by e.full_name;
end;
$$;
revoke all on function leave_balances_all(int) from public, anon;
grant execute on function leave_balances_all(int) to authenticated;
