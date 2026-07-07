import { useQuery } from '@tanstack/react-query';

import {
  mockLeaveRequests,
  mockMedicalClaims,
  mockOvertimeLogs,
} from '@/constants/mock/requests';
import { QueryKeys } from '@/constants/query-keys';

import { LeaveRequest, MedicalClaim, OvertimeLog } from '@/types/hrm';

const mockDelay = (ms = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/** Admin view: every request across employees, newest first. */
export const useAllLeaveRequests = () => {
  return useQuery({
    queryKey: [QueryKeys.LEAVE_REQUESTS],
    queryFn: async (): Promise<LeaveRequest[]> => {
      await mockDelay();
      return mockLeaveRequests;
    },
  });
};

export const useAllMedicalClaims = () => {
  return useQuery({
    queryKey: [QueryKeys.MEDICAL_CLAIMS],
    queryFn: async (): Promise<MedicalClaim[]> => {
      await mockDelay();
      return mockMedicalClaims;
    },
  });
};

export const useAllOvertimeLogs = () => {
  return useQuery({
    queryKey: [QueryKeys.OVERTIME_LOGS],
    queryFn: async (): Promise<OvertimeLog[]> => {
      await mockDelay();
      return mockOvertimeLogs;
    },
  });
};
