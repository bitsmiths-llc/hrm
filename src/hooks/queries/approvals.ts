import { useQuery } from '@tanstack/react-query';

import { toLeaveRequest } from '@/hooks/queries/leave';

import { authQuery } from '@/lib/client/auth-query';

import { mockMedicalClaims, mockOvertimeLogs } from '@/constants/mock/requests';
import { QueryKeys } from '@/constants/query-keys';

import { MedicalClaim, OvertimeLog } from '@/types/hrm';

const mockDelay = (ms = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Admin view: every leave request across employees, newest first, with the
// requester's name joined for the queue (RLS leave_admin_all). Disambiguate the
// embed — leave_requests has two FKs to employees (employee_id, reviewed_by).
const fetchAllLeaveRequests = authQuery(async ({ supabase }) => {
  const { data, error } = await supabase
    .from('leave_requests')
    .select('*, employees!leave_requests_employee_id_fkey(full_name)')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data.map((row) => toLeaveRequest(row, row.employees?.full_name ?? ''));
});

/** Admin view: every leave request across employees, newest first. */
export const useAllLeaveRequests = () =>
  useQuery({
    queryKey: [QueryKeys.LEAVE_REQUESTS],
    queryFn: () => fetchAllLeaveRequests(),
  });

// Medical / overtime approvals are still mock-backed — wiring them to real
// tables is out of scope for BIT-12 (leave only).
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
