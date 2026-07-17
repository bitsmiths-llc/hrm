'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';

import { lockPayroll } from '@/actions/payroll';

import { onError } from '@/lib/show-error-toast';

import { QueryKeys } from '@/constants/query-keys';

/** Lock a run (admin). Invalidates the run's payslips, the run list, and the
 *  per-employee payslips key (now visible to employees under RLS). Locking also
 *  emails every employee their invoice, so `onSuccess` receives that tally —
 *  the send is best-effort server-side and reports rather than throws. */
export function useLockPayroll(
  onSuccess?: (invoices: { sent: number; failed: number }) => void,
) {
  const queryClient = useQueryClient();
  return useAction(lockPayroll, {
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.RUN_PAYSLIPS] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.PAYROLL_RUNS] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.PAYSLIPS] });
      if (data) onSuccess?.(data.invoices);
    },
    onError,
  });
}
