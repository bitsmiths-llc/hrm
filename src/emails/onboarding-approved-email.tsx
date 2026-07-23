import { Button, Heading, Section, Text } from '@react-email/components';

import { EmailLayout } from '@/emails/components/email-layout';
import { brand, emailStyles } from '@/emails/theme';

export type OnboardingApprovedEmailProps = {
  /** Full name of the employee, when known. */
  fullName?: string | null;
  /** Where the newly active employee should head next (their dashboard/login). */
  dashboardUrl: string;
  /** Product name, e.g. "Bitsmiths HRM". */
  appName: string;
  /** Absolute origin used to resolve the hosted logo. */
  baseUrl: string;
  /** Where replies and help requests should go. */
  supportEmail: string;
};

/**
 * Sent to the employee once an admin approves their submission. Their account
 * is now `active`, so this is the welcome-in message with a link to the app.
 */
export function OnboardingApprovedEmail({
  fullName,
  dashboardUrl,
  appName,
  baseUrl,
  supportEmail,
}: OnboardingApprovedEmailProps) {
  const greeting = fullName ? `Hi ${fullName},` : 'Hi,';

  return (
    <EmailLayout
      appName={appName}
      baseUrl={baseUrl}
      supportEmail={supportEmail}
      preview={`You're all set — welcome to ${appName}`}
    >
      <Section style={emailStyles.card}>
        <Heading style={emailStyles.heading}>You&apos;re all set 🎉</Heading>
        <Text style={emailStyles.paragraph}>{greeting}</Text>
        <Text style={emailStyles.paragraph}>
          Good news — your onboarding has been reviewed and{' '}
          <strong>approved</strong>. Your {appName} account is now active and
          you have full access.
        </Text>

        <Section
          style={{
            ...emailStyles.callout,
            borderLeftColor: brand.green,
            backgroundColor: brand.greenBg,
          }}
        >
          <Text style={{ ...emailStyles.calloutText, color: brand.greenDark }}>
            From your dashboard you can view your profile, request leave, submit
            medical claims, and access your payslips.
          </Text>
        </Section>

        <Section style={emailStyles.buttonWrap}>
          <Button href={dashboardUrl} style={emailStyles.button}>
            Go to your dashboard
          </Button>
        </Section>

        <Text style={emailStyles.note}>
          Welcome aboard — we&apos;re glad to have you.
        </Text>
      </Section>
    </EmailLayout>
  );
}

// Sample data the React Email preview server (`pnpm email`) renders with.
OnboardingApprovedEmail.PreviewProps = {
  fullName: 'Ayesha Khan',
  dashboardUrl: 'http://localhost:3000/dashboard',
  appName: 'Bitsmiths HRM',
  baseUrl: 'http://localhost:3000',
  supportEmail: 'support@bitsmiths.studio',
} satisfies OnboardingApprovedEmailProps;

export default OnboardingApprovedEmail;
