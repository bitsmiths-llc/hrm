'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';

import { reviewMedicalClaim } from '@/actions/medical';

import { onError } from '@/lib/show-error-toast';

import { QueryKeys } from '@/constants/query-keys';

/** Approve/reject a medical claim (admin). An approval is bounded server-side by
 *  `medical_balance()` and moves an approved employee's balance, so both the
 *  claim lists and every balance read are invalidated. */
export function useReviewMedical(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useAction(reviewMedicalClaim, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.MEDICAL_CLAIMS] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.MEDICAL_BALANCE] });
      onSuccess?.();
    },
    onError,
  });
}
