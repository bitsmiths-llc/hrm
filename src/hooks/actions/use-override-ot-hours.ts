'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';

import { overrideOtHours } from '@/actions/payroll';

import { onError } from '@/lib/show-error-toast';

import { QueryKeys } from '@/constants/query-keys';

/** Set (or clear) a per-payslip OT-hours override and recalc the run.
 *  Invalidates the run's payslips and the run list so the new totals show. */
export function useOverrideOtHours(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useAction(overrideOtHours, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.RUN_PAYSLIPS] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.PAYROLL_RUNS] });
      onSuccess?.();
    },
    onError,
  });
}
