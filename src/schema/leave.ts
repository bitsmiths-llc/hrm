import { z } from 'zod';

import { hrmConfig } from '@/constants/hrm-config';

export const leaveRequestSchema = z
  .object({
    type: z.enum(['paid', 'sick', 'unpaid', 'half_day'], {
      required_error: 'Select a leave type',
    }),
    startDate: z.string().min(1, 'Pick the first day of leave'),
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

export type LeaveRequestInput = z.infer<typeof leaveRequestSchema>;
