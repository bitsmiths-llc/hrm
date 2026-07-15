import { z } from 'zod';

/**
 * Payroll settings singleton. These map onto `payroll_settings` columns
 * (ot_multiplier_default / leave_pool_days / medical_accrual_monthly /
 * medical_cap). The admin Settings screen (BIT-15) splits them across three
 * cards, so the update action accepts a partial and writes only the keys a
 * given card submits — hence every field is optional here. Field names stay
 * camelCase to match the existing settings forms and the `HrmSettings` domain
 * type; the action translates them to the DB's snake_case columns.
 */
export const updatePayrollSettingsSchema = z
  .object({
    overtimeMultiplier: z.coerce.number().positive().max(9.99),
    leavePoolDays: z.coerce.number().int().nonnegative(),
    medicalMonthlyAccrual: z.coerce.number().int().nonnegative(),
    medicalBalanceCap: z.coerce.number().int().nonnegative(),
  })
  .partial();

export type UpdatePayrollSettingsInput = z.infer<
  typeof updatePayrollSettingsSchema
>;

/** Create a run for a month. `period_month` is a first-of-month 'YYYY-MM-DD'
 *  date; `days_in_month` is derived server-side (never trusted from the client). */
export const createRunSchema = z.object({
  period_month: z.string().date(),
});
export type CreateRunInput = z.infer<typeof createRunSchema>;

/** Identifies a run for the calculate / lock RPCs. */
export const runIdSchema = z.object({
  run_id: z.string().uuid(),
});
export type RunIdInput = z.infer<typeof runIdSchema>;

/** Inline per-employee days-worked override. Bounded 0..31 (a real month never
 *  exceeds 31 days); the run's actual `days_in_month` is the effective ceiling,
 *  enforced by the UI and re-derived by the recalc that follows. */
export const overrideDaysWorkedSchema = z.object({
  payslip_id: z.string().uuid(),
  days_worked: z.coerce.number().nonnegative().max(31),
});
export type OverrideDaysWorkedInput = z.infer<typeof overrideDaysWorkedSchema>;
