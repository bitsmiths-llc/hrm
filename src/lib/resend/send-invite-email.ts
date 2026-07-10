import 'server-only';

import { resend } from '@/lib/resend/client';

import { appConfig } from '@/config/app';
import { InviteEmail } from '@/emails/invite-email';

type SendInviteEmailInput = {
  to: string;
  fullName?: string | null;
  inviteUrl: string;
};

/**
 * Sends the invite email through Resend. Supabase's own mailer only supports
 * the implicit-hash link flow; sending it ourselves lets the link point at
 * `/auth/confirm` with a `token_hash` (see `inviteEmployee`) and lets us render
 * our branded React Email template (`@/emails/invite-email`).
 */
export async function sendInviteEmail({
  to,
  fullName,
  inviteUrl,
}: SendInviteEmailInput) {
  const { error } = await resend.emails.send({
    from: appConfig.emails.sender,
    replyTo: appConfig.emails.support,
    to,
    subject: `You're invited to join ${appConfig.appName}`,
    react: InviteEmail({
      fullName,
      inviteUrl,
      appName: appConfig.appName,
      baseUrl: appConfig.appUrl,
      supportEmail: appConfig.emails.support,
    }),
  });

  if (error) {
    throw new Error(error.message);
  }
}
