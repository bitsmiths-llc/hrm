import { Button, Heading, Section, Text } from '@react-email/components';

import { EmailLayout } from '@/emails/components/email-layout';
import { brand, emailStyles } from '@/emails/theme';

export type MedicalDecisionEmailProps = {
  /** Full name of the employee, when known. */
  fullName?: string | null;
  /** The admin's decision on the claim. */
  decision: 'approved' | 'rejected';
  /** Human-readable one-liner, e.g. "Doctor Consultation · PKR 3,000 · Self". */
  summary: string;
  /** The admin's reason — required and rendered when rejected. */
  rejectionReason?: string | null;
  /** Deep link back to the employee's medical page. */
  medicalUrl: string;
  /** Product name, e.g. "Bitsmiths HRM". */
  appName: string;
  /** Absolute origin used to resolve the hosted logo. */
  baseUrl: string;
  /** Where replies and help requests should go. */
  supportEmail: string;
};

/**
 * Sent to the employee when an admin approves or rejects their medical claim.
 * Approved reads as a green confirmation; rejected surfaces the admin's reason
 * verbatim in an amber callout (the same reason shown in their history UI).
 */
export function MedicalDecisionEmail({
  fullName,
  decision,
  summary,
  rejectionReason,
  medicalUrl,
  appName,
  baseUrl,
  supportEmail,
}: MedicalDecisionEmailProps) {
  const greeting = fullName ? `Hi ${fullName},` : 'Hi,';
  const approved = decision === 'approved';

  return (
    <EmailLayout
      appName={appName}
      baseUrl={baseUrl}
      supportEmail={supportEmail}
      preview={`Your medical claim was ${decision}`}
    >
      <Section style={emailStyles.card}>
        <Heading style={emailStyles.heading}>
          {approved ? 'Medical claim approved' : 'Medical claim rejected'}
        </Heading>
        <Text style={emailStyles.paragraph}>{greeting}</Text>
        <Text style={emailStyles.paragraph}>
          Your medical claim — <strong>{summary}</strong> — was{' '}
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
              This claim has been deducted from your medical balance and will be
              reflected in your next payslip&apos;s medical line.
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
          <Button href={medicalUrl} style={emailStyles.button}>
            View my claims
          </Button>
        </Section>
      </Section>
    </EmailLayout>
  );
}

// Sample data the React Email preview server (`pnpm email`) renders with.
// Flip `decision` to 'rejected' to preview the amber rejection-reason callout.
MedicalDecisionEmail.PreviewProps = {
  fullName: 'Ayesha Khan',
  decision: 'approved',
  summary: 'Doctor Consultation · PKR 3,000 · Self',
  rejectionReason: 'The attached receipt was not legible. Please resubmit.',
  medicalUrl: 'http://localhost:3000/medical',
  appName: 'Bitsmiths HRM',
  baseUrl: 'http://localhost:3000',
  supportEmail: 'support@bitsmiths.studio',
} satisfies MedicalDecisionEmailProps;

export default MedicalDecisionEmail;
