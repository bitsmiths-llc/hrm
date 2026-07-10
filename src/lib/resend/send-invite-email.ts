import 'server-only';

import { resend } from '@/lib/resend/client';

import { appConfig } from '@/config/app';

type SendInviteEmailInput = {
  to: string;
  fullName?: string | null;
  inviteUrl: string;
};

/**
 * Sends the invite email through Resend. Supabase's own mailer only supports
 * the implicit-hash link flow; sending it ourselves lets the link point at
 * `/auth/confirm` with a `token_hash` (see `inviteEmployee`) and gives us a
 * branded template.
 */
export async function sendInviteEmail({
  to,
  fullName,
  inviteUrl,
}: SendInviteEmailInput) {
  const greeting = fullName ? `Hi ${fullName},` : 'Hi,';

  const { error } = await resend.emails.send({
    from: appConfig.emails.sender,
    to,
    subject: `You're invited to join ${appConfig.appName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
        <h1 style="font-size: 20px;">${appConfig.appName}</h1>
        <p>${greeting}</p>
        <p>You've been invited to join ${appConfig.appName}. Click the button below to set your password and get started.</p>
        <p style="margin: 32px 0;">
          <a
            href="${inviteUrl}"
            style="background: #04CD77; color: #ffffff; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-weight: 600;"
          >
            Accept invitation
          </a>
        </p>
        <p style="font-size: 13px; color: #6b7280;">
          If the button doesn't work, copy and paste this link into your browser:<br />
          <a href="${inviteUrl}" style="color: #6b7280;">${inviteUrl}</a>
        </p>
        <p style="font-size: 13px; color: #6b7280;">This link will expire and can only be used once.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }
}
