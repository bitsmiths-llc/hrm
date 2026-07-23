-- BIT-15: Payroll settings, engine & run lifecycle — Module 2 / Payroll
-- Delivers the payroll core: a singleton `payroll_settings` row, the run
-- lifecycle (`payroll_runs` open → locked) with frozen `payslips` snapshots,
-- the deferred FK wiring on medical_claims / overtime_logs, and the
-- calculate_payroll / lock_payroll / ensure_current_run RPCs.
--
-- Divergences from the BIT-15 ticket text, made to fit this project as it
-- actually exists (same rationale as the leave/medical/overtime migrations):
--   * The ticket's SQL calls `auth.is_admin()`; the `auth` schema is reserved
--     on this project (BIT-3), so every RPC/policy uses `public.is_admin()`.
--   * `settings_read` uses `to authenticated using (true)` (the leave/medical
--     RLS idiom) instead of `auth.role() = 'authenticated'`.
--   * The `payroll_status` enum does not exist yet — created here.
--   * calculate_payroll sources working hours from `employment_details`
--     (`coalesce(nullif(ed.working_hours, 0), 160)`) rather than the ticket's
--     literal 160. The column already exists (BIT-3) and the app's prior mock
--     engine used it; a null/zero falls back to 160, so the ticket's worked
--     example still holds (100000 * 1.5 / 160 = 937.50).
--   * The employee loop skips active employees whose `base_salary` is null
--     (unconfigured): a null would fail the NOT NULL payslip insert and abort
--     the entire run for everyone. They reappear once configured.
--   * payroll_settings is seeded once here (as postgres, bypassing RLS) and
--     thereafter only UPDATEd, so RLS needs no INSERT policy. A set_updated_at
--     trigger keeps `updated_at` fresh on write (consistent with every other
--     table in this schema).
--   * pg_cron scheduling lives in the follow-up migration
--     20260715120100_m2_payroll_cron.sql so a cron/extension hiccup can never
--     roll back this (the load-bearing) migration.

-- ---------------------------------------------------------------------------
-- 1. payroll_status enum + payroll_settings singleton
--    `id boolean primary key check (id)` allows exactly one row (id = true).
-- ---------------------------------------------------------------------------
create type payroll_status as enum ('open', 'locked');

create table payroll_settings (
  id                      boolean primary key default true check (id),
  ot_multiplier_default   numeric(4, 2) not null default 1.00,
  medical_accrual_monthly integer       not null default 5000,
  medical_cap             integer       not null default 50000,
  leave_pool_days         integer       not null default 22,
  updated_at              timestamptz   not null default now()
);

insert into payroll_settings (id) values (true) on conflict do nothing;

create trigger trg_settings_updated
before update on payroll_settings
for each row execute function set_updated_at();

alter table payroll_settings enable row level security;

-- Any authenticated user reads settings; only admins may change the row.
create policy settings_read
on payroll_settings
for select
to authenticated
using (true);

create policy settings_write
on payroll_settings
for update
using (public.is_admin())
with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 2. payroll_runs — one row per period_month, open → locked.
--    days_in_month is derived at create time. total_payroll is null until the
--    run is locked (then frozen to sum(payslips.total_pay)).
-- ---------------------------------------------------------------------------
create table payroll_runs (
  id            uuid primary key default gen_random_uuid(),
  period_month  date not null,
  status        payroll_status not null default 'open',
  days_in_month int not null,
  total_payroll integer,
  locked_by     uuid references employees(id),
  locked_at     timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (period_month)
);

create trigger trg_run_updated
before update on payroll_runs
for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- 3. payslips — the frozen per-employee record of what was paid. Written (and
--    overwritten while open) by calculate_payroll; immutable after lock. Cost
--    rollups elsewhere sum `total_pay` — never recompute from source rows.
-- ---------------------------------------------------------------------------
create table payslips (
  id                uuid primary key default gen_random_uuid(),
  payroll_run_id    uuid not null references payroll_runs(id) on delete cascade,
  employee_id       uuid not null references employees(id),
  base_salary       integer not null,
  days_in_month     int not null,
  days_worked       numeric(4, 1) not null,
  unpaid_leave_days numeric(4, 1) not null default 0,
  total_base        integer not null,
  medical           integer not null default 0,
  overtime_hours    numeric(6, 2) not null default 0,
  overtime_rate     numeric(12, 2) not null default 0,
  overtime_pay      integer not null default 0,
  total_pay         integer not null,
  currency_balance  text,
  created_at        timestamptz not null default now(),
  unique (payroll_run_id, employee_id)
);

