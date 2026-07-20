'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';

import { createRun } from '@/actions/payroll';

import { onError } from '@/lib/show-error-toast';

import { QueryKeys } from '@/constants/query-keys';

type CreatedRun = { id: string; period_month: string } | null;

/** Create (or resolve the existing) run for a month (admin). Invalidates the run
 *  list, then hands the created run to `onSuccess` so the caller can navigate to it. */
export function useCreateRun(onSuccess?: (run: CreatedRun) => void) {
  const queryClient = useQueryClient();
  return useAction(createRun, {
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.PAYROLL_RUNS] });
      // A new run becomes the latest, so the dashboard's payroll-cycle badge changes.
      queryClient.invalidateQueries({ queryKey: [QueryKeys.DASHBOARD_SUMMARY] });
      onSuccess?.(data ?? null);
    },
    onError,
  });
}
