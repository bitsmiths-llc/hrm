import { useQuery } from '@tanstack/react-query';

import { mockCurrentEmployee } from '@/constants/mock/employees';
import { mockLeaveRequests } from '@/constants/mock/requests';
import { QueryKeys } from '@/constants/query-keys';

import { LeaveRequest } from '@/types/hrm';

const mockDelay = (ms = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const useLeaveRequests = (employeeId: string) => {
  return useQuery({
    queryKey: [QueryKeys.LEAVE_REQUESTS, employeeId],
    queryFn: async (): Promise<LeaveRequest[]> => {
      await mockDelay();
      return mockLeaveRequests.filter(
        (request) => request.employeeId === employeeId,
      );
    },
  });
};

/** Own requests for the signed-in employee (mocked as emp-1). */
export const useMyLeaveRequests = () =>
  useLeaveRequests(mockCurrentEmployee.id);
