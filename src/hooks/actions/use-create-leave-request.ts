'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';

import { createLeaveRequest } from '@/actions/leave';

import { onError } from '@/lib/show-error-toast';

import { QueryKeys } from '@/constants/query-keys';

/** Submit a leave request. Invalidates the caller's history + balance so both
 *  refresh, then hands control back via `onSuccess` (close dialog, toast). */
export function useCreateLeaveRequest(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useAction(createLeaveRequest, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.LEAVE_REQUESTS] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.LEAVE_BALANCE] });
      onSuccess?.();
    },
    onError,
  });
}
