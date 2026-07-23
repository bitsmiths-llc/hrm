'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';

import { reviewMedicalClaim } from '@/actions/medical';

import { onError } from '@/lib/show-error-toast';

import { QueryKeys } from '@/constants/query-keys';

/** Approve/reject a medical claim (admin). An approval is bounded server-side by
 *  `medical_balance()` and moves an approved employee's balance, so both the
 *  claim lists and every balance read are invalidated.
 *
 *  Callers must await `executeAsync` — `execute` does not invalidate. See the
 *  note on the wrapper below. */
export function useReviewMedical(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const action = useAction(reviewMedicalClaim, { onError });

  // Invalidate off the awaited result rather than useAction's `onSuccess`.
  // next-safe-action delivers that callback from a useEffect keyed on status,
  // but `executeAsync` resolves before React commits the render that would run
  // it — and every caller closes the review sheet on success, unmounting this
  // hook first. The effect never ran, so the queue kept showing the reviewed row
  // until the admin refreshed the tab.
  const executeAsync: typeof action.executeAsync = async (input) => {
    const result = await action.executeAsync(input);
    if (result?.data) {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.MEDICAL_CLAIMS] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.MEDICAL_BALANCE] });
      // The unified approvals queue (pending_approvals()) and the admin
      // dashboard's pending-approvals tile both count this row.
      queryClient.invalidateQueries({ queryKey: [QueryKeys.PENDING_APPROVALS] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.DASHBOARD_SUMMARY] });
      onSuccess?.();
    }
    return result;
  };

  return { ...action, executeAsync };
}
