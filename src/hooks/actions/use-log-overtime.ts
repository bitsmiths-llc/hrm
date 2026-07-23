'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';

import { createOvertimeLog } from '@/actions/overtime';

import { onError } from '@/lib/show-error-toast';

import { QueryKeys } from '@/constants/query-keys';

/** Log overtime. Invalidates the caller's history so it refreshes, then hands
 *  control back via `onSuccess` (close dialog, toast). */
export function useLogOvertime(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useAction(createOvertimeLog, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.OVERTIME_LOGS] });
      onSuccess?.();
    },
    onError,
  });
}
