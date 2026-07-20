'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';

import { updateSystemConfig } from '@/actions/system-config';

import { onError } from '@/lib/show-error-toast';

import { QueryKeys } from '@/constants/query-keys';

/** Save the module toggles singleton (admin). On success, invalidate the config
 *  query so the nav shell re-reads the flags and shows/hides gated entries (e.g.
 *  Reimbursements) immediately. */
export function useUpdateSystemConfig(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useAction(updateSystemConfig, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.SYSTEM_CONFIG] });
      onSuccess?.();
    },
    onError,
  });
}
