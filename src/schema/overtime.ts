import { z } from 'zod';

export const overtimeLogSchema = z.object({
  date: z.string().min(1, 'Pick the date the overtime was worked'),
  hours: z.coerce
    .number({ invalid_type_error: 'Enter the number of hours' })
    .positive('Hours must be greater than 0')
    .max(16, 'That looks too long for one day'),
  project: z.string().min(2, 'Enter the project name'),
  task: z.string().min(10, 'Describe the task (at least 10 characters)'),
});

export type OvertimeLogInput = z.infer<typeof overtimeLogSchema>;
