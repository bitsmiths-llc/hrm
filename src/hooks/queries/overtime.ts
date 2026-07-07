import { useQuery } from '@tanstack/react-query';

import { mockOvertimeLogs } from '@/constants/mock/requests';
import { QueryKeys } from '@/constants/query-keys';

import { OvertimeLog } from '@/types/hrm';

const mockDelay = (ms = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const useOvertimeLogs = (employeeId: string) => {
  return useQuery({
    queryKey: [QueryKeys.OVERTIME_LOGS, employeeId],
    queryFn: async (): Promise<OvertimeLog[]> => {
      await mockDelay();
      return mockOvertimeLogs.filter((log) => log.employeeId === employeeId);
    },
  });
};
