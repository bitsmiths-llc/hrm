-- BIT-15 fix: the employee payslips Cycle column (and the PDF date) were blank.
--
-- The employee query embedded `payslips → payroll_runs(period_month)`, but
-- employees can't SELECT payroll_runs (admin-only RLS), so PostgREST returned
-- null for the embed. Denormalize the run's month onto the payslip snapshot (it
-- already carries days_in_month) so the frozen record is self-contained and no
-- cross-table read is needed.

alter table payslips add column period_month date;

-- Backfill existing payslips from their run.
update payslips p
  set period_month = r.period_month
  from payroll_runs r
  where r.id = p.payroll_run_id;

alter table payslips alter column period_month set not null;

-- Keep it populated automatically (calculate_payroll never sets it explicitly).
-- BEFORE INSERT only: the run's month is immutable, and the engine's
-- on-conflict recalc leaves period_month untouched, so it stays correct.
create or replace function set_payslip_period_month()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.period_month is null then
    select period_month into new.period_month
      from public.payroll_runs where id = new.payroll_run_id;
  end if;
  return new;
end $$;

create trigger trg_payslip_period_month
before insert on payslips
for each row execute function set_payslip_period_month();

-- Trigger function is invoked only by its trigger, never as a PostgREST RPC.
revoke execute on function public.set_payslip_period_month() from public, anon, authenticated;
