import 'server-only';

import { resend } from '@/lib/resend/client';

import { appConfig } from '@/config/app';
import { MedicalDecisionEmail } from '@/emails/medical-decision-email';
import { MedicalSubmittedEmail } from '@/emails/medical-submitted-email';

/**
 * Transactional emails for the medical claim lifecycle. Each is a pure
 * "render + send" over the shared React Email templates — recipient lookup and
 * URL building stay in the calling server action, mirroring
 * `send-leave-emails.ts`. Every send throws on a Resend error so callers can
 * swallow it: these are best-effort notifications and must never roll back the
 * DB write they follow.
 */

type SendMedicalSubmittedInput = {
  /** A single admin recipient (callers fan out over all admins). */
  to: string;
  adminName?: string | null;
  employeeName: string;
  summary: string;
  description: string;
  reviewUrl: string;
};

/** → admin. An employee has submitted a medical claim for review. */
export async function sendMedicalSubmittedEmail({
  to,
  adminName,
  employeeName,
  summary,
  description,
  reviewUrl,
}: SendMedicalSubmittedInput) {
  const { error } = await resend.emails.send({
    from: appConfig.emails.sender,
    replyTo: appConfig.emails.support,
    to,
    subject: `New medical claim — ${employeeName}`,
    react: MedicalSubmittedEmail({
      adminName,
      employeeName,
      summary,
      description,
      reviewUrl,
      appName: appConfig.appName,
      baseUrl: appConfig.appUrl,
      supportEmail: appConfig.emails.support,
    }),
  });

  if (error) throw new Error(error.message);
}

type SendMedicalDecisionInput = {
  to: string;
  fullName?: string | null;
  decision: 'approved' | 'rejected';
  summary: string;
  rejectionReason?: string | null;
  medicalUrl: string;
};

/** → employee. Their claim was approved or rejected (reason included). */
export async function sendMedicalDecisionEmail({
  to,
  fullName,
  decision,
  summary,
  rejectionReason,
  medicalUrl,
}: SendMedicalDecisionInput) {
  const { error } = await resend.emails.send({
    from: appConfig.emails.sender,
    replyTo: appConfig.emails.support,
    to,
    subject:
      decision === 'approved'
        ? 'Your medical claim was approved'
        : 'Your medical claim was rejected',
    react: MedicalDecisionEmail({
      fullName,
      decision,
      summary,
      rejectionReason,
      medicalUrl,
      appName: appConfig.appName,
      baseUrl: appConfig.appUrl,
      supportEmail: appConfig.emails.support,
    }),
  });

  if (error) throw new Error(error.message);
}
