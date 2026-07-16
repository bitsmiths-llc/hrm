import { z } from 'zod';

import { hrmConfig } from '@/constants/hrm-config';
import { getZodEnum } from '@/schema/common';

/** Upload limits (PRD 7.3). Enforced client-side (FileUpload + Zod), by the
 *  `medical-proofs` bucket (size/MIME), and by the `enforce_max_medical_files`
 *  DB trigger (count) — a bypassed client can't get around the last two. */
export const MAX_FILES = hrmConfig.maxProofFiles;
export const MAX_FILE_BYTES = hrmConfig.maxProofFileSizeMb * 1024 * 1024;

/** Medical Allowance Policy §5: an expense date must be today or within the
 *  preceding 30 days — never in the future. */
export const SUBMISSION_WINDOW_DAYS = 30;

/** The inclusive `[earliest, today]` calendar-day bounds for a valid expense
 *  date. Shared by the form's date picker (to disable everything outside the
 *  window) and the Zod refine below, so the calendar and validation never
 *  disagree. Compared by calendar day (midnight-normalized), not elapsed ms, so
 *  the exact 30-day-ago boundary is accepted rather than rejected on a technicality. */
export function expenseDateBounds(): { earliest: Date; today: Date } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const earliest = new Date(today);
  earliest.setDate(earliest.getDate() - SUBMISSION_WINDOW_DAYS);
  return { earliest, today };
}

/** Runs on both the client (form) and the server (action re-validates). */
function isWithinSubmissionWindow(value: string): boolean {
  const expenseDate = new Date(`${value}T00:00:00`);
  const { earliest, today } = expenseDateBounds();
  return expenseDate >= earliest && expenseDate <= today;
}

/**
 * Server-authoritative claim fields, re-validated in `createMedicalClaim`. The
 * amount is whole PKR (`500.5` fails `.int()`). The balance bound is NOT here —
 * it's enforced at approval time against `medical_balance()` (a pending claim
 * never moves the balance), so submitting above balance is allowed; approving
 * above it is not.
 */
export const medicalClaimFieldsSchema = z.object({
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
    .int('Enter a whole rupee amount (no paisa)') // 500.5 -> fail
    .positive('Amount must be greater than 0'),
  expenseDate: z
    .string()
    .min(1, 'Pick the expense date')
    .refine(
      isWithinSubmissionWindow,
      'Expense date must be within the last 30 days and not in the future',
    ),
});

export type MedicalClaimFields = z.infer<typeof medicalClaimFieldsSchema>;

/**
 * Client-side submit schema. Extends the server fields with the `maxAmount`
 * balance bound (a UX guard — the real bound is server-side at approval) and
 * the proof-file constraints: 1–5 files, each ≤ 10 MB. `File` is referenced
 * only inside this factory so the shared module stays server-safe.
 */
export function createMedicalClaimSchema(maxAmount: number) {
  return medicalClaimFieldsSchema.extend({
    amount: z.coerce
      .number({ invalid_type_error: 'Enter the claim amount' })
      .int('Enter a whole rupee amount (no paisa)')
      .positive('Amount must be greater than 0')
      .max(
        maxAmount,
        maxAmount > 0
          ? `Amount can't exceed your available balance of PKR ${maxAmount.toLocaleString()}`
          : "You don't have an available balance to claim against",
      ),
    proofFiles: z
      .array(z.instanceof(File))
      .min(1, 'Attach at least one receipt or invoice')
      .max(MAX_FILES, `Up to ${MAX_FILES} files`)
      .refine(
        (files) => files.every((file) => file.size <= MAX_FILE_BYTES),
        `Each file must be under ${hrmConfig.maxProofFileSizeMb}MB`,
      ),
  });
}

export type MedicalClaimInput = z.infer<
  ReturnType<typeof createMedicalClaimSchema>
>;

/**
 * Admin decision on a pending claim. A rejection must carry a reason — it is
 * stored on the row, emailed to the employee, and shown in their history
 * (mirrors `reviewLeaveSchema`).
 */
export const reviewMedicalSchema = z
  .object({
    id: z.string().uuid(),
    decision: getZodEnum(['approved', 'rejected'] as const),
    rejectionReason: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.decision === 'rejected' &&
      (!data.rejectionReason || data.rejectionReason.length < 5)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rejectionReason'],
        message:
          'Add a reason so the employee knows why (at least 5 characters)',
      });
    }
  });

export type ReviewMedicalInput = z.infer<typeof reviewMedicalSchema>;
