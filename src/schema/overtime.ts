import { z } from 'zod';

import { getZodEnum } from '@/schema/common';

/** True when `value` (a 'YYYY-MM-DD' date) is today or earlier. Compared as
 *  date-only strings in the runtime's local timezone — overtime is logged after
 *  it's worked, so a future date is never valid. Runs on both the client (form)
 *  and the server (action re-validates), and avoids Date-object parsing quirks. */
const isTodayOrEarlier = (value: string): boolean => {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return value <= today;
};

/**
 * Employee-submitted overtime log. `projectId` references the admin-managed
 * `projects` lookup (the form's dropdown). `hours` maps to `numeric(5,2)`, so
 * 2.5 is accepted while 0/negative fails. The action forces `status = 'pending'`
 * and stamps `employee_id`, so this schema is the client-side guard only — pay
 * is never captured here; it's computed at payroll run time.
 */
export const overtimeLogSchema = z.object({
  date: z
    .string()
    .min(1, 'Pick the date the overtime was worked')
    .refine(isTodayOrEarlier, 'Overtime cannot be logged for a future date'),
  hours: z.coerce
    .number({ invalid_type_error: 'Enter the number of hours' })
    .positive('Hours must be greater than 0')
    .max(16, 'That looks too long for one day'),
  projectId: z.string().uuid('Select a project'),
  task: z.string().min(10, 'Describe the task (at least 10 characters)'),
});

export type OvertimeLogInput = z.infer<typeof overtimeLogSchema>;

/**
 * Admin decision on a pending log. A rejection must carry a reason — it is
 * stored on the row, emailed to the employee, and shown in their history
 * (mirrors `reviewLeaveSchema` / `reviewMedicalSchema`).
 */
export const reviewOvertimeSchema = z
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

export type ReviewOvertimeInput = z.infer<typeof reviewOvertimeSchema>;
