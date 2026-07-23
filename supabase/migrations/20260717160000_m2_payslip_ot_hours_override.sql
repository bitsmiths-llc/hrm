-- Make a payslip's overtime hours editable from the admin draft grid.
--
-- overtime_hours was engine-derived only: calculate_payroll re-summed each
-- employee's approved, unswept overtime_logs for the month and blindly
-- overwrote the column on conflict. Writing overtime_hours directly (the way
-- overrideDaysWorked / overrideOtMultiplier write their columns) would
-- therefore be silently discarded by the recalc those very actions trigger.
--
-- Fix: a separate nullable override column, coalesced by the engine.
--
--   overtime_hours_override is null  -> follow the approved overtime_logs
--   overtime_hours_override = 12.5   -> admin says 12.5, logs ignored
--
-- Why a NEW column rather than adding overtime_hours to the engine's
-- preserve-list (the days_worked / overtime_multiplier treatment): those two
-- columns always hold their effective value, so preserving them makes the
-- FIRST calculated value sticky forever. That quirk is tolerable for days
-- worked, but overtime accrues *after* a run opens -- an admin approves an OT
-- log mid-month and recalcs, expecting the hours to move. Freezing
-- overtime_hours on first calc would break that everyday flow for everyone to
-- serve the occasional manual override. A null-by-default sidecar column keeps
-- the logs authoritative until an admin explicitly overrides, and lets them
-- revert by setting it back to null.
--
-- overtime_hours stays the effective (post-coalesce) figure, so every reader --
-- the payslip PDF, the invoice email, the employee's payslips page -- keeps
-- working untouched.
--
-- lock_payroll is deliberately not changed: it still sweep-stamps the month's
-- approved logs onto the run regardless of an override, so those hours can
-- never be double-paid into a later run.
--
-- `create or replace` needs the whole body, so the function below is the
-- 20260717120000 (medical reimbursement fix) definition verbatim, with only
-- the overtime-hours override threaded through.

alter table payslips
  add column overtime_hours_override numeric(6, 2)
    check (overtime_hours_override is null or overtime_hours_override >= 0);

comment on column payslips.overtime_hours_override is
  'Admin override for overtime hours. Null = derive from approved overtime_logs. '
  'Set by the payroll grid; survives recalc (see calculate_payroll).';

