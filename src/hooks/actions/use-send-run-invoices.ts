'use client';

import { useAction } from 'next-safe-action/hooks';

import { sendRunInvoices } from '@/actions/payroll';

import { onError } from '@/lib/show-error-toast';

/** Mail every payslip in a locked run — the "Send notifications" button. Sends no
 *  data of its own (nothing cached changes), so there's nothing to invalidate;
 *  `onSuccess` receives the `{ sent, failed }` tally so the UI can report what
 *  actually went out. */
export function useSendRunInvoices(
  onSuccess?: (invoices: { sent: number; failed: number }) => void,
) {
  return useAction(sendRunInvoices, {
    onSuccess: ({ data }) => {
      if (data) onSuccess?.(data.invoices);
    },
    onError,
  });
}
