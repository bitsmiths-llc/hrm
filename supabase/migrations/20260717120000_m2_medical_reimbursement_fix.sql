-- BIT-13/BIT-15 fix: medical reimbursement was subtracted from the pool twice,
-- silently under-paying large claims.
--
-- calculate_payroll paid each employee's approved + unswept claims for the month
-- (claims_sum), but then capped that payout at medical_balance().available.
-- `available` is defined as `accrued - sum(ALL approved claims)`, and claims_sum
-- is a subset of those same approved claims -- so the claims were removed from
-- the pool once inside `available` and again as the thing being paid. The cap
-- therefore bit whenever a month's claims exceeded the remaining headroom:
--
--     accrued 50,000, no prior claims, one approved 40,000 claim
--       available = 50,000 - 40,000 = 10,000
--       medical   = least(40,000, 10,000) = 10,000     -- 30,000 under-paid
--
-- and lock_payroll then stamped payroll_run_id onto the claim, so the unpaid
-- remainder could never be swept into a later run -- it was lost.
--
-- Fix: pay the approved claims in full (v_medical := claims_sum). The approval
-- gate (reviewMedicalClaim -> medical_balance) already refuses any claim whose
-- amount exceeds `available` at approval time, so cumulative approved can never
-- exceed accrued and claims_sum is always fully payable. The least(., available)
-- cap was a no-op for small claims and wrong for large ones -- remove it.
--
-- Scope: calculate_payroll ONLY. medical_balance() is intentionally left alone,
-- so the approval gate and the employee balance cards keep their current meaning,
-- and the still-undecided year-end reset policy stays a single-function change in
-- medical_balance() when it lands. `create or replace` needs the whole body, so
-- this is the 20260715120200 (tax) definition verbatim, with the two medical
-- lines replaced and the now-unused v_available declaration dropped.

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
