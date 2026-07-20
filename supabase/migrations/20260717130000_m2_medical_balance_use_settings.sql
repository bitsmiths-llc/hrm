-- BIT-13/BIT-15 fix: make medical_balance() honor the admin-configured pool
-- (payroll_settings.medical_cap / medical_accrual_monthly) instead of the
-- hardcoded 5,000 / 50,000 bootstrap literals.
--
-- Until now the "5000/50000" lived in two disconnected places: the RPC used
-- literals, while the admin Settings screen wrote payroll_settings values that
-- only fed the balance-card HINT text. Changing the settings therefore looked
-- global but changed nothing an employee could actually claim (the 20260713150100
-- comment flagged this as the deferred "M2.4" wiring). This lands that wiring, so
-- the settings, the balance math, and the approval gate finally agree.
--
-- DEPLOY IMPACT: the live settings row is still (5000, 50000) = the old literals,
-- so this changes NO existing balance on deploy. It only makes future settings
-- edits take real effect.
--
-- BEHAVIOURAL NOTE (intended, not a bug): because accrued is derived on every read
-- as `tenure_months x monthly_accrual` (capped), a settings change is GLOBAL and
-- RETROACTIVE -- it instantly re-prices every employee's whole history, not just
-- future accrual. Lowering the cap can drop an employee's `available` to 0 if they
-- have already-approved spend above the new cap; raising it grants headroom
-- immediately. Already-*paid* claims are unaffected (payroll pays claims_sum in
-- full, and locked payslips are frozen).
--
-- Edge cases integrated below:
--   * Missing settings row -> fall back to the 5000/50000 baseline. `max()` over
--     the id=true singleton always yields one row (NULL if absent), and coalesce
--     turns that NULL into the baseline -- WITHOUT it, least(NULL, x) = x would
--     silently DROP the cap and accrue without bound.
--   * Non-existent employee -> months resolves to 0 (greatest(0, NULL)=0), so
--     accrued=0 (unchanged from before).
--   * Negative settings -> a DB CHECK backstops the app's own nonneg validation.

-- 1. Guard the now load-bearing settings values. Both the form and the action
--    schemas already reject negatives (schema/settings.ts, schema/payroll.ts); this
--    mirrors that in the DB so a direct/bypassed write can't poison the pool. The
--    live row (5000, 50000) satisfies it, so it validates cleanly. (cap >= accrual
--    is intentionally NOT enforced here: the action does partial updates without
--    that cross-field refine, and the math is already safe when cap < accrual.)
alter table payroll_settings
  add constraint payroll_settings_medical_nonneg
    check (medical_accrual_monthly >= 0 and medical_cap >= 0);

-- 2. medical_balance() now sources the cap + monthly accrual from payroll_settings.
--    Unchanged attributes: SECURITY INVOKER (RLS still scopes the employee/claims
--    reads; settings_read lets any authenticated user read the singleton), STABLE,
--    and search_path='' (so every table stays public.-qualified).
create or replace function medical_balance(p_employee uuid)
returns table (accrued int, spent int, available int)
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
      (select cap from settings),
      (select monthly from settings) * (select m from months)
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
    greatest(0, (select accrued from acc) - (select spent from spend))::int
$$;
