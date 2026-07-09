'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';

import { approveEmployee, returnOnboarding } from '@/actions/employees';

import { onError } from '@/lib/show-error-toast';

import { QueryKeys } from '@/constants/query-keys';

/** Shared invalidation: an approve/return changes the queue and the directory
 *  (the row moves out of `submitted`), so both caches are refreshed. */
function useInvalidateReview() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: [QueryKeys.ONBOARDING_QUEUE] });
    queryClient.invalidateQueries({ queryKey: [QueryKeys.EMPLOYEES] });
  };
}

/** Approve a submission (→ active). The caller passes `onSuccess` to close its
 *  confirmation UI / show a toast. */
export function useApproveEmployee(onSuccess?: () => void) {
  const invalidate = useInvalidateReview();
  return useAction(approveEmployee, {
    onSuccess: () => {
      invalidate();
      onSuccess?.();
    },
    onError,
  });
}

/** Return a submission to onboarding with a note (→ onboarding). */
export function useReturnOnboarding(onSuccess?: () => void) {
  const invalidate = useInvalidateReview();
  return useAction(returnOnboarding, {
    onSuccess: () => {
      invalidate();
      onSuccess?.();
    },
    onError,
  });
}
