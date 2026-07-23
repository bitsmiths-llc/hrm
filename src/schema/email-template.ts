import { z } from 'zod';

/** The single onboarding invitation email (PRD §6.4): a subject line and a
 *  rich HTML body authored in CKEditor. The body MUST carry the
 *  `{{onboarding_link}}` token — the invite flow renders the real link into it,
 *  so a body without it would send an invitation nobody could accept. */
export const emailTemplateSchema = z.object({
  subject: z.string().trim().min(1, 'Enter a subject line').max(300),
  bodyHtml: z
    .string()
    .trim()
    .min(1, 'Write the email body')
    .refine(
      (html) => html.includes('{{onboarding_link}}'),
      'The body must include the {{onboarding_link}} token so invitees can complete onboarding.',
    ),
});

export type EmailTemplateInput = z.infer<typeof emailTemplateSchema>;
