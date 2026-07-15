'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';

import { updatePayrollSettings } from '@/actions/payroll';

import { onError } from '@/lib/show-error-toast';

import { QueryKeys } from '@/constants/query-keys';

/** Save the payroll settings singleton (admin). Invalidates the settings query
 *  so every reader — the settings forms, medical-balance display, leave page —
 *  refreshes with the new values. */
export function useUpdatePayrollSettings(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useAction(updatePayrollSettings, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.HRM_SETTINGS] });
      onSuccess?.();
    },
    onError,
  });
}
