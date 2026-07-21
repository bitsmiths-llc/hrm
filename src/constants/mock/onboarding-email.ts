import { OnboardingEmailTemplate } from '@/types/hrm';

/** Placeholders the admin can drop into the subject or body — swapped for
 *  real values when each invitation is sent. `sample` is what the preview
 *  substitutes so the admin sees a realistic email. */
export const ONBOARDING_EMAIL_PLACEHOLDERS = [
  { token: '{{employee_name}}', label: 'Employee name', sample: 'Ayesha Khan' },
  { token: '{{invite_link}}', label: 'Invitation link', sample: '#' },
  {
    token: '{{company_name}}',
    label: 'Company name',
    sample: 'Bitsmiths Studio',
  },
] as const;

/** Replaces every placeholder token with its preview sample value. */
export const fillOnboardingPlaceholders = (text: string) =>
  ONBOARDING_EMAIL_PLACEHOLDERS.reduce(
    (result, { token, sample }) => result.split(token).join(sample),
    text,
  );

export const mockOnboardingEmailTemplate: OnboardingEmailTemplate = {
  subject: 'You’re invited to join {{company_name}}',
  bodyHtml:
    '<p>Hi {{employee_name}},</p>' +
    '<p>Welcome aboard! You’ve been invited to set up your account and complete onboarding at {{company_name}}.</p>' +
    '<p>Click the link below to get started — it will walk you through your profile, bank details, documents, and consent.</p>' +
    '<p><a href="{{invite_link}}">Accept your invitation</a></p>' +
    '<p>If you weren’t expecting this, you can safely ignore this email.</p>',
};
