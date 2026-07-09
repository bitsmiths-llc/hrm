import { z } from 'zod';

export const createPolicySchema = z.object({
  title: z.string().min(2, 'Enter a policy title'),
  category: z.enum(['leave', 'medical', 'overtime', 'general']),
  contentHtml: z.string().min(1, 'Add some content'),
});
export type CreatePolicyInput = z.infer<typeof createPolicySchema>;

export const publishPolicyVersionSchema = z.object({
  contentHtml: z.string().min(1, 'Add some content'),
  changeSummary: z
    .string()
    .min(10, 'Describe what changed (at least 10 characters)'),
});
export type PublishPolicyVersionInput = z.infer<
  typeof publishPolicyVersionSchema
>;
