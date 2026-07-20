'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';

import { lockPayroll } from '@/actions/payroll';

import { onError } from '@/lib/show-error-toast';

import { QueryKeys } from '@/constants/query-keys';

/** Finalize a run (admin). Invalidates the run's payslips, the run list, and the
 *  per-employee payslips key (now visible to employees under RLS). Locking no
 *  longer emails anyone — notifications are sent explicitly afterward via
 *  `useSendRunInvoices` — so `onSuccess` carries no tally. */
export function useLockPayroll(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useAction(lockPayroll, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.RUN_PAYSLIPS] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.PAYROLL_RUNS] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.PAYSLIPS] });
      onSuccess?.();
    },
    onError,
  });
}
