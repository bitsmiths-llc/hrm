import { Button, Heading, Section, Text } from '@react-email/components';

import { EmailLayout } from '@/emails/components/email-layout';
import { brand, emailStyles } from '@/emails/theme';

export type MedicalSubmittedEmailProps = {
  /** Full name of the admin recipient, when known. */
  adminName?: string | null;
  /** Name of the employee who submitted (falls back to their email). */
  employeeName: string;
  /** Human-readable one-liner, e.g. "Doctor Consultation · PKR 3,000 · Self". */
  summary: string;
  /** The employee's description of the expense. */
  description: string;
  /** Deep link to the admin approvals queue. */
  reviewUrl: string;
  /** Product name, e.g. "Bitsmiths HRM". */
  appName: string;
  /** Absolute origin used to resolve the hosted logo. */
  baseUrl: string;
  /** Where replies and help requests should go. */
  supportEmail: string;
};

/**
 * Sent to every active admin when an employee submits a medical claim. Mirrors
 * `LeaveSubmittedEmail` — the CTA drops the admin onto the approvals queue where
 * they can approve or reject (subject to the server-side balance bound).
 */
export function MedicalSubmittedEmail({
  adminName,
  employeeName,
  summary,
  description,
  reviewUrl,
  appName,
  baseUrl,
  supportEmail,
}: MedicalSubmittedEmailProps) {
  const greeting = adminName ? `Hi ${adminName},` : 'Hi,';

  return (
    <EmailLayout
      appName={appName}
      baseUrl={baseUrl}
      supportEmail={supportEmail}
      preview={`${employeeName} submitted a medical claim`}
    >
      <Section style={{ ...emailStyles.card, borderTopColor: brand.blue }}>
        <Heading style={emailStyles.heading}>New medical claim</Heading>
        <Text style={emailStyles.paragraph}>{greeting}</Text>
        <Text style={emailStyles.paragraph}>
          <strong>{employeeName}</strong> submitted a medical claim. It&apos;s
          now waiting in your approvals queue.
        </Text>

        <Section
          style={{
            ...emailStyles.callout,
            borderLeftColor: brand.blue,
            backgroundColor: '#eff6ff',
          }}
        >
          <Text style={emailStyles.detailRow}>
            <span style={emailStyles.detailLabel}>Claim: </span>
            {summary}
          </Text>
          <Text style={{ ...emailStyles.detailRow, margin: 0 }}>
            <span style={emailStyles.detailLabel}>Details: </span>
            {description}
          </Text>
        </Section>

        <Text style={emailStyles.paragraph}>
          Review the claim and its proof files, then approve or reject it from
          the queue.
        </Text>

        <Section style={emailStyles.buttonWrap}>
          <Button href={reviewUrl} style={emailStyles.button}>
            Review in approvals
          </Button>
        </Section>
      </Section>
    </EmailLayout>
  );
}

export default MedicalSubmittedEmail;
