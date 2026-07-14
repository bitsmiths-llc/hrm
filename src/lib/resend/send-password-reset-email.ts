import 'server-only';

import { resend } from '@/lib/resend/client';

import { appConfig } from '@/config/app';
import { ResetPasswordEmail } from '@/emails/reset-password-email';

type SendPasswordResetEmailInput = {
  to: string;
  fullName?: string | null;
  resetUrl: string;
};

/**
 * Sends the password-recovery email through Resend. Mirrors `sendInviteEmail`:
 * Supabase's own mailer only supports its implicit-hash link flow, so we mint
 * the recovery link ourselves (`generateLink` in `requestPasswordReset`) and
 * deliver our branded React Email template (`@/emails/reset-password-email`)
 * pointing at `/auth/reset-password`. Throws on a Resend error so the caller
 * can decide whether to surface or swallow it.
 */
export async function sendPasswordResetEmail({
  to,
  fullName,
  resetUrl,
}: SendPasswordResetEmailInput) {
  const { error } = await resend.emails.send({
    from: appConfig.emails.sender,
    replyTo: appConfig.emails.support,
    to,
    subject: `Reset your ${appConfig.appName} password`,
    react: ResetPasswordEmail({
      fullName,
      resetUrl,
      appName: appConfig.appName,
      baseUrl: appConfig.appUrl,
      supportEmail: appConfig.emails.support,
    }),
  });

  if (error) {
    throw new Error(error.message);
  }
}
