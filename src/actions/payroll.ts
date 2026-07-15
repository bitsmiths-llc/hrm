'use server';

import { authActionClient } from '@/lib/server/safe-action';

import {
  addCustomFieldSchema,
  createRunSchema,
  overrideDaysWorkedSchema,
  overrideOtMultiplierSchema,
  removeCustomFieldSchema,
  runIdSchema,
  updatePayrollSettingsSchema,
} from '@/schema/payroll';

/** One ad-hoc payslip line item (positive = earning, negative = deduction). */
type CustomField = { label: string; amount: number };

/** Coerce a jsonb `custom_fields` value (typed `Json`) into a line-item array. */
const toCustomFields = (value: unknown): CustomField[] =>
  Array.isArray(value) ? (value as CustomField[]) : [];

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
    if (parsedInput.taxRatePercent !== undefined)
      patch.tax_rate_percent = parsedInput.taxRatePercent;

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

/**
 * Set a per-payslip overtime-multiplier override on one or many payslips of a
 * run (single-row edit or the bulk popover), then recalc once. The override
 * survives future recalcs. Refused on a locked run before any write.
 */
export const overrideOtMultiplier = authActionClient
  .schema(overrideOtMultiplierSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);

    const { data: run, error: runError } = await supabase
      .from('payroll_runs')
      .select('status')
      .eq('id', parsedInput.run_id)
      .single();
    if (runError) throw new Error(runError.message);
    if (run.status === 'locked')
      throw new Error('This run is locked and can no longer be edited.');

    const { error: updateError } = await supabase
      .from('payslips')
      .update({ overtime_multiplier: parsedInput.overtime_multiplier })
      .eq('payroll_run_id', parsedInput.run_id)
      .in('id', parsedInput.payslip_ids);
    if (updateError) throw new Error(updateError.message);

    const { error: recalcError } = await supabase.rpc('calculate_payroll', {
      p_run_id: parsedInput.run_id,
    });
    if (recalcError) throw new Error(recalcError.message);

    return { run_id: parsedInput.run_id };
  });

/**
 * Append an ad-hoc line item (earning if amount > 0, deduction if < 0) to one or
 * many payslips of a run, then recalc once. Refused on a locked run.
 */
export const addPayslipCustomField = authActionClient
  .schema(addCustomFieldSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);

    const { data: run, error: runError } = await supabase
      .from('payroll_runs')
      .select('status')
      .eq('id', parsedInput.run_id)
      .single();
    if (runError) throw new Error(runError.message);
    if (run.status === 'locked')
      throw new Error('This run is locked and can no longer be edited.');

    const { data: rows, error: readError } = await supabase
      .from('payslips')
      .select('id, custom_fields')
      .eq('payroll_run_id', parsedInput.run_id)
      .in('id', parsedInput.payslip_ids);
    if (readError) throw new Error(readError.message);

    const field: CustomField = {
      label: parsedInput.label,
      amount: parsedInput.amount,
    };
    const results = await Promise.all(
      (rows ?? []).map((row) =>
        supabase
          .from('payslips')
          .update({
            custom_fields: [...toCustomFields(row.custom_fields), field],
          })
          .eq('id', row.id),
      ),
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) throw new Error(failed.error.message);

    const { error: recalcError } = await supabase.rpc('calculate_payroll', {
      p_run_id: parsedInput.run_id,
    });
    if (recalcError) throw new Error(recalcError.message);

    return { run_id: parsedInput.run_id };
  });

/**
 * Remove the custom field at `index` of one payslip, then recalc. Refused on a
 * locked run before any write.
 */
export const removePayslipCustomField = authActionClient
  .schema(removeCustomFieldSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);

    const { data: payslip, error: readError } = await supabase
      .from('payslips')
      .select('payroll_run_id, custom_fields, payroll_runs(status)')
      .eq('id', parsedInput.payslip_id)
      .single();
    if (readError) throw new Error(readError.message);
    if (payslip.payroll_runs?.status === 'locked')
      throw new Error('This run is locked and can no longer be edited.');

    const next = toCustomFields(payslip.custom_fields).filter(
      (_, i) => i !== parsedInput.index,
    );

    const { error: updateError } = await supabase
      .from('payslips')
      .update({ custom_fields: next })
      .eq('id', parsedInput.payslip_id);
    if (updateError) throw new Error(updateError.message);

    const { error: recalcError } = await supabase.rpc('calculate_payroll', {
      p_run_id: payslip.payroll_run_id,
    });
    if (recalcError) throw new Error(recalcError.message);

    return { run_id: payslip.payroll_run_id };
  });
