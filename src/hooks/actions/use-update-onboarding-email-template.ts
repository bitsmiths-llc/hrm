'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';

import { updateOnboardingEmailTemplate } from '@/actions/email-template';

import { onError } from '@/lib/show-error-toast';

import { QueryKeys } from '@/constants/query-keys';

/** Save the onboarding email template singleton (admin). On success, invalidate
 *  the template query so the editor and its live preview re-sync from the saved
 *  (sanitized) row and the form's dirty state clears. */
export function useUpdateOnboardingEmailTemplate(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useAction(updateOnboardingEmailTemplate, {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.ONBOARDING_EMAIL_TEMPLATE],
      });
      onSuccess?.();
    },
    onError,
  });
}
