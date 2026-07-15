-- BIT-15 (cont.): tax withholding, designation snapshot, and per-payslip
-- adjustments + OT-multiplier override. Integrates the payroll UI iteration that
-- landed on the remote branch (Earnings/Deductions/Tax/Net grid) onto the real
-- engine.
--
--   * payroll_settings.tax_rate_percent — global % of gross withheld as tax.
--   * payslips.designation — job title snapshot (frozen with the payslip).
--   * payslips.tax_deduction — the withheld amount for this payslip.
--   * payslips.custom_fields (jsonb) — ad-hoc line items [{label, amount}]:
--       amount > 0 is an earning (Adjustment), amount < 0 is a deduction (Other).
--   * payslips.overtime_multiplier — the multiplier actually used, doubling as an
--       admin per-payslip override (preserved across recalc like days_worked).
--
-- Tax base mirrors the UI: gross = full base_salary + medical + overtime_pay +
-- positive adjustments (NOT the prorated total_base). Net total_pay =
-- total_base + medical + overtime_pay + sum(custom_fields) − tax.

alter table payroll_settings
  add column tax_rate_percent numeric(5, 2) not null default 0;

alter table payslips
  add column designation         text,
  add column tax_deduction       integer not null default 0,
  add column custom_fields       jsonb   not null default '[]'::jsonb,
  add column overtime_multiplier numeric(4, 2);

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
      v_total_base    integer;
      v_ot_rate       numeric(12,2);
      v_ot_pay        integer;
      v_available     integer;
      v_medical       integer;
      v_tax           integer;
      v_total_pay     integer;
      v_days_override numeric(4,1);
      v_mult_override numeric(4,2);
      v_custom        jsonb;
      v_custom_total  numeric;
      v_positive_adj  numeric;
    begin
      -- Preserve admin overrides (days worked, OT multiplier, custom fields).
      select days_worked, overtime_multiplier, custom_fields
        into v_days_override, v_mult_override, v_custom
        from payslips
        where payroll_run_id = p_run_id and employee_id = r.employee_id;

      v_days_worked := coalesce(v_days_override, v_run.days_in_month - r.unpaid_days);
      v_multiplier  := coalesce(v_mult_override, r.multiplier);
      v_custom      := coalesce(v_custom, '[]'::jsonb);

      v_total_base  := round(r.base_salary * v_days_worked / v_run.days_in_month);

      v_ot_rate := r.base_salary * v_multiplier / r.working_hours;
      v_ot_pay  := round(v_ot_rate * r.ot_hours);

      select available into v_available from medical_balance(r.employee_id);
      v_medical := least(r.claims_sum, v_available);

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

      insert into payslips (payroll_run_id, employee_id, base_salary, days_in_month,
        days_worked, unpaid_leave_days, total_base, medical,
        overtime_hours, overtime_rate, overtime_pay, overtime_multiplier,
        designation, custom_fields, tax_deduction, total_pay)
      values (p_run_id, r.employee_id, r.base_salary, v_run.days_in_month,
        v_days_worked, r.unpaid_days, v_total_base, v_medical,
        r.ot_hours, v_ot_rate, v_ot_pay, v_multiplier,
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
