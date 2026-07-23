'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';

import { overrideDaysWorked } from '@/actions/payroll';

import { onError } from '@/lib/show-error-toast';

import { QueryKeys } from '@/constants/query-keys';

/** Set an inline days-worked override on a payslip and recalc the run (admin).
 *  Invalidates the run's payslips and the run list so the recomputed totals show. */
export function useOverrideDaysWorked(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useAction(overrideDaysWorked, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.RUN_PAYSLIPS] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.PAYROLL_RUNS] });
      onSuccess?.();
    },
    onError,
  });
}
