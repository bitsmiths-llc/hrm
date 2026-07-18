'use client';

import { Send } from 'lucide-react';
import { toast } from 'sonner';

import { useSendInvoice } from '@/hooks/actions/use-send-invoice';

import { Button } from '@/components/ui/button';

type SendInvoiceButtonProps = {
  payslipId: string;
  employeeName: string;
  /** Invoices only go out on a locked run — the figures aren't final before
   *  that, and the employee can't see the payslip under RLS either. */
  disabled?: boolean;
};

/** Mails one employee their payslip PDF — the per-row send/re-send. "Send
 *  notifications" fans the same email out to everyone at once; this targets a
 *  single row (e.g. to retry one that bounced). */
export function SendInvoiceButton({
  payslipId,
  employeeName,
  disabled,
}: SendInvoiceButtonProps) {
  const send = useSendInvoice(() =>
    toast.success(`Invoice sent to ${employeeName}`),
  );

  return (
    <Button
      type='button'
      variant='outline'
      size='icon'
      isLoading={send.isPending}
      disabled={disabled}
      onClick={() => send.execute({ payslip_id: payslipId })}
      title={
        disabled
          ? 'Finalize the run to send invoices'
          : `Send invoice to ${employeeName}`
      }
      aria-label={`Send invoice to ${employeeName}`}
    >
      <Send className='size-4' />
    </Button>
  );
}
