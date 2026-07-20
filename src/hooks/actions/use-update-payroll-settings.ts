'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';

import { updatePayrollSettings } from '@/actions/payroll';

import { onError } from '@/lib/show-error-toast';

import { QueryKeys } from '@/constants/query-keys';

/** Save the payroll settings singleton (admin). The global pool/cap/accrual feed
 *  the `leave_balance()` / `medical_balance()` RPCs retroactively, so every
 *  displayed balance changes — invalidate the settings query AND the balance keys
 *  (bare keys → prefix-match every employee/year), mirroring the per-employee
 *  override path in `use-update-employee`. */
export function useUpdatePayrollSettings(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useAction(updatePayrollSettings, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.HRM_SETTINGS] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.LEAVE_BALANCE] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.MEDICAL_BALANCE] });
      onSuccess?.();
    },
    onError,
  });
}
