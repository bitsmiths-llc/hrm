'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';

import {
  updateMyBank,
  updateMyPersonalInfo,
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

export function useUpdateMyPersonalInfo(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useAction(updateMyPersonalInfo, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.MY_PROFILE] });
      // Full name also drives the sidebar identity card and dashboard greeting.
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.CURRENT_EMPLOYEE],
      });
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
