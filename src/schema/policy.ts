import { z } from 'zod';

/** Kebab-case, matching the `policies.slug` check constraint. The slug is the
 *  stable join key M3.5 uses to tie a policy to the rule it governs, so it has
 *  to survive a title rewording — it's auto-derived from the title but stays
 *  editable. */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const SLUG_MAX_LENGTH = 80;

export const policySlugSchema = z
  .string()
  .trim()
  .min(2, 'Enter a slug')
  .max(SLUG_MAX_LENGTH, `Slug must be at most ${SLUG_MAX_LENGTH} characters`)
  .regex(SLUG_PATTERN, 'Must be kebab-case (e.g. leave-policy)');

/** Title → slug, applied as the admin types the title. `NFKD` splits accented
 *  letters into base + combining mark so the base letter survives; every other
 *  run of non-alphanumerics collapses to a single hyphen. */
export const slugify = (title: string): string =>
  title
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/^-+|-+$/g, '');

/** Raised by `createPolicy` when the unique index on `policies.slug` rejects the
 *  insert (23505). Lives here rather than in the action because a `'use server'`
 *  module can only export async functions — the dialog imports it to map the
 *  error back onto the slug field. */
export const DUPLICATE_SLUG_MESSAGE = 'That slug is already taken.';

export const createPolicySchema = z.object({
  title: z.string().trim().min(2, 'Enter a policy title').max(200),
  slug: policySlugSchema,
  category: z.enum(['leave', 'medical', 'overtime', 'general']),
  contentHtml: z.string().trim().min(1, 'Add some content'),
});
export type CreatePolicyInput = z.infer<typeof createPolicySchema>;

export const publishPolicyVersionSchema = z.object({
  policyId: z.string().uuid(),
  bodyHtml: z.string().trim().min(1, 'Policy body cannot be empty'),
});
export type PublishPolicyVersionInput = z.infer<
  typeof publishPolicyVersionSchema
>;

/** Acknowledgment targets a *version*, not a policy — acknowledging v1 says
 *  nothing about v2, which is what makes a published update re-raise the
 *  prompt. Note the absence of an `employeeId`: the action takes it from the
 *  session, so there is no field here for a caller to forge. */
export const acknowledgePolicySchema = z.object({
  policyVersionId: z.string().uuid(),
});
export type AcknowledgePolicyInput = z.infer<typeof acknowledgePolicySchema>;