alter table payroll_runs enable row level security;
alter table payslips enable row level security;

-- Admins manage every run; employees can never see a run row (only their own
-- payslip, and only once locked — the visibility gate).
create policy runs_admin_all
on payroll_runs
for all
using (public.is_admin())
with check (public.is_admin());

create policy payslip_own_locked
on payslips
for select
using (
  employee_id = auth.uid()
  and exists (
    select 1 from payroll_runs r
    where r.id = payroll_run_id and r.status = 'locked'
  )
);

create policy payslip_admin_all
on payslips
for all
using (public.is_admin())
with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 4. Deferred FK wiring. medical_claims (BIT-13) and overtime_logs (BIT-14)
--    shipped with a bare `payroll_run_id uuid`; its FK to payroll_runs can only
--    be added now that the table exists. MUST stay after payroll_runs above.
-- ---------------------------------------------------------------------------
alter table medical_claims
  add constraint medical_claims_run_fk
  foreign key (payroll_run_id) references payroll_runs(id);

alter table overtime_logs
  add constraint overtime_logs_run_fk
  foreign key (payroll_run_id) references payroll_runs(id);

-- Sweep/lookup helpers: find approved, unswept items in a period fast.
create index medical_claims_run_idx on medical_claims (payroll_run_id);
create index overtime_logs_run_idx on overtime_logs (payroll_run_id);

