import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { authQuery } from '@/lib/client/auth-query';

import { QueryKeys } from '@/constants/query-keys';

import { LeaveRequest } from '@/types/hrm';
import { type Tables } from '@/types/supabase';

/** Map a `leave_requests` row onto the `LeaveRequest` domain type. The admin
 *  queue passes the joined employee name; self/per-employee reads leave it '' —
 *  those surfaces don't render it. */
export function toLeaveRequest(
  row: Tables<'leave_requests'>,
  employeeName = '',
): LeaveRequest {
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName,
    type: row.leave_type,
    reason: row.reason,
    startDate: row.start_date,
    // Postgres `numeric` can arrive as a string over PostgREST despite the
    // generated `number` type, so coerce to keep the arithmetic (balance sums,
    // display) correct.
    days: Number(row.num_days),
    status: row.status,
    rejectionReason: row.rejection_reason,
    createdAt: row.created_at,
  };
}

// One employee's history. Admins resolve anyone (RLS leave_admin_all); an
// employee resolves only themselves. Also drives the self /leave page (passed
// the caller's own id) so it shares one cache entry with the balance widget.
const fetchLeaveRequests = authQuery(
  async ({ supabase, params }) => {
    const { data, error } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('employee_id', params.employeeId)
      .order('start_date', { ascending: false });
    if (error) throw new Error(error.message);
    return data.map((row) => toLeaveRequest(row));
  },
  { paramsSchema: z.object({ employeeId: z.string() }) },
);

export const useLeaveRequests = (employeeId?: string) =>
  useQuery({
    queryKey: [QueryKeys.LEAVE_REQUESTS, employeeId],
    queryFn: () => fetchLeaveRequests({ employeeId: employeeId! }),
    enabled: !!employeeId,
  });

export type LeaveBalanceResult = {
  poolTotal: number;
  used: number;
  remaining: number;
};

// Canonical pool balance for one employee/year, derived on every read by the
// leave_balance() RPC (SECURITY INVOKER → RLS applies). Unpaid is excluded by
// the RPC; the widget surfaces it separately from the request history.
const fetchLeaveBalance = authQuery(
  async ({ supabase, params }): Promise<LeaveBalanceResult> => {
    const { data, error } = await supabase
      .rpc('leave_balance', {
        p_employee: params.employeeId,
        ...(params.year ? { p_year: params.year } : {}),
      })
      .single();
    if (error) throw new Error(error.message);
    // used/remaining are SQL `numeric` and can come back as strings — coerce
    // so callers get real numbers (pool_total is `int`, always numeric).
    return {
      poolTotal: Number(data.pool_total),
      used: Number(data.used),
      remaining: Number(data.remaining),
    };
  },
  {
    paramsSchema: z.object({
      employeeId: z.string(),
      year: z.number().optional(),
    }),
  },
);

export const useLeaveBalance = (employeeId?: string, year?: number) =>
  useQuery({
    queryKey: [
      QueryKeys.LEAVE_BALANCE,
      employeeId ?? 'none',
      year ?? 'current',
    ],
    queryFn: () => fetchLeaveBalance({ employeeId: employeeId!, year }),
    enabled: !!employeeId,
  });
