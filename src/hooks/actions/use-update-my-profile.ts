'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';

import {
  updateMyBank,
  updateMyProfile,
  updateMySocials,
} from '@/actions/self-profile';

import { onError } from '@/lib/show-error-toast';

import { QueryKeys } from '@/constants/query-keys';

/** After a self-service edit, refresh the caller's own profile read. */
function useInvalidateMyProfile() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: [QueryKeys.MY_PROFILE] });
}

export function useUpdateMyProfile(onSuccess?: () => void) {
  const invalidate = useInvalidateMyProfile();
  return useAction(updateMyProfile, {
    onSuccess: () => {
      invalidate();
      onSuccess?.();
    },
    onError,
  });
}

export function useUpdateMyBank(onSuccess?: () => void) {
  const invalidate = useInvalidateMyProfile();
  return useAction(updateMyBank, {
    onSuccess: () => {
      invalidate();
      onSuccess?.();
    },
    onError,
  });
}

export function useUpdateMySocials(onSuccess?: () => void) {
  const invalidate = useInvalidateMyProfile();
  return useAction(updateMySocials, {
    onSuccess: () => {
      invalidate();
      onSuccess?.();
    },
    onError,
  });
}
