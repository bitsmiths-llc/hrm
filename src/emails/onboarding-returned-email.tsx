import { Button, Heading, Section, Text } from '@react-email/components';

import { EmailLayout } from '@/emails/components/email-layout';
import { brand, emailStyles } from '@/emails/theme';

export type OnboardingReturnedEmailProps = {
  /** Full name of the employee, when known. */
  fullName?: string | null;
  /** The admin's reason/note for returning the form — shown verbatim. */
  reviewNote: string;
  /** Deep link back to the employee's onboarding wizard. */
  onboardingUrl: string;
  /** Product name, e.g. "Bitsmiths HRM". */
  appName: string;
  /** Absolute origin used to resolve the hosted logo. */
  baseUrl: string;
  /** Where replies and help requests should go. */
  supportEmail: string;
};

/**
 * Sent to the employee when an admin returns their submission for changes. The
 * admin's note is the whole point of the message, so it's rendered as a
 * prominent callout (verbatim, whitespace preserved) above the CTA that takes
 * them back to the onboarding wizard to fix and resubmit.
 */
export function OnboardingReturnedEmail({
  fullName,
  reviewNote,
  onboardingUrl,
  appName,
  baseUrl,
  supportEmail,
}: OnboardingReturnedEmailProps) {
  const greeting = fullName ? `Hi ${fullName},` : 'Hi,';

  return (
    <EmailLayout
      appName={appName}
      baseUrl={baseUrl}
      supportEmail={supportEmail}
      preview='Your onboarding needs a few changes before it can be approved'
    >
      <Section style={emailStyles.card}>
        <Heading style={emailStyles.heading}>A few changes needed</Heading>
        <Text style={emailStyles.paragraph}>{greeting}</Text>
        <Text style={emailStyles.paragraph}>
          Thanks for submitting your onboarding form. Before we can approve it,
          your reviewer has asked for a few changes.
        </Text>

        <Section
          style={{
            ...emailStyles.callout,
            borderLeftColor: brand.green,
            backgroundColor: brand.greenBg,
          }}
        >
          <Text style={{ ...emailStyles.calloutLabel, color: brand.greenDark }}>
            What needs changing
          </Text>
          <Text style={emailStyles.calloutText}>{reviewNote}</Text>
        </Section>

        <Text style={emailStyles.paragraph}>
          Head back to your onboarding form, make the updates above, and submit
          again. This note also appears on the form itself for reference.
        </Text>

        <Section style={emailStyles.buttonWrap}>
          <Button href={onboardingUrl} style={emailStyles.button}>
            Update my onboarding
          </Button>
        </Section>
      </Section>
    </EmailLayout>
  );
}

// Sample data the React Email preview server (`pnpm email`) renders with.
OnboardingReturnedEmail.PreviewProps = {
  fullName: 'Ayesha Khan',
  reviewNote:
    'Your CNIC number appears to have a typo, and your emergency contact number is missing a digit. Please correct both and resubmit.',
  onboardingUrl: 'http://localhost:3000/onboarding',
  appName: 'Bitsmiths HRM',
  baseUrl: 'http://localhost:3000',
  supportEmail: 'support@bitsmiths.studio',
} satisfies OnboardingReturnedEmailProps;

export default OnboardingReturnedEmail;
