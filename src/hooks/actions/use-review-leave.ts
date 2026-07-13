'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';

import { reviewLeaveRequest } from '@/actions/leave';

import { onError } from '@/lib/show-error-toast';

import { QueryKeys } from '@/constants/query-keys';

/** Approve/reject a leave request (admin). A decision moves the row out of
 *  `pending` and can change an approved employee's balance, so both the request
 *  lists and every balance read are invalidated. */
export function useReviewLeave(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useAction(reviewLeaveRequest, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.LEAVE_REQUESTS] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.LEAVE_BALANCE] });
      onSuccess?.();
    },
    onError,
  });
}
