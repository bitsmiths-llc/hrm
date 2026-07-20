-- Non-negative CHECK on payroll_settings.leave_pool_days, mirroring the
-- payroll_settings_medical_nonneg constraint the medical wiring added for
-- medical_cap / medical_accrual_monthly. Since m2_leave_balance_use_settings
-- made leave_balance() read this column, a stored negative would flip the whole
-- pool negative. updatePayrollSettingsSchema already refuses negatives with Zod
-- nonnegative(); this makes it a DB-level invariant too (defence in depth, and
-- covers any write that bypasses the action). Guarded so re-running is safe.

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'payroll_settings_leave_nonneg'
  ) then
    alter table public.payroll_settings
      add constraint payroll_settings_leave_nonneg check (leave_pool_days >= 0);
  end if;
end $$;
