import { Button, Heading, Section, Text } from '@react-email/components';

import { EmailLayout } from '@/emails/components/email-layout';
import { brand, emailStyles } from '@/emails/theme';

export type InvoiceEmailProps = {
  /** Full name of the employee, when known. */
  fullName?: string | null;
  /** Human-readable pay period, e.g. "June 2026". */
  cycleLabel: string;
  /** Pre-formatted net pay, e.g. "Rs 245,000" — formatting stays with the
   *  caller so this template never reaches for a locale/currency helper. */
  netPayLabel: string;
  /** Deep link back to the employee's payslips page. */
  payslipsUrl: string;
  /** Product name, e.g. "Bitsmiths HRM". */
  appName: string;
  /** Absolute origin used to resolve the hosted logo. */
  baseUrl: string;
  /** Where replies and help requests should go. */
  supportEmail: string;
};

/**
 * Sent to the employee once their payroll run is locked — the point at which the
 * figures are frozen and their payslip becomes visible to them under RLS. The
 * payslip PDF rides along as an attachment (see `send-invoice-emails.ts`), so
 * this body stays a short cover note: the period, the net figure, and a link
 * back for the itemized view.
 */
export function InvoiceEmail({
  fullName,
  cycleLabel,
  netPayLabel,
  payslipsUrl,
  appName,
  baseUrl,
  supportEmail,
}: InvoiceEmailProps) {
  const greeting = fullName ? `Hi ${fullName},` : 'Hi,';

  return (
    <EmailLayout
      appName={appName}
      baseUrl={baseUrl}
      supportEmail={supportEmail}
      preview={`Your ${cycleLabel} payslip is ready`}
    >
      <Section style={emailStyles.card}>
        <Heading style={emailStyles.heading}>Your payslip is ready</Heading>
        <Text style={emailStyles.paragraph}>{greeting}</Text>
        <Text style={emailStyles.paragraph}>
          Your payslip for <strong>{cycleLabel}</strong> has been finalized and
          is attached to this email as a PDF.
        </Text>

        <Section
          style={{
            ...emailStyles.callout,
            borderLeftColor: brand.green,
            backgroundColor: brand.greenBg,
          }}
        >
          <Text style={{ ...emailStyles.calloutLabel, color: brand.greenDark }}>
            Net salary · {cycleLabel}
          </Text>
          <Text style={{ ...emailStyles.calloutText, margin: 0 }}>
            {netPayLabel}
          </Text>
        </Section>

        <Text style={emailStyles.paragraph}>
          The attached PDF itemizes every earning and deduction that made up
          this figure. You can find this and every earlier payslip on your
          payslips page at any time.
        </Text>

        <Section style={emailStyles.buttonWrap}>
          <Button href={payslipsUrl} style={emailStyles.button}>
            View my payslips
          </Button>
        </Section>

        <Text style={emailStyles.note}>
          Something look wrong? Reply to this email and we&apos;ll take a look.
        </Text>
      </Section>
    </EmailLayout>
  );
}

// Sample data the React Email preview server (`pnpm email`) renders with.
InvoiceEmail.PreviewProps = {
  fullName: 'Ayesha Khan',
  cycleLabel: 'June 2026',
  netPayLabel: 'Rs 245,000',
  payslipsUrl: 'http://localhost:3000/payslips',
  appName: 'Bitsmiths HRM',
  baseUrl: 'http://localhost:3000',
  supportEmail: 'support@bitsmiths.studio',
} satisfies InvoiceEmailProps;

export default InvoiceEmail;
