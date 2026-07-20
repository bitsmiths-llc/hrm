import { OnboardingEmailTemplate } from '@/types/hrm';

/** Placeholders the admin can drop into the subject or body — swapped for
 *  real values when each invitation is sent. */
export const ONBOARDING_EMAIL_PLACEHOLDERS = [
  { token: '{{employee_name}}', label: 'Employee name' },
  { token: '{{invite_link}}', label: 'Invitation link' },
  { token: '{{company_name}}', label: 'Company name' },
] as const;

export const mockOnboardingEmailTemplate: OnboardingEmailTemplate = {
  subject: 'You’re invited to join {{company_name}}',
  bodyHtml:
    '<p>Hi {{employee_name}},</p>' +
    '<p>Welcome aboard! You’ve been invited to set up your account and complete onboarding at {{company_name}}.</p>' +
    '<p>Click the link below to get started — it will walk you through your profile, bank details, documents, and consent.</p>' +
    '<p><a href="{{invite_link}}">Accept your invitation</a></p>' +
    '<p>If you weren’t expecting this, you can safely ignore this email.</p>',
};
