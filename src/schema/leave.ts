import { z } from 'zod';

import { hrmConfig } from '@/constants/hrm-config';
import { getZodEnum } from '@/schema/common';

/** Shared leave-type enum, aligned to the `leave_type` DB enum. */
export const leaveTypeEnum = getZodEnum([
  'paid',
  'sick',
  'unpaid',
  'half_day',
] as const);

/** True when `value` (a 'YYYY-MM-DD' string) is today or later in local time. */
const isTodayOrLater = (value: string): boolean => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return new Date(`${value}T00:00:00`) >= startOfToday;
};

/**
 * Employee-submitted leave request. Half Day pins days to 0.5 and all types are
 * constrained to 0.5-day increments (1.3 fails, 2.5 passes). `startDate` cannot
 * be in the past. The action forces `status = 'pending'` and re-derives
 * `num_days` server-side, so this schema is the client-side guard only.
 */
export const createLeaveRequestSchema = z
  .object({
    type: leaveTypeEnum,
    startDate: z
      .string()
      .min(1, 'Pick the first day of leave')
      .refine(isTodayOrLater, 'Leave cannot start in the past'),
    days: z.coerce
      .number({ invalid_type_error: 'Enter the number of days' })
      .positive('Days must be greater than 0')
      .max(60, 'That looks too long for one request')
      .refine((value) => value % 0.5 === 0, 'Use half-day increments (0.5)'),
    reason: z
      .string()
      .min(10, 'Give a short but clear reason (at least 10 characters)'),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'half_day' && data.days !== hrmConfig.halfDayValue) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['days'],
        message: 'A half day is always 0.5 days',
      });
    }
  });

export type LeaveRequestInput = z.infer<typeof createLeaveRequestSchema>;

/**
 * Admin decision on a pending request. A rejection must carry a reason — it is
 * stored on the row, emailed to the employee, and shown in their history.
 */
export const reviewLeaveSchema = z
  .object({
    id: z.string().uuid(),
    decision: getZodEnum(['approved', 'rejected'] as const),
    rejectionReason: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.decision === 'rejected' &&
      (!data.rejectionReason || data.rejectionReason.length < 3)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rejectionReason'],
        message:
          'Add a reason so the employee knows why (at least 3 characters)',
      });
    }
  });

export type ReviewLeaveInput = z.infer<typeof reviewLeaveSchema>;

/** Just the reason field, for the admin reject dialog (the id + decision are
 *  supplied by the action call, not the form). */
export const rejectLeaveReasonSchema = z.object({
  rejectionReason: z
    .string()
    .trim()
    .min(3, 'Add a reason so the employee knows why (at least 3 characters)'),
});

export type RejectLeaveReasonInput = z.infer<typeof rejectLeaveReasonSchema>;
