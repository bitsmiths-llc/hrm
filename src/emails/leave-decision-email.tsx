import { Button, Heading, Section, Text } from '@react-email/components';

import { EmailLayout } from '@/emails/components/email-layout';
import { brand, emailStyles } from '@/emails/theme';

export type LeaveDecisionEmailProps = {
  /** Full name of the employee, when known. */
  fullName?: string | null;
  /** The admin's decision on the request. */
  decision: 'approved' | 'rejected';
  /** Human-readable one-liner, e.g. "Paid Leave · 3 day(s) from Jul 8, 2026". */
  summary: string;
  /** The admin's reason — required and rendered when rejected. */
  rejectionReason?: string | null;
  /** Deep link back to the employee's leave page. */
  leaveUrl: string;
  /** Product name, e.g. "Bitsmiths HRM". */
  appName: string;
  /** Absolute origin used to resolve the hosted logo. */
  baseUrl: string;
  /** Where replies and help requests should go. */
  supportEmail: string;
};

/**
 * Sent to the employee when an admin approves or rejects their leave request.
 * Approved reads as a green confirmation; rejected surfaces the admin's reason
 * verbatim in an amber callout (the same reason shown in their history UI).
 */
export function LeaveDecisionEmail({
  fullName,
  decision,
  summary,
  rejectionReason,
  leaveUrl,
  appName,
  baseUrl,
  supportEmail,
}: LeaveDecisionEmailProps) {
  const greeting = fullName ? `Hi ${fullName},` : 'Hi,';
  const approved = decision === 'approved';

  return (
    <EmailLayout
      appName={appName}
      baseUrl={baseUrl}
      supportEmail={supportEmail}
      preview={`Your leave request was ${decision}`}
    >
      <Section style={emailStyles.card}>
        <Heading style={emailStyles.heading}>
          {approved ? 'Leave request approved' : 'Leave request rejected'}
        </Heading>
        <Text style={emailStyles.paragraph}>{greeting}</Text>
        <Text style={emailStyles.paragraph}>
          Your leave request — <strong>{summary}</strong> — was{' '}
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
              Your balance has been updated to reflect this leave. Enjoy your
              time off.
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
          <Button href={leaveUrl} style={emailStyles.button}>
            View my leave
          </Button>
        </Section>
      </Section>
    </EmailLayout>
  );
}

// Sample data the React Email preview server (`pnpm email`) renders with.
// Flip `decision` to 'rejected' to preview the amber rejection-reason callout.
LeaveDecisionEmail.PreviewProps = {
  fullName: 'Ayesha Khan',
  decision: 'approved',
  summary: 'Paid Leave · 3 day(s) from Jul 8, 2026',
  rejectionReason: 'Insufficient leave balance for the requested dates.',
  leaveUrl: 'http://localhost:3000/leave',
  appName: 'Bitsmiths HRM',
  baseUrl: 'http://localhost:3000',
  supportEmail: 'support@bitsmiths.studio',
} satisfies LeaveDecisionEmailProps;

export default LeaveDecisionEmail;
