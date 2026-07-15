'use server';

import { authActionClient } from '@/lib/server/safe-action';

import {
  createRunSchema,
  overrideDaysWorkedSchema,
  runIdSchema,
  updatePayrollSettingsSchema,
} from '@/schema/payroll';

/** Admin gate. The role check is server-side even though RLS / the RPC's own
 *  `is_admin()` guard also enforce it (mirrors `actions/overtime.ts`). */
const requireAdmin = (role?: string) => {
  if (role !== 'admin') throw new Error('Forbidden');
};

/** Last calendar day of the month a first-of-month ISO date falls in. Derived
 *  server-side so a client can never spoof `days_in_month` (it drives proration). */
const daysInMonth = (periodMonth: string) => {
  const [year, month] = periodMonth.split('-').map(Number);
  return new Date(year, month, 0).getDate();
};

/**
 * Update the single `payroll_settings` row. Admin-only. The row is seeded by the
 * migration and only ever UPDATEd (RLS `settings_write`), so this maps the
 * submitted camelCase subset onto the DB columns and writes just those keys.
 */
export const updatePayrollSettings = authActionClient
  .schema(updatePayrollSettingsSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);

    const patch: Record<string, number> = {};
    if (parsedInput.overtimeMultiplier !== undefined)
      patch.ot_multiplier_default = parsedInput.overtimeMultiplier;
    if (parsedInput.leavePoolDays !== undefined)
      patch.leave_pool_days = parsedInput.leavePoolDays;
    if (parsedInput.medicalMonthlyAccrual !== undefined)
      patch.medical_accrual_monthly = parsedInput.medicalMonthlyAccrual;
    if (parsedInput.medicalBalanceCap !== undefined)
      patch.medical_cap = parsedInput.medicalBalanceCap;

    const { error } = await supabase
      .from('payroll_settings')
      .update(patch)
      .eq('id', true);
    if (error) throw new Error(error.message);

    return { updated: Object.keys(patch) };
  });

/**
 * Create an `open` run for a month (the manual "Create run" button — used for
 * the current, a back-dated, or a future month). `days_in_month` is derived
 * server-side. `period_month` is unique, so a duplicate create resolves to the
 * existing run rather than erroring.
 */
export const createRun = authActionClient
  .schema(createRunSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);

    const { data, error } = await supabase
      .from('payroll_runs')
      .insert({
        period_month: parsedInput.period_month,
        days_in_month: daysInMonth(parsedInput.period_month),
        status: 'open',
      })
      .select('id, period_month')
      .single();

    // Unique(period_month) violation → the run already exists; return it so the
    // caller can just navigate to it (create is idempotent from the UI's view).
    if (error) {
      if (error.code === '23505') {
        const { data: existing, error: fetchError } = await supabase
          .from('payroll_runs')
          .select('id, period_month')
          .eq('period_month', parsedInput.period_month)
          .single();
        if (fetchError) throw new Error(fetchError.message);
        return existing;
      }
      throw new Error(error.message);
    }

    return data;
  });

/**
 * Generate / recalculate the draft payslips for a run. Idempotent; the RPC
 * refuses on a locked run (55000) and re-asserts admin (42501). Admin-guarded
 * here too for a fast, friendly failure before the round-trip.
 */
export const calculatePayroll = authActionClient
  .schema(runIdSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);
    const { error } = await supabase.rpc('calculate_payroll', {
      p_run_id: parsedInput.run_id,
    });
    if (error) throw new Error(error.message);
    return { run_id: parsedInput.run_id };
  });

/**
 * Finalize a run: sweep-stamp approved medical/OT, freeze `total_payroll`, flip
 * to `locked`. The RPC is transactional and refuses a second lock (55000).
 */
export const lockPayroll = authActionClient
  .schema(runIdSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);
    const { error } = await supabase.rpc('lock_payroll', {
      p_run_id: parsedInput.run_id,
    });
    if (error) throw new Error(error.message);
    return { run_id: parsedInput.run_id };
  });

/**
 * Set an inline days-worked override on one payslip, then recalc the run so the
 * dependent totals refresh. The override survives the recalc (the engine reads
 * the existing `days_worked` and passes it through). Refused on a locked run
 * *before* any write, so a locked payslip is never mutated.
 */
export const overrideDaysWorked = authActionClient
  .schema(overrideDaysWorkedSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);

    const { data: payslip, error: readError } = await supabase
      .from('payslips')
      .select('payroll_run_id, payroll_runs(status)')
      .eq('id', parsedInput.payslip_id)
      .single();
    if (readError) throw new Error(readError.message);
    if (payslip.payroll_runs?.status === 'locked')
      throw new Error('This run is locked and can no longer be edited.');

    const { error: updateError } = await supabase
      .from('payslips')
      .update({ days_worked: parsedInput.days_worked })
      .eq('id', parsedInput.payslip_id);
    if (updateError) throw new Error(updateError.message);

    const { error: recalcError } = await supabase.rpc('calculate_payroll', {
      p_run_id: payslip.payroll_run_id,
    });
    if (recalcError) throw new Error(recalcError.message);

    return { run_id: payslip.payroll_run_id };
  });
