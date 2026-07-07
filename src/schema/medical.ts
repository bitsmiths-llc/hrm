import { z } from 'zod';

import { hrmConfig } from '@/constants/hrm-config';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/** Medical Allowance Policy §5: claims must be submitted within 30 days
 *  of the expense date, and the expense date can't be in the future. */
function isWithinSubmissionWindow(value: string) {
  const expenseDate = new Date(`${value}T00:00:00`);
  const now = new Date();
  const elapsed = now.getTime() - expenseDate.getTime();
  return elapsed >= 0 && elapsed <= THIRTY_DAYS_MS;
}

/** Amount is bounded by the employee's current accrued balance (PRD 5.2.1:
 *  claims can't exceed what's been accrued), so the schema is built per
 *  submission with that balance. */
export function createMedicalClaimSchema(maxAmount: number) {
  return z.object({
    claimFor: z.enum(['self', 'parent', 'spouse', 'child'], {
      required_error: 'Select who this claim is for',
    }),
    serviceType: z.enum(
      [
        'consultation',
        'hospitalization',
        'medication',
        'lab_diagnostics',
        'emergency',
        'dental',
        'vision',
      ],
      { required_error: 'Select a service type' },
    ),
    description: z
      .string()
      .min(10, 'Describe the expense (at least 10 characters)'),
    amount: z.coerce
      .number({ invalid_type_error: 'Enter the claim amount' })
      .positive('Amount must be greater than 0')
      .max(
        maxAmount,
        maxAmount > 0
          ? `Amount can't exceed your accrued balance of PKR ${maxAmount.toLocaleString()}`
          : "You don't have an accrued balance to claim against",
      ),
    expenseDate: z
      .string()
      .min(1, 'Pick the expense date')
      .refine(
        isWithinSubmissionWindow,
        'Claims must be submitted within 30 days of the expense date',
      ),
    proofFiles: z
      .array(z.instanceof(File))
      .min(1, 'Attach at least one receipt or invoice')
      .max(hrmConfig.maxProofFiles, `Up to ${hrmConfig.maxProofFiles} files`),
  });
}

export type MedicalClaimInput = z.infer<
  ReturnType<typeof createMedicalClaimSchema>
>;
