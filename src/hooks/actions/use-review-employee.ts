'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';

import { approveEmployee, returnOnboarding } from '@/actions/employees';

import { onError } from '@/lib/show-error-toast';

import { QueryKeys } from '@/constants/query-keys';

/** Shared invalidation: an approve/return moves the row out of `submitted`, so
 *  the directory list and — since the detail query is keyed `[EMPLOYEES, id]`,
 *  a prefix of this key — the open employee detail page both refresh. The status
 *  change also shifts the admin dashboard's pending-onboarding / active-headcount
 *  tiles and the per-status breakdown, plus the unified approvals queue
 *  (pending_approvals() counts `submitted` employees), so those are invalidated
 *  too. */
function useInvalidateReview() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: [QueryKeys.EMPLOYEES] });
    queryClient.invalidateQueries({ queryKey: [QueryKeys.DASHBOARD_SUMMARY] });
    queryClient.invalidateQueries({ queryKey: [QueryKeys.EMPLOYEES_BY_STATUS] });
    queryClient.invalidateQueries({ queryKey: [QueryKeys.PENDING_APPROVALS] });
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