create or replace function calculate_payroll(p_run_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_run       payroll_runs%rowtype;
  v_mult_def  numeric(4,2);
  v_tax_rate  numeric(5,2);
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

  select ot_multiplier_default, tax_rate_percent
    into v_mult_def, v_tax_rate
    from payroll_settings where id = true;

  for r in
    select e.id as employee_id,
           ed.base_salary,
           ed.designation,
           coalesce(nullif(ed.working_hours, 0), 160) as working_hours,
           coalesce(ed.ot_multiplier_override, v_mult_def) as multiplier,
           coalesce((select sum(l.num_days) from leave_requests l
                     where l.employee_id = e.id and l.status = 'approved'
                       and l.leave_type = 'unpaid'
                       and date_trunc('month', l.start_date) = date_trunc('month', v_run.period_month)
                    ), 0) as unpaid_days,
           coalesce((select sum(o.hours) from overtime_logs o
                     where o.employee_id = e.id and o.status = 'approved'
                       and o.payroll_run_id is null
                       and date_trunc('month', o.work_date) = date_trunc('month', v_run.period_month)
                    ), 0) as ot_hours,
           coalesce((select sum(m.amount) from medical_claims m
                     where m.employee_id = e.id and m.status = 'approved'
                       and m.payroll_run_id is null
                       and date_trunc('month', m.expense_date) = date_trunc('month', v_run.period_month)
                    ), 0) as claims_sum
    from employees e
    join employment_details ed on ed.employee_id = e.id
    where e.account_status = 'active' and ed.base_salary is not null
  loop
    declare
      v_days_worked   numeric(4,1);
      v_multiplier    numeric(4,2);
      v_ot_hours      numeric(6,2);
      v_total_base    integer;
      v_ot_rate       numeric(12,2);
      v_ot_pay        integer;
      v_medical       integer;
      v_tax           integer;
      v_total_pay     integer;
      v_days_override numeric(4,1);
      v_mult_override numeric(4,2);
      v_ot_override   numeric(6,2);
      v_custom        jsonb;
      v_custom_total  numeric;
      v_positive_adj  numeric;
    begin
      -- Preserve admin overrides (days worked, OT multiplier, OT hours, custom fields).
      select days_worked, overtime_multiplier, overtime_hours_override, custom_fields
        into v_days_override, v_mult_override, v_ot_override, v_custom
        from payslips
        where payroll_run_id = p_run_id and employee_id = r.employee_id;

      v_days_worked := coalesce(v_days_override, v_run.days_in_month - r.unpaid_days);
      v_multiplier  := coalesce(v_mult_override, r.multiplier);
      -- Null override = follow the approved logs; a set one wins over them.
      v_ot_hours    := coalesce(v_ot_override, r.ot_hours);
      v_custom      := coalesce(v_custom, '[]'::jsonb);

      v_total_base  := round(r.base_salary * v_days_worked / v_run.days_in_month);

      v_ot_rate := r.base_salary * v_multiplier / r.working_hours;
      v_ot_pay  := round(v_ot_rate * v_ot_hours);

      -- Reimburse the approved claims in full. The approval gate already bounded
      -- cumulative approved <= accrued, so claims_sum is always payable; capping
      -- again against medical_balance().available double-counted these very
      -- claims and under-paid large ones (see migration header).
      v_medical := r.claims_sum;

      -- Sum all custom fields (net), and the positive ones only (tax base).
      select coalesce(sum((item->>'amount')::numeric), 0),
             coalesce(sum((item->>'amount')::numeric)
                        filter (where (item->>'amount')::numeric > 0), 0)
        into v_custom_total, v_positive_adj
        from jsonb_array_elements(v_custom) as t(item);

      -- Tax on gross earnings: full base + medical + OT + positive adjustments.
      v_tax := round((r.base_salary + v_medical + v_ot_pay + v_positive_adj)
                     * v_tax_rate / 100);

      v_total_pay := round(v_total_base + v_medical + v_ot_pay + v_custom_total - v_tax);

      -- overtime_hours_override is intentionally absent from both the column
      -- list and the DO UPDATE SET: a fresh payslip defaults it to null, and a
      -- recalc must leave whatever the admin set untouched.
      insert into payslips (payroll_run_id, employee_id, base_salary, days_in_month,
        days_worked, unpaid_leave_days, total_base, medical,
        overtime_hours, overtime_rate, overtime_pay, overtime_multiplier,
        designation, custom_fields, tax_deduction, total_pay)
      values (p_run_id, r.employee_id, r.base_salary, v_run.days_in_month,
        v_days_worked, r.unpaid_days, v_total_base, v_medical,
        v_ot_hours, v_ot_rate, v_ot_pay, v_multiplier,
        r.designation, v_custom, v_tax, v_total_pay)
      on conflict (payroll_run_id, employee_id) do update set
        base_salary = excluded.base_salary,
        days_worked = excluded.days_worked,
        unpaid_leave_days = excluded.unpaid_leave_days,
        total_base = excluded.total_base,
        medical = excluded.medical,
        overtime_hours = excluded.overtime_hours,
        overtime_rate = excluded.overtime_rate,
        overtime_pay = excluded.overtime_pay,
        overtime_multiplier = excluded.overtime_multiplier,
        designation = excluded.designation,
        custom_fields = excluded.custom_fields,
        tax_deduction = excluded.tax_deduction,
        total_pay = excluded.total_pay;
    end;
  end loop;
end;
$$;
revoke all on function calculate_payroll(uuid) from public, anon;
grant execute on function calculate_payroll(uuid) to authenticated;
