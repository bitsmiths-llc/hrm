'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAction } from 'next-safe-action/hooks';

import { createProject, deactivateProject } from '@/actions/projects';

import { onError } from '@/lib/show-error-toast';

import { QueryKeys } from '@/constants/query-keys';

/** Add a project to the overtime lookup (admin). Invalidates the project list so
 *  the settings card and the overtime dropdown both refresh. */
export function useCreateProject(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useAction(createProject, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.PROJECTS] });
      onSuccess?.();
    },
    onError,
  });
}

/** Remove (soft-delete) a project (admin). Invalidates the project list so the
 *  deactivated project drops out of the settings card and the dropdown. */
export function useDeactivateProject(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useAction(deactivateProject, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.PROJECTS] });
      onSuccess?.();
    },
    onError,
  });
}