-- ---------------------------------------------------------------------------
-- 5. calculate_payroll(p_run_id) — idempotent draft generation.
--    security definer (bypasses RLS) so it asserts public.is_admin() itself and
--    raises 42501 for non-admins. Refuses on a locked run (55000). Upserts one
--    payslip per active employee; preserves any existing days_worked (an admin's
--    inline override survives a whole-run recalc — clear it by deleting the row).
-- ---------------------------------------------------------------------------
create or replace function calculate_payroll(p_run_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_run       payroll_runs%rowtype;
  v_mult_def  numeric(4,2);
  r           record;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select * into v_run from payroll_runs where id = p_run_id;
  if not found then raise exception 'run % not found', p_run_id; end if;
  if v_run.status = 'locked' then
    raise exception 'run % is locked', p_run_id using errcode = '55000';
  end if;

  select ot_multiplier_default into v_mult_def from payroll_settings where id = true;

  for r in
    select e.id as employee_id,
           ed.base_salary,
           -- guard the OT divisor against a null / zero working_hours (bad data)
           coalesce(nullif(ed.working_hours, 0), 160) as working_hours,
           coalesce(ed.ot_multiplier_override, v_mult_def) as multiplier,
           -- approved unpaid days in the run's month
           coalesce((select sum(l.num_days) from leave_requests l
                     where l.employee_id = e.id and l.status = 'approved'
                       and l.leave_type = 'unpaid'
                       and date_trunc('month', l.start_date) = date_trunc('month', v_run.period_month)
                    ), 0) as unpaid_days,
           -- approved, unswept OT hours in the period
           coalesce((select sum(o.hours) from overtime_logs o
                     where o.employee_id = e.id and o.status = 'approved'
                       and o.payroll_run_id is null
                       and date_trunc('month', o.work_date) = date_trunc('month', v_run.period_month)
                    ), 0) as ot_hours,
           -- approved, unswept medical claims in the period
           coalesce((select sum(m.amount) from medical_claims m
                     where m.employee_id = e.id and m.status = 'approved'
                       and m.payroll_run_id is null
                       and date_trunc('month', m.expense_date) = date_trunc('month', v_run.period_month)
                    ), 0) as claims_sum
    from employees e
    join employment_details ed on ed.employee_id = e.id
    -- skip active-but-unconfigured employees: without a base_salary there is
    -- nothing to pay, and a null would fail the NOT NULL payslip insert and
    -- abort the whole run. They reappear automatically once configured.
    where e.account_status = 'active' and ed.base_salary is not null
  loop
    declare
      v_days_worked numeric(4,1);
      v_total_base  integer;
      v_ot_rate     numeric(12,2);
      v_ot_pay      integer;
      v_available   integer;
      v_medical     integer;
      v_total_pay   integer;
      v_override    numeric(4,1);
    begin
      -- preserve an existing admin days-worked override if present
      select days_worked into v_override from payslips
        where payroll_run_id = p_run_id and employee_id = r.employee_id;

      v_days_worked := coalesce(v_override, v_run.days_in_month - r.unpaid_days);
      v_total_base  := round(r.base_salary * v_days_worked / v_run.days_in_month);

      v_ot_rate := r.base_salary * r.multiplier / r.working_hours;
      v_ot_pay  := round(v_ot_rate * r.ot_hours);

      select available into v_available from medical_balance(r.employee_id);
      v_medical := least(r.claims_sum, v_available);

      v_total_pay := v_total_base + v_medical + v_ot_pay;

      insert into payslips (payroll_run_id, employee_id, base_salary, days_in_month,
        days_worked, unpaid_leave_days, total_base, medical,
        overtime_hours, overtime_rate, overtime_pay, total_pay)
      values (p_run_id, r.employee_id, r.base_salary, v_run.days_in_month,
        v_days_worked, r.unpaid_days, v_total_base, v_medical,
        r.ot_hours, v_ot_rate, v_ot_pay, v_total_pay)
      on conflict (payroll_run_id, employee_id) do update set
        base_salary = excluded.base_salary,
        days_worked = excluded.days_worked,           -- override preserved via v_override above
        unpaid_leave_days = excluded.unpaid_leave_days,
        total_base = excluded.total_base,
        medical = excluded.medical,
        overtime_hours = excluded.overtime_hours,
        overtime_rate = excluded.overtime_rate,
        overtime_pay = excluded.overtime_pay,
        total_pay = excluded.total_pay;
    end;
  end loop;
end;
$$;
-- Supabase default privileges auto-grant EXECUTE to anon/authenticated on new
-- public functions, so revoke anon explicitly (matches accept/submit_onboarding);
-- the internal is_admin() guard is the real gate, but anon should never reach it.
revoke all on function calculate_payroll(uuid) from public, anon;
grant execute on function calculate_payroll(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 6. lock_payroll(p_run_id) — transactional finalize.
--    Sweep-stamps approved + previously-unswept medical/OT for the period (so
--    each item feeds exactly one run), freezes total_payroll, flips to locked,
--    stamps locked_by/locked_at. Refuses a second lock (55000). One plpgsql
--    transaction: a partial failure rolls back the whole sweep.
-- ---------------------------------------------------------------------------
create or replace function lock_payroll(p_run_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_run   payroll_runs%rowtype;
  v_total integer;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select * into v_run from payroll_runs where id = p_run_id for update;
  if not found then raise exception 'run % not found', p_run_id; end if;
  if v_run.status = 'locked' then
    raise exception 'run % already locked', p_run_id using errcode = '55000';
  end if;

  -- Sweep-stamp only approved + previously-unswept items in this run's month.
  update overtime_logs o set payroll_run_id = p_run_id
   where o.status = 'approved' and o.payroll_run_id is null
     and date_trunc('month', o.work_date) = date_trunc('month', v_run.period_month)
     and o.employee_id in (select employee_id from payslips where payroll_run_id = p_run_id);

  update medical_claims m set payroll_run_id = p_run_id
   where m.status = 'approved' and m.payroll_run_id is null
     and date_trunc('month', m.expense_date) = date_trunc('month', v_run.period_month)
     and m.employee_id in (select employee_id from payslips where payroll_run_id = p_run_id);

  select coalesce(sum(total_pay), 0) into v_total from payslips where payroll_run_id = p_run_id;

  update payroll_runs
     set status = 'locked', total_payroll = v_total,
         locked_by = auth.uid(), locked_at = now()
   where id = p_run_id;
end;
$$;
revoke all on function lock_payroll(uuid) from public, anon;
grant execute on function lock_payroll(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 7. ensure_current_run() — create the current month's open run if missing.
--    Idempotent: unique(period_month) means the pg_cron job (M2 cron migration)
--    and a manual click can never double-create. Back-dated / future months use
--    the manual create path (a direct admin insert), not this helper.
-- ---------------------------------------------------------------------------
create or replace function ensure_current_run()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_month date := date_trunc('month', now())::date;
  v_id    uuid;
begin
  insert into payroll_runs (period_month, days_in_month, status)
  values (v_month,
          extract(day from (v_month + interval '1 month - 1 day'))::int,
          'open')
  on conflict (period_month) do nothing
  returning id into v_id;

  if v_id is null then
    select id into v_id from payroll_runs where period_month = v_month;
  end if;
  return v_id;
end $$;
revoke all on function ensure_current_run() from public, anon;
grant execute on function ensure_current_run() to authenticated;
