'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';

import { createLeaveRequest } from '@/actions/leave';

import { onError } from '@/lib/show-error-toast';

import { QueryKeys } from '@/constants/query-keys';
import { type LeaveRequestInput } from '@/schema/leave';

/** Submit a leave request. Invalidates the caller's history + balance so both
 *  refresh, then hands control back via `onSuccess` (close dialog, toast).
 *
 *  The submitted values are handed back as an argument because `useAction`
 *  captures `onSuccess` in a ref on first render and never refreshes it — a
 *  caller that closed over form state would read it as it was on mount. */
export function useCreateLeaveRequest(
  onSuccess?: (input: LeaveRequestInput) => void,
) {
  const queryClient = useQueryClient();
  return useAction(createLeaveRequest, {
    onSuccess: ({ input }) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.LEAVE_REQUESTS] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.LEAVE_BALANCE] });
      onSuccess?.(input);
    },
    onError,
  });
}
