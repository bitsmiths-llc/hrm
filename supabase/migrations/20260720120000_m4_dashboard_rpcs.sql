-- BIT-17: Dashboard aggregation RPCs for the admin home (/admin).
--
-- Three aggregation primitives that read org-wide counts across employees.
-- All are `security definer` (they must aggregate past the caller's RLS), so
-- each asserts public.is_admin() itself and raises 42501 for non-admins — the
-- same top-guard pattern as calculate_payroll/lock_payroll (BIT-15). Without it,
-- any authenticated employee could read org-wide counts.
--
-- Convention (matches the M2 definer RPCs): language plpgsql, security definer,
-- set search_path = public, public.is_admin() guard, then
-- `revoke all ... from public, anon; grant execute ... to authenticated`. The
-- `auth` schema is reserved on this project (BIT-3) so the guard is
-- public.is_admin(), never auth.is_admin().

-- ---------------------------------------------------------------------------
-- 1. dashboard_summary() — one jsonb bundle for the admin home. Six keys; the
--    UI derives combined-pending client-side from this single payload rather
--    than issuing four count queries. payroll_cycle is the latest run's status,
--    null when payroll_runs is empty.
-- ---------------------------------------------------------------------------
create or replace function dashboard_summary()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'pending_leave',      (select count(*) from leave_requests where status = 'pending'),
    'pending_medical',    (select count(*) from medical_claims where status = 'pending'),
    'pending_overtime',   (select count(*) from overtime_logs  where status = 'pending'),
    'pending_onboarding', (select count(*) from employees      where account_status = 'submitted'),
    'active_employees',   (select count(*) from employees      where account_status = 'active'),
    'payroll_cycle',      (select status from payroll_runs order by period_month desc limit 1)
  );
end;
$$;
revoke all on function dashboard_summary() from public, anon;
grant execute on function dashboard_summary() to authenticated;

-- ---------------------------------------------------------------------------
-- 2. employees_by_status() — one row per account_status with its count. Rows
--    sum to the total employee count; only statuses actually present appear.
-- ---------------------------------------------------------------------------
create or replace function employees_by_status()
returns table (status text, count int)
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
    select e.account_status::text, count(*)::int
    from employees e
    group by e.account_status;
end;
$$;
revoke all on function employees_by_status() from public, anon;
grant execute on function employees_by_status() to authenticated;

-- ---------------------------------------------------------------------------
-- 3. employees_near_medical_cap(threshold) — active employees whose medical
--    spend has reached `threshold` (default 45000 PKR), via lateral
--    medical_balance(). medical_balance() is security invoker, but runs here
--    with the definer's privileges (bypassing RLS) exactly as it does inside
--    calculate_payroll — so this reads every active employee's spend. Shipped
--    as a primitive for a later "near cap" surface; no UI consumes it yet.
-- ---------------------------------------------------------------------------
create or replace function employees_near_medical_cap(threshold int default 45000)
returns table (employee_id uuid, full_name text, spent int)
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
    select e.id, e.full_name, (mb).spent
    from employees e, lateral medical_balance(e.id) mb
    where e.account_status = 'active' and (mb).spent >= threshold;
end;
$$;
revoke all on function employees_near_medical_cap(int) from public, anon;
grant execute on function employees_near_medical_cap(int) to authenticated;
