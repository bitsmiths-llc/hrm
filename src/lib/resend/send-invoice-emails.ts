import 'server-only';

import { resend } from '@/lib/resend/client';

import { appConfig } from '@/config/app';
import { InvoiceEmail } from '@/emails/invoice-email';

/**
 * The payslip ("invoice") email an employee gets once their payroll run is
 * locked. A pure "render + send" over the shared React Email template —
 * recipient lookup, PDF rendering and URL building stay in the calling server
 * action, mirroring `send-overtime-emails.ts`. Throws on a Resend error so
 * callers can swallow it: this is a best-effort notification and must never roll
 * back the lock it follows.
 */

type SendInvoiceEmailInput = {
  to: string;
  fullName?: string | null;
  /** Human-readable pay period, e.g. "June 2026". */
  cycleLabel: string;
  /** Pre-formatted net pay, e.g. "Rs 245,000". */
  netPayLabel: string;
  payslipsUrl: string;
  /** The rendered payslip PDF, attached to the message. */
  pdf: { filename: string; content: Buffer };
};

/** → employee. Their payslip for a locked run, PDF attached. */
export async function sendInvoiceEmail({
  to,
  fullName,
  cycleLabel,
  netPayLabel,
  payslipsUrl,
  pdf,
}: SendInvoiceEmailInput) {
  const { error } = await resend.emails.send({
    from: appConfig.emails.sender,
    replyTo: appConfig.emails.support,
    to,
    subject: `Your payslip for ${cycleLabel}`,
    react: InvoiceEmail({
      fullName,
      cycleLabel,
      netPayLabel,
      payslipsUrl,
      appName: appConfig.appName,
      baseUrl: appConfig.appUrl,
      supportEmail: appConfig.emails.support,
    }),
    attachments: [{ filename: pdf.filename, content: pdf.content }],
  });

  if (error) throw new Error(error.message);
}
