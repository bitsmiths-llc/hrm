'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';

import { calculatePayroll } from '@/actions/payroll';

import { onError } from '@/lib/show-error-toast';

import { QueryKeys } from '@/constants/query-keys';

/** (Re)generate a run's draft payslips (admin). Invalidates the run's payslips
 *  and the run list (employee count / totals shift). */
export function useCalculatePayroll(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useAction(calculatePayroll, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.RUN_PAYSLIPS] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.PAYROLL_RUNS] });
      onSuccess?.();
    },
    onError,
  });
}
