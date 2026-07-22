import { z } from 'zod';

/** Admin-editable module toggles persisted to the `system_config` singleton —
 *  one boolean per feature flag. camelCase mirrors the rest of the schema layer;
 *  the action maps these onto the snake_case DB columns. */
export const updateSystemConfigSchema = z.object({
  reimbursementsEnabled: z.boolean(),
});

export type UpdateSystemConfigInput = z.infer<typeof updateSystemConfigSchema>;
