'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';

import { removePayslipCustomField } from '@/actions/payroll';

import { onError } from '@/lib/show-error-toast';

import { QueryKeys } from '@/constants/query-keys';

/** Remove a custom line item from a payslip and recalc the run. Invalidates the
 *  run's payslips and the run list. */
export function useRemovePayslipCustomField(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useAction(removePayslipCustomField, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.RUN_PAYSLIPS] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.PAYROLL_RUNS] });
      onSuccess?.();
    },
    onError,
  });
}
