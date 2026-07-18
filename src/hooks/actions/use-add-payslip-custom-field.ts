'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';

import { addPayslipCustomField } from '@/actions/payroll';

import { onError } from '@/lib/show-error-toast';

import { QueryKeys } from '@/constants/query-keys';

/** Append an adjustment/deduction to one or many payslips and recalc the run.
 *  Invalidates the run's payslips and the run list. `onSuccess` gets what went
 *  in — the action returns nothing, and the grid only moves once the recalc
 *  lands, so echoing the input back is the one way a caller can name the item
 *  and the headcount in its toast. */
export function useAddPayslipCustomField(
  onSuccess?: (added: { label: string; amount: number; count: number }) => void,
) {
  const queryClient = useQueryClient();
  return useAction(addPayslipCustomField, {
    onSuccess: ({ input }) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.RUN_PAYSLIPS] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.PAYROLL_RUNS] });
      onSuccess?.({
        label: input.label,
        amount: Number(input.amount),
        count: input.payslip_ids.length,
      });
    },
    onError,
  });
}
