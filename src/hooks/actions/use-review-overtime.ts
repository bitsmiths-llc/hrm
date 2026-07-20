'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';

import { reviewOvertimeLog } from '@/actions/overtime';

import { onError } from '@/lib/show-error-toast';

import { QueryKeys } from '@/constants/query-keys';

/** Approve/reject an overtime log (admin). A decision moves the row out of
 *  `pending`, so the overtime lists (own history + admin queue, which share the
 *  OVERTIME_LOGS key) are invalidated.
 *
 *  Callers must await `executeAsync` — `execute` does not invalidate. See the
 *  note on the wrapper below. */
export function useReviewOvertime(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const action = useAction(reviewOvertimeLog, { onError });

  // Invalidate off the awaited result rather than useAction's `onSuccess`.
  // next-safe-action delivers that callback from a useEffect keyed on status,
  // but `executeAsync` resolves before React commits the render that would run
  // it — and every caller closes the review sheet on success, unmounting this
  // hook first. The effect never ran, so the queue kept showing the reviewed row
  // until the admin refreshed the tab.
  const executeAsync: typeof action.executeAsync = async (input) => {
    const result = await action.executeAsync(input);
    if (result?.data) {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.OVERTIME_LOGS] });
      // The admin dashboard's pending-approvals tile counts this row.
      queryClient.invalidateQueries({ queryKey: [QueryKeys.DASHBOARD_SUMMARY] });
      onSuccess?.();
    }
    return result;
  };

  return { ...action, executeAsync };
}
