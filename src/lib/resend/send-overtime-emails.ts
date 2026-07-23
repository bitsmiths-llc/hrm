import 'server-only';

import { resend } from '@/lib/resend/client';

import { appConfig } from '@/config/app';
import { OvertimeDecisionEmail } from '@/emails/overtime-decision-email';
import { OvertimeSubmittedEmail } from '@/emails/overtime-submitted-email';

/**
 * Transactional emails for the overtime log lifecycle. Each is a pure
 * "render + send" over the shared React Email templates — recipient lookup and
 * URL building stay in the calling server action, mirroring
 * `send-leave-emails.ts`. Every send throws on a Resend error so callers can
 * swallow it: these are best-effort notifications and must never roll back the
 * DB write they follow.
 */

type SendOvertimeSubmittedInput = {
  /** A single admin recipient (callers fan out over all admins). */
  to: string;
  adminName?: string | null;
  employeeName: string;
  summary: string;
  task: string;
  reviewUrl: string;
};

/** → admin. An employee has logged overtime for review. */
export async function sendOvertimeSubmittedEmail({
  to,
  adminName,
  employeeName,
  summary,
  task,
  reviewUrl,
}: SendOvertimeSubmittedInput) {
  const { error } = await resend.emails.send({
    from: appConfig.emails.sender,
    replyTo: appConfig.emails.support,
    to,
    subject: `New overtime log — ${employeeName}`,
    react: OvertimeSubmittedEmail({
      adminName,
      employeeName,
      summary,
      task,
      reviewUrl,
      appName: appConfig.appName,
      baseUrl: appConfig.appUrl,
      supportEmail: appConfig.emails.support,
    }),
  });

  if (error) throw new Error(error.message);
}

type SendOvertimeDecisionInput = {
  to: string;
  fullName?: string | null;
  decision: 'approved' | 'rejected';
  summary: string;
  rejectionReason?: string | null;
  overtimeUrl: string;
};

/** → employee. Their overtime log was approved or rejected (reason included). */
export async function sendOvertimeDecisionEmail({
  to,
  fullName,
  decision,
  summary,
  rejectionReason,
  overtimeUrl,
}: SendOvertimeDecisionInput) {
  const { error } = await resend.emails.send({
    from: appConfig.emails.sender,
    replyTo: appConfig.emails.support,
    to,
    subject:
      decision === 'approved'
        ? 'Your overtime was approved'
        : 'Your overtime was rejected',
    react: OvertimeDecisionEmail({
      fullName,
      decision,
      summary,
      rejectionReason,
      overtimeUrl,
      appName: appConfig.appName,
      baseUrl: appConfig.appUrl,
      supportEmail: appConfig.emails.support,
    }),
  });

  if (error) throw new Error(error.message);
}
