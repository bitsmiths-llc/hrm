'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';

import { addPayslipCustomField } from '@/actions/payroll';

import { onError } from '@/lib/show-error-toast';

import { QueryKeys } from '@/constants/query-keys';

/** Append an adjustment/deduction to one or many payslips and recalc the run.
 *  Invalidates the run's payslips and the run list. */
export function useAddPayslipCustomField(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useAction(addPayslipCustomField, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.RUN_PAYSLIPS] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.PAYROLL_RUNS] });
      onSuccess?.();
    },
    onError,
  });
}
