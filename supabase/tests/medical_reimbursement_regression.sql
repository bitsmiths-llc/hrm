-- Regression test for the medical-reimbursement double-subtraction bug
-- (fixed in 20260717120000_m2_medical_reimbursement_fix.sql).
--
-- Proves: an approved 40,000 claim against a full 50,000 pool is reimbursed in
-- FULL by calculate_payroll (medical = 40,000), not the pre-fix 10,000 that the
-- least(claims_sum, available) cap produced.
--
-- This repo has no DB test harness wired into CI (vitest is browser/Storybook
-- only, and there is no pgTAP), so this is a standalone verification script, NOT
-- an auto-run unit test. Run it against a database that already has all
-- migrations applied (a local `supabase start` stack or a throwaway branch):
--
--     supabase db execute --file supabase/tests/medical_reimbursement_regression.sql
--     -- or:  psql "$DATABASE_URL" -f supabase/tests/medical_reimbursement_regression.sql
--
-- Everything runs inside a transaction that ROLLS BACK, so it never leaves data
-- behind. It raises an exception (non-zero exit) on failure and NOTICE 'PASS' on
-- success. Uses explicit `raise exception` rather than `assert` so it fails loudly
-- regardless of the plpgsql.check_asserts setting.
--
-- NOTE: employees.id references auth.users(id) (FK added by the migration
-- `cascade_delete_employees_from_auth_users`, which exists on the DB but has NO
-- local migration file), so the fixture seeds an auth.users row first. Both are
-- rolled back.

begin;

-- Deterministic settings: no tax / no OT multiplier noise in the assertions.
update payroll_settings set tax_rate_percent = 0, ot_multiplier_default = 1.00 where id = true;

do $$
declare
  v_emp     uuid := gen_random_uuid();
  v_run     uuid;
  v_month   date := date_trunc('month', now())::date;
  v_accrued integer;
  v_medical integer;
  v_total   integer;
begin
  -- Act as an admin for the whole block: satisfies calculate_payroll's
  -- is_admin() guard and every admin RLS policy on the seed inserts.
  perform set_config('request.jwt.claims', '{"app_metadata":{"role":"admin"}}', true);

  -- employees.id references auth.users(id), so seed the auth user first.
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, created_at, updated_at)
  values (v_emp, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
          'reg-' || v_emp || '@example.test', '', now(), now());

  -- 13 months of tenure -> accrual is capped at the full 50,000 pool.
  insert into employees (id, role, account_status, email, full_name, activated_at)
  values (v_emp, 'employee', 'active',
          'reg-' || v_emp || '@example.test', 'Reimbursement Regression',
          now() - interval '13 months');

  insert into employment_details (employee_id, employment_type, base_salary, working_hours)
  values (v_emp, 'full_time', 100000, 160);

  -- One large, already-approved, unswept claim dated in the run's month.
  insert into medical_claims (employee_id, claim_for, service_type, description,
                              amount, expense_date, status)
  values (v_emp, 'self', 'hospitalization',
          'Regression: single large claim against a full pool', 40000, v_month, 'approved');

  -- Payroll run for the current month (actual number of days in the month).
  insert into payroll_runs (period_month, days_in_month)
  values (v_month,
          extract(day from (date_trunc('month', now()) + interval '1 month' - interval '1 day'))::int)
  returning id into v_run;

  -- Guard the fixture itself: if the accrual math ever changes, fail here with a
  -- clear message instead of a confusing downstream assertion.
  select accrued into v_accrued from medical_balance(v_emp);
  if v_accrued is distinct from 50000 then
    raise exception 'FIXTURE ERROR: expected accrued = 50000 for a 13-month employee, got %', v_accrued;
  end if;

  -- Run the engine and read back the frozen payslip line.
  perform calculate_payroll(v_run);

  select medical, total_pay into v_medical, v_total
    from payslips where payroll_run_id = v_run and employee_id = v_emp;

  -- The fix: full reimbursement. Pre-fix this was least(40000, 50000-40000) = 10000.
  if v_medical is distinct from 40000 then
    raise exception
      'FAIL: expected medical = 40000 (full approved claim), got %. Double-subtraction regression is back.',
      v_medical;
  end if;

  -- total_pay = total_base (100000 * full month / full month) + medical (40000).
  if v_total is distinct from 140000 then
    raise exception 'FAIL: expected total_pay = 140000 (100000 base + 40000 medical), got %', v_total;
  end if;

  raise notice 'PASS: 40,000 claim against a 50,000 pool reimbursed in full (medical=%, total_pay=%)',
    v_medical, v_total;
end $$;

rollback;
