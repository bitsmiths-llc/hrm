'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';

import { inviteEmployee } from '@/actions/employees';

import { onError } from '@/lib/show-error-toast';

import { QueryKeys } from '@/constants/query-keys';

/** Wraps the `inviteEmployee` server action: refreshes the directory on
 *  success and routes errors through the shared toast handler. The caller
 *  passes `onSuccess` to close the dialog / show its own confirmation. */
export function useInviteEmployee(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useAction(inviteEmployee, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.EMPLOYEES] });
      onSuccess?.();
    },
    onError,
  });
}
