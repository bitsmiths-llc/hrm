'use server';

import { sanitizeHtml } from '@/lib/sanitize-html';
import { authActionClient } from '@/lib/server/safe-action';

import { emailTemplateSchema } from '@/schema/email-template';

/**
 * Admin-only. Persist the single onboarding email template.
 *
 * The body is allow-list sanitized at this write boundary (a stored-XSS guard)
 * before it ever reaches the DB — the invite flow later renders it with
 * `dangerouslySetInnerHTML` / injects it into an email, so sanitizing here is
 * what makes that safe. The role check is server-side even though RLS
 * (`oet_admin`) also enforces admin-only writes, mirroring every other action.
 */
export const updateOnboardingEmailTemplate = authActionClient
  .schema(emailTemplateSchema)
  .action(async ({ parsedInput, ctx: { supabase, authUser } }) => {
    const user = authUser.user;
    if (!user || user.app_metadata.role !== 'admin') {
      throw new Error('Forbidden');
    }

    // `updated_at` is refreshed by the set_updated_at trigger; we only stamp the
    // actor here.
    const { error } = await supabase
      .from('onboarding_email_template')
      .update({
        subject: parsedInput.subject,
        body_html: sanitizeHtml(parsedInput.bodyHtml),
        updated_by: user.id,
      })
      .eq('id', true);
    if (error) throw new Error(error.message);

    return { success: true };
  });
