import { z } from 'zod';

const baseHrmSettingsSchema = z.object({
  overtimeMultiplier: z.coerce
    .number({ invalid_type_error: 'Enter a multiplier' })
    .positive('Must be greater than 0')
    .max(5, 'That looks too high — double check the rate'),
  taxRatePercent: z.coerce
    .number({ invalid_type_error: 'Enter a percentage' })
    .min(0, 'Must be 0 or greater')
    .max(100, 'Cannot exceed 100%'),
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

/** Every numeric HRM setting edited together in the Configuration card. */
export const hrmSettingsSchema = baseHrmSettingsSchema.refine(
  (data) => data.medicalBalanceCap >= data.medicalMonthlyAccrual,
  {
    message: "Cap can't be less than one month's accrual",
    path: ['medicalBalanceCap'],
  },
);
export type HrmSettingsInput = z.infer<typeof hrmSettingsSchema>;
