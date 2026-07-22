import { z } from 'zod';

/** Mark a single notification read. The row must belong to the caller — that is
 *  enforced by RLS (`notif_update_own`) and re-asserted by the action's
 *  `recipient_id` filter, so this only needs the id. */
export const markReadSchema = z.object({ id: z.string().uuid() });
export type MarkReadInput = z.infer<typeof markReadSchema>;
