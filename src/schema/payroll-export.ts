import { z } from 'zod';

/** A 3-letter ISO-4217 source currency — the Payoneer *balance* an employee is
 *  paid from. Trimmed + upper-cased so the picker's value and a hand-typed code
 *  both normalise to the form Payoneer expects (USD, GBP, …). The recipient
 *  currency is always PKR and is never sent from the client. */
const currencyCode = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{3}$/, 'Use a 3-letter ISO currency code');

/**
 * Input for the `exportPayoneer` action. `currencyByEmployee` maps an employee
 * id → their source currency, so two employees in the same run can carry
 * different balances in one file. Amounts (recipient PKR) come from the frozen
 * `payslips.total_pay` snapshot server-side — never from the client.
 */
export const exportPayoneerSchema = z.object({
  run_id: z.string().uuid(),
  currencyByEmployee: z
    .record(z.string().uuid(), currencyCode)
    .refine(
      (map) => Object.keys(map).length > 0,
      'Choose a source currency for at least one employee',
    ),
});

export type ExportPayoneerInput = z.infer<typeof exportPayoneerSchema>;
