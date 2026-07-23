'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';

import { acknowledgePolicy } from '@/actions/policies';

import { onError } from '@/lib/show-error-toast';

import { QueryKeys } from '@/constants/query-keys';

/** Record the caller's acknowledgment of a policy version (BIT-23).
 *
 *  Invalidates the acknowledgment key prefix — which covers both the caller's
 *  own rows and the admin roster — plus the compliance grid. Nothing here
 *  touches `ACTIVE_POLICIES`: acknowledging doesn't change which version is
 *  active, and the prompt, the list chips and the sidebar pill are all derived
 *  from acknowledgments against that unchanged list.
 *
 *  Callers must await `executeAsync` — `execute` does not invalidate. See the
 *  note on the wrapper below. */
export function useAcknowledgePolicy(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const action = useAction(acknowledgePolicy, { onError });

  // Same reason as `useReviewLeave`: next-safe-action fires `onSuccess` from a
  // useEffect, which never runs when acknowledging the last outstanding policy
  // unmounts the prompt that owns this hook.
  const executeAsync: typeof action.executeAsync = async (input) => {
    const result = await action.executeAsync(input);
    if (result?.data) {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.POLICY_ACKNOWLEDGMENTS],
      });
      onSuccess?.();
    }
    return result;
  };

  return { ...action, executeAsync };
}
