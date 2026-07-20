import { useQuery } from '@tanstack/react-query';

import { mockProjects } from '@/constants/mock/projects';
import { QueryKeys } from '@/constants/query-keys';

import { Project } from '@/types/hrm';

const mockDelay = (ms = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/** Admin-managed list employees pick from when logging overtime — adding or
 *  removing a project (in Policies → Configuration) mutates this cache
 *  directly, same pattern as settings.ts. */
export const useProjects = () => {
  return useQuery({
    queryKey: [QueryKeys.PROJECTS],
    queryFn: async (): Promise<Project[]> => {
      await mockDelay();
      return mockProjects;
    },
    staleTime: Infinity,
  });
};
