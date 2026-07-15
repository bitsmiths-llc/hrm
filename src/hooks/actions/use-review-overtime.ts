'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';

import { reviewOvertimeLog } from '@/actions/overtime';

import { onError } from '@/lib/show-error-toast';

import { QueryKeys } from '@/constants/query-keys';

/** Approve/reject an overtime log (admin). A decision moves the row out of
 *  `pending`, so the overtime lists (own history + admin queue, which share the
 *  OVERTIME_LOGS key) are invalidated. */
export function useReviewOvertime(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useAction(reviewOvertimeLog, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.OVERTIME_LOGS] });
      onSuccess?.();
    },
    onError,
  });
}
