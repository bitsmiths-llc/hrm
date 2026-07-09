import { z } from 'zod';

export const hrmSettingsSchema = z.object({
  overtimeMultiplier: z.coerce
    .number({ invalid_type_error: 'Enter a multiplier' })
    .positive('Must be greater than 0')
    .max(5, 'That looks too high — double check the rate'),
});

export type HrmSettingsInput = z.infer<typeof hrmSettingsSchema>;
