import { z } from 'zod';

const baseHrmSettingsSchema = z.object({
  overtimeMultiplier: z.coerce
    .number({ invalid_type_error: 'Enter a multiplier' })
    .positive('Must be greater than 0')
    .max(5, 'That looks too high — double check the rate'),
  leavePoolDays: z.coerce
    .number({ invalid_type_error: 'Enter a number of days' })
    .int('Whole days only')
    .positive('Must be greater than 0')
    .max(60, 'That looks too high — double check the pool size'),
  medicalMonthlyAccrual: z.coerce
    .number({ invalid_type_error: 'Enter an amount' })
    .nonnegative('Must be 0 or greater'),
  medicalBalanceCap: z.coerce
    .number({ invalid_type_error: 'Enter an amount' })
    .positive('Must be greater than 0'),
});

export const overtimeSettingsSchema = baseHrmSettingsSchema.pick({
  overtimeMultiplier: true,
});
export type OvertimeSettingsInput = z.infer<typeof overtimeSettingsSchema>;

export const leaveSettingsSchema = baseHrmSettingsSchema.pick({
  leavePoolDays: true,
});
export type LeaveSettingsInput = z.infer<typeof leaveSettingsSchema>;

export const medicalSettingsSchema = baseHrmSettingsSchema
  .pick({ medicalMonthlyAccrual: true, medicalBalanceCap: true })
  .refine((data) => data.medicalBalanceCap >= data.medicalMonthlyAccrual, {
    message: "Cap can't be less than one month's accrual",
    path: ['medicalBalanceCap'],
  });
export type MedicalSettingsInput = z.infer<typeof medicalSettingsSchema>;
