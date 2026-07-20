'use client';

import { useAction } from 'next-safe-action/hooks';

import { sendPayslipInvoice } from '@/actions/payroll';

import { onError } from '@/lib/show-error-toast';

/** Mail one payslip's invoice to its employee (admin, locked runs only). Sends
 *  no data of its own — nothing cached changes, so there's nothing to
 *  invalidate. */
export function useSendInvoice(onSuccess?: () => void) {
  return useAction(sendPayslipInvoice, {
    onSuccess: () => onSuccess?.(),
    onError,
  });
}
