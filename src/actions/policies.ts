'use server';

import { returnValidationErrors } from 'next-safe-action';

import { sanitizeHtml } from '@/lib/sanitize-html';
import { authActionClient } from '@/lib/server/safe-action';

import {
  createPolicySchema,
  DUPLICATE_SLUG_MESSAGE,
  publishPolicyVersionSchema,
} from '@/schema/policy';

/** Admin gate. Server-side even though `public.is_admin()` guards both RPCs and
 *  the `*_admin_all` RLS policies — defense in depth, mirroring
 *  `actions/system-config.ts`. */
const requireAdmin = (role?: string) => {
  if (role !== 'admin') throw new Error('Forbidden');
};

/**
 * Create a policy and publish its version 1 (admin only). Both rows land in a
 * single transaction inside `create_policy` — a plain insert followed by a
 * separate publish could leave a policy with no versions behind.
 *
 * The CKEditor body is sanitized here, before it reaches the database, so only
 * clean markup is ever persisted (stored-XSS guard).
 */
export const createPolicy = authActionClient
  .schema(createPolicySchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);

    const { data, error } = await supabase.rpc('create_policy', {
      p_title: parsedInput.title,
      p_slug: parsedInput.slug,
      p_category: parsedInput.category,
      p_body_html: sanitizeHtml(parsedInput.contentHtml),
    });
    if (error) {
      // Surfaced as a field error rather than a thrown server error so the
      // dialog can pin it under the Slug input instead of a generic toast.
      if (error.code === '23505') {
        returnValidationErrors(createPolicySchema, {
          slug: { _errors: [DUPLICATE_SLUG_MESSAGE] },
        });
      }
      throw new Error(error.message);
    }

    return data;
  });

/**
 * Publish a new version of an existing policy (admin only). Never sets
 * `version` or `is_active` itself: `publish_policy_version` computes the next
 * version number and deactivates the previous active row in one transaction,
 * so history stays append-only and exactly one version is ever active.
 */
export const publishPolicyVersion = authActionClient
  .schema(publishPolicyVersionSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    requireAdmin(authUser.user?.app_metadata.role);

    const { data, error } = await supabase.rpc('publish_policy_version', {
      p_policy_id: parsedInput.policyId,
      p_body_html: sanitizeHtml(parsedInput.bodyHtml),
    });
    if (error) throw new Error(error.message);

    return data;
  });
