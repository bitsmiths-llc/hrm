import { useQuery } from '@tanstack/react-query';

import {
  mockCurrentEmployee,
  mockLeaveBalances,
} from '@/constants/mock/employees';
import { mockLeaveRequests } from '@/constants/mock/requests';
import { QueryKeys } from '@/constants/query-keys';

import { LeaveBalance, LeaveRequest } from '@/types/hrm';

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

export const useLeaveBalance = (employeeId: string) => {
  return useQuery({
    queryKey: [QueryKeys.LEAVE_BALANCE, employeeId],
    queryFn: async (): Promise<LeaveBalance> => {
      await mockDelay(300);
      return (
        mockLeaveBalances[employeeId] ?? {
          poolTotal: 22,
          poolUsed: 0,
          unpaidTaken: 0,
        }
      );
    },
  });
};

/** Own requests/balance for the signed-in employee (mocked as emp-1). */
export const useMyLeaveRequests = () =>
  useLeaveRequests(mockCurrentEmployee.id);

export const useMyLeaveBalance = () => useLeaveBalance(mockCurrentEmployee.id);
