import { Button, Heading, Section, Text } from '@react-email/components';

import { EmailLayout } from '@/emails/components/email-layout';
import { brand, emailStyles } from '@/emails/theme';

export type OvertimeDecisionEmailProps = {
  /** Full name of the employee, when known. */
  fullName?: string | null;
  /** The admin's decision on the log. */
  decision: 'approved' | 'rejected';
  /** Human-readable one-liner, e.g. "3 hr(s) · HRM Frontend". */
  summary: string;
  /** The admin's reason — required and rendered when rejected. */
  rejectionReason?: string | null;
  /** Deep link back to the employee's overtime page. */
  overtimeUrl: string;
  /** Product name, e.g. "Bitsmiths HRM". */
  appName: string;
  /** Absolute origin used to resolve the hosted logo. */
  baseUrl: string;
  /** Where replies and help requests should go. */
  supportEmail: string;
};

/**
 * Sent to the employee when an admin approves or rejects their overtime log.
 * Approved reads as a green confirmation (pay is computed at the payroll run);
 * rejected surfaces the admin's reason verbatim in a callout (the same reason
 * shown in their history UI).
 */
export function OvertimeDecisionEmail({
  fullName,
  decision,
  summary,
  rejectionReason,
  overtimeUrl,
  appName,
  baseUrl,
  supportEmail,
}: OvertimeDecisionEmailProps) {
  const greeting = fullName ? `Hi ${fullName},` : 'Hi,';
  const approved = decision === 'approved';

  return (
    <EmailLayout
      appName={appName}
      baseUrl={baseUrl}
      supportEmail={supportEmail}
      preview={`Your overtime log was ${decision}`}
    >
      <Section style={emailStyles.card}>
        <Heading style={emailStyles.heading}>
          {approved ? 'Overtime approved' : 'Overtime rejected'}
        </Heading>
        <Text style={emailStyles.paragraph}>{greeting}</Text>
        <Text style={emailStyles.paragraph}>
          Your overtime log — <strong>{summary}</strong> — was{' '}
          <strong>{decision}</strong>.
        </Text>

        {approved ? (
          <Section
            style={{
              ...emailStyles.callout,
              borderLeftColor: brand.green,
              backgroundColor: brand.greenBg,
            }}
          >
            <Text style={{ ...emailStyles.calloutText, margin: 0 }}>
              These hours will be paid out at the configured overtime rate for
              the pay period they fall in, calculated during the payroll run.
            </Text>
          </Section>
        ) : (
          <Section
            style={{
              ...emailStyles.callout,
              borderLeftColor: brand.green,
              backgroundColor: brand.greenBg,
            }}
          >
            <Text
              style={{ ...emailStyles.calloutLabel, color: brand.greenDark }}
            >
              Reason for rejection
            </Text>
            <Text style={emailStyles.calloutText}>
              {rejectionReason || 'No reason was provided.'}
            </Text>
          </Section>
        )}

        <Section style={emailStyles.buttonWrap}>
          <Button href={overtimeUrl} style={emailStyles.button}>
            View my overtime
          </Button>
        </Section>
      </Section>
    </EmailLayout>
  );
}

// Sample data the React Email preview server (`pnpm email`) renders with.
// Flip `decision` to 'rejected' to preview the rejection-reason callout.
OvertimeDecisionEmail.PreviewProps = {
  fullName: 'Ayesha Khan',
  decision: 'approved',
  summary: '3 hr(s) · HRM Frontend',
  rejectionReason:
    'This was scoped as regular sprint work, not overtime — please check with your lead first.',
  overtimeUrl: 'http://localhost:3000/overtime',
  appName: 'Bitsmiths HRM',
  baseUrl: 'http://localhost:3000',
  supportEmail: 'support@bitsmiths.studio',
} satisfies OvertimeDecisionEmailProps;

export default OvertimeDecisionEmail;
