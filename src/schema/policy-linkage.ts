import { z } from 'zod';

/** "Mark reviewed" input (BIT-25): reconcile one policy by advancing its marker
 *  to the current active version. No enforced value is ever touched — the action
 *  writes only the `policy_reconciliations` marker. The version it reconciles to
 *  is re-derived server-side from the active row, so it isn't a field here. */
export const markReviewedSchema = z.object({ policyId: z.string().uuid() });
export type MarkReviewedInput = z.infer<typeof markReviewedSchema>;
