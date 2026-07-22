import { Button, Heading, Section, Text } from '@react-email/components';

import { EmailLayout } from '@/emails/components/email-layout';
import { emailStyles } from '@/emails/theme';

export type ResetPasswordEmailProps = {
  /** Full name of the account holder, when known. */
  fullName?: string | null;
  /** One-time link that lands on `/auth/reset-password` with the recovery token. */
  resetUrl: string;
  /** Product name, e.g. "Bitsmiths HRM". */
  appName: string;
  /** Absolute origin used to resolve the hosted logo (email clients can't load
   *  SVG/relative assets). */
  baseUrl: string;
  /** Where replies and help requests should go. */
  supportEmail: string;
};

/**
 * Sent when someone requests a password reset from the "Forgot password?" flow.
 * We deliver it ourselves through Resend (rather than Supabase's own mailer) so
 * the recovery link points at our branded `/auth/reset-password` flow and the
 * message reads as one system with the rest of the transactional emails.
 */
export function ResetPasswordEmail({
  fullName,
  resetUrl,
  appName,
  baseUrl,
  supportEmail,
}: ResetPasswordEmailProps) {
  const greeting = fullName ? `Hi ${fullName},` : 'Hi,';

  return (
    <EmailLayout
      appName={appName}
      baseUrl={baseUrl}
      supportEmail={supportEmail}
      preview={`Reset your ${appName} password`}
    >
      <Section style={emailStyles.card}>
        <Heading style={emailStyles.heading}>Reset your password</Heading>
        <Text style={emailStyles.paragraph}>{greeting}</Text>
        <Text style={emailStyles.paragraph}>
          We received a request to reset the password for your{' '}
          <strong>{appName}</strong> account. Click the button below to choose a
          new one.
        </Text>

        <Section style={emailStyles.buttonWrap}>
          <Button href={resetUrl} style={emailStyles.button}>
            Choose a new password
          </Button>
        </Section>

        <Text style={emailStyles.note}>
          For your security, this link will expire and can only be used once.
        </Text>
      </Section>

      <Section>
        <Text style={emailStyles.footer}>
          Didn&apos;t request this? You can safely ignore this email — your
          password won&apos;t change until you open the link above and set a new
          one.
        </Text>
      </Section>
    </EmailLayout>
  );
}

// Sample data the React Email preview server (`pnpm email`) renders with.
ResetPasswordEmail.PreviewProps = {
  fullName: 'Ayesha Khan',
  resetUrl:
    'http://localhost:3000/auth/reset-password?token_hash=preview-token&type=recovery',
  appName: 'Bitsmiths HRM',
  baseUrl: 'http://localhost:3000',
  supportEmail: 'support@bitsmiths.studio',
} satisfies ResetPasswordEmailProps;

export default ResetPasswordEmail;
