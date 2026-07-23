'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';

import { markPolicyReviewed } from '@/actions/policies';

import { onError } from '@/lib/show-error-toast';

import { QueryKeys } from '@/constants/query-keys';

/** "Mark reviewed" on the policy linkage panel (BIT-25). Advances the
 *  reconciliation marker to the active version, then invalidates the linkage
 *  query so that policy's drift badge clears immediately. */
export function useMarkPolicyReviewed(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useAction(markPolicyReviewed, {
    onSuccess: () => {
      // Invalidate broader policy caches so UI reflects the updated marker.
      queryClient.invalidateQueries({ queryKey: [QueryKeys.POLICIES] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.POLICY_COMPLIANCE] });
      onSuccess?.();
    },
    onError,
  });
}
