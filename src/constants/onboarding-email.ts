/** The merge tokens an admin can drop into the onboarding email's subject or
 *  body. Both are substituted per recipient when the invite is sent (see
 *  `lib/email/render-onboarding-email.ts`); `sample` is what the editor preview
 *  substitutes so the admin sees a realistic email. `{{onboarding_link}}` is
 *  mandatory in the body — the save schema enforces it. */
export const ONBOARDING_EMAIL_TOKENS = [
  { token: '{{employee_name}}', label: 'Employee name', sample: 'Ayesha Khan' },
  {
    token: '{{onboarding_link}}',
    label: 'Onboarding link',
    sample: 'https://hrm.bitsmiths.studio/auth/accept-invitation',
  },
] as const;

/** Replaces every token with its preview sample value. Preview-only — the send
 *  path escapes token values (see `render-onboarding-email.ts`). */
export const fillOnboardingPreview = (text: string) =>
  ONBOARDING_EMAIL_TOKENS.reduce(
    (result, { token, sample }) => result.split(token).join(sample),
    text,
  );
