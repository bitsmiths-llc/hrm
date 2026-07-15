import { useQuery } from '@tanstack/react-query';

import { toLeaveRequest } from '@/hooks/queries/leave';
import { toMedicalClaim } from '@/hooks/queries/medical';
import { toOvertimeLog } from '@/hooks/queries/overtime';

import { authQuery } from '@/lib/client/auth-query';

import { QueryKeys } from '@/constants/query-keys';

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

// Admin view: every medical claim across employees, newest first, with the
// requester's name + proof paths joined (RLS medical_admin_all). Disambiguate
// the embed — medical_claims has two FKs to employees (employee_id,
// reviewed_by).
const fetchAllMedicalClaims = authQuery(async ({ supabase }) => {
  const { data, error } = await supabase
    .from('medical_claims')
    .select(
      '*, medical_claim_files(storage_path, file_name), employees!medical_claims_employee_id_fkey(full_name)',
    )
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data.map((row) => toMedicalClaim(row, row.employees?.full_name ?? ''));
});

/** Admin view: every medical claim across employees, newest first. */
export const useAllMedicalClaims = () =>
  useQuery({
    queryKey: [QueryKeys.MEDICAL_CLAIMS],
    queryFn: () => fetchAllMedicalClaims(),
  });

// Admin view: every overtime log across employees, newest first, with the
// requester's name + project name joined (RLS overtime_admin_all). Disambiguate
// the embed — overtime_logs has two FKs to employees (employee_id, reviewed_by).
const fetchAllOvertimeLogs = authQuery(async ({ supabase }) => {
  const { data, error } = await supabase
    .from('overtime_logs')
    .select(
      '*, projects(name), employees!overtime_logs_employee_id_fkey(full_name)',
    )
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data.map((row) => toOvertimeLog(row, row.employees?.full_name ?? ''));
});

/** Admin view: every overtime log across employees, newest first. */
export const useAllOvertimeLogs = () =>
  useQuery({
    queryKey: [QueryKeys.OVERTIME_LOGS],
    queryFn: () => fetchAllOvertimeLogs(),
  });
