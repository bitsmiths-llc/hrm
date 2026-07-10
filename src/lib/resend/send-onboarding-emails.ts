import 'server-only';

import { resend } from '@/lib/resend/client';

import { appConfig } from '@/config/app';
import { OnboardingApprovedEmail } from '@/emails/onboarding-approved-email';
import { OnboardingReturnedEmail } from '@/emails/onboarding-returned-email';
import { OnboardingSubmittedEmail } from '@/emails/onboarding-submitted-email';

/**
 * Transactional emails for the onboarding review lifecycle. Each function is a
 * pure "render + send" over the shared React Email templates — recipient lookup
 * and URL building stay in the calling server action, mirroring
 * `sendInviteEmail`. Every send throws on a Resend error so callers can decide
 * whether to surface or swallow it (these are best-effort notifications and
 * must never roll back the DB transition they follow).
 */

type SendOnboardingSubmittedInput = {
  /** A single admin recipient (callers fan out over all admins). */
  to: string;
  adminName?: string | null;
  employeeName: string;
  employeeEmail: string;
  reviewUrl: string;
};

/** → admin. An employee has submitted their onboarding for review. */
export async function sendOnboardingSubmittedEmail({
  to,
  adminName,
  employeeName,
  employeeEmail,
  reviewUrl,
}: SendOnboardingSubmittedInput) {
  const { error } = await resend.emails.send({
    from: appConfig.emails.sender,
    replyTo: appConfig.emails.support,
    to,
    subject: `${employeeName} submitted their onboarding for review`,
    react: OnboardingSubmittedEmail({
      adminName,
      employeeName,
      employeeEmail,
      reviewUrl,
      appName: appConfig.appName,
      baseUrl: appConfig.appUrl,
      supportEmail: appConfig.emails.support,
    }),
  });

  if (error) throw new Error(error.message);
}

type SendOnboardingApprovedInput = {
  to: string;
  fullName?: string | null;
  dashboardUrl: string;
};

/** → employee. Their submission was approved and their account is active. */
export async function sendOnboardingApprovedEmail({
  to,
  fullName,
  dashboardUrl,
}: SendOnboardingApprovedInput) {
  const { error } = await resend.emails.send({
    from: appConfig.emails.sender,
    replyTo: appConfig.emails.support,
    to,
    subject: `You're all set — welcome to ${appConfig.appName}`,
    react: OnboardingApprovedEmail({
      fullName,
      dashboardUrl,
      appName: appConfig.appName,
      baseUrl: appConfig.appUrl,
      supportEmail: appConfig.emails.support,
    }),
  });

  if (error) throw new Error(error.message);
}

type SendOnboardingReturnedInput = {
  to: string;
  fullName?: string | null;
  reviewNote: string;
  onboardingUrl: string;
};

/** → employee. Their submission was returned with a note of what to change. */
export async function sendOnboardingReturnedEmail({
  to,
  fullName,
  reviewNote,
  onboardingUrl,
}: SendOnboardingReturnedInput) {
  const { error } = await resend.emails.send({
    from: appConfig.emails.sender,
    replyTo: appConfig.emails.support,
    to,
    subject: `Action needed: a few changes to your ${appConfig.appName} onboarding`,
    react: OnboardingReturnedEmail({
      fullName,
      reviewNote,
      onboardingUrl,
      appName: appConfig.appName,
      baseUrl: appConfig.appUrl,
      supportEmail: appConfig.emails.support,
    }),
  });

  if (error) throw new Error(error.message);
}
