import { useQuery } from '@tanstack/react-query';

import {
  mockCurrentEmployee,
  mockLeaveBalance,
} from '@/constants/mock/employees';
import { mockLeaveRequests } from '@/constants/mock/requests';
import { QueryKeys } from '@/constants/query-keys';

import { LeaveBalance, LeaveRequest } from '@/types/hrm';

const mockDelay = (ms = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/** Own requests for the signed-in employee (mocked as emp-1). */
export const useMyLeaveRequests = () => {
  return useQuery({
    queryKey: [QueryKeys.LEAVE_REQUESTS, mockCurrentEmployee.id],
    queryFn: async (): Promise<LeaveRequest[]> => {
      await mockDelay();
      return mockLeaveRequests.filter(
        (request) => request.employeeId === mockCurrentEmployee.id,
      );
    },
  });
};

export const useMyLeaveBalance = () => {
  return useQuery({
    queryKey: [QueryKeys.LEAVE_BALANCE, mockCurrentEmployee.id],
    queryFn: async (): Promise<LeaveBalance> => {
      await mockDelay(300);
      return mockLeaveBalance;
    },
  });
};
