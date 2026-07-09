import { useQuery } from '@tanstack/react-query';

import { mockHrmSettings } from '@/constants/mock/settings';
import { QueryKeys } from '@/constants/query-keys';

import { HrmSettings } from '@/types/hrm';

const mockDelay = (ms = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/** Module-wide config admins can change — e.g. the overtime multiplier used
 *  during payroll runs. Saving mutates this cache directly (see
 *  settings-form.tsx), so staleTime is Infinity to survive remounts without
 *  an overwriting refetch. */
export const useHrmSettings = () => {
  return useQuery({
    queryKey: [QueryKeys.HRM_SETTINGS],
    queryFn: async (): Promise<HrmSettings> => {
      await mockDelay();
      return mockHrmSettings;
    },
    staleTime: Infinity,
  });
};
