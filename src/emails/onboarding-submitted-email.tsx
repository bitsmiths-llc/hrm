import { Button, Heading, Section, Text } from '@react-email/components';

import { EmailLayout } from '@/emails/components/email-layout';
import { brand, emailStyles } from '@/emails/theme';

export type OnboardingSubmittedEmailProps = {
  /** Full name of the admin recipient, when known. */
  adminName?: string | null;
  /** Name of the employee who submitted (falls back to their email). */
  employeeName: string;
  /** Email of the employee who submitted. */
  employeeEmail: string;
  /** Deep link to the employee's profile / review surface in the admin app. */
  reviewUrl: string;
  /** Product name, e.g. "Bitsmiths HRM". */
  appName: string;
  /** Absolute origin used to resolve the hosted logo. */
  baseUrl: string;
  /** Where replies and help requests should go. */
  supportEmail: string;
};

/**
 * Sent to every admin when an employee submits their onboarding form. The
 * submission now sits in the review queue awaiting an approve-or-return
 * decision, so the CTA drops the admin straight onto that person's record.
 */
export function OnboardingSubmittedEmail({
  adminName,
  employeeName,
  employeeEmail,
  reviewUrl,
  appName,
  baseUrl,
  supportEmail,
}: OnboardingSubmittedEmailProps) {
  const greeting = adminName ? `Hi ${adminName},` : 'Hi,';

  return (
    <EmailLayout
      appName={appName}
      baseUrl={baseUrl}
      supportEmail={supportEmail}
      preview={`${employeeName} submitted their onboarding for review`}
    >
      <Section style={emailStyles.card}>
        <Heading style={emailStyles.heading}>New onboarding submission</Heading>
        <Text style={emailStyles.paragraph}>{greeting}</Text>
        <Text style={emailStyles.paragraph}>
          <strong>{employeeName}</strong> has completed and submitted their
          onboarding form. It&apos;s now waiting in your review queue for
          approval.
        </Text>

        <Section
          style={{
            ...emailStyles.callout,
            borderLeftColor: brand.green,
            backgroundColor: brand.greenBg,
          }}
        >
          <Text style={emailStyles.detailRow}>
            <span style={emailStyles.detailLabel}>Employee: </span>
            {employeeName}
          </Text>
          <Text style={{ ...emailStyles.detailRow, margin: 0 }}>
            <span style={emailStyles.detailLabel}>Email: </span>
            {employeeEmail}
          </Text>
        </Section>

        <Text style={emailStyles.paragraph}>
          Review their details, then approve to activate their account or return
          the form with a note if something needs changing.
        </Text>

        <Section style={emailStyles.buttonWrap}>
          <Button href={reviewUrl} style={emailStyles.button}>
            Review submission
          </Button>
        </Section>
      </Section>
    </EmailLayout>
  );
}

// Sample data the React Email preview server (`pnpm email`) renders with.
OnboardingSubmittedEmail.PreviewProps = {
  adminName: 'Bilal Ahmed',
  employeeName: 'Ayesha Khan',
  employeeEmail: 'ayesha.khan@example.com',
  reviewUrl: 'http://localhost:3000/admin/employees/preview',
  appName: 'Bitsmiths HRM',
  baseUrl: 'http://localhost:3000',
  supportEmail: 'support@bitsmiths.studio',
} satisfies OnboardingSubmittedEmailProps;

export default OnboardingSubmittedEmail;
