import { useQuery } from '@tanstack/react-query';

import { authQuery } from '@/lib/client/auth-query';

import { QueryKeys } from '@/constants/query-keys';

import { AccountStatus, PayrollCycleStatus } from '@/types/hrm';

/** Admin-home aggregation bundle, one guarded `dashboard_summary()` fetch. */
export type DashboardSummary = {
  pendingLeave: number;
  pendingMedical: number;
  pendingOvertime: number;
  pendingOnboarding: number;
  activeEmployees: number;
  /** Latest run's status, or null when no payroll run exists yet. */
  payrollCycle: PayrollCycleStatus | null;
};

/** One row per account_status present in the directory. */
export type EmployeeStatusCount = { status: AccountStatus; count: number };

// Admin home: the six org-wide counters in a single guarded RPC round-trip. The
// RPC is security definer + asserts is_admin() itself (RLS is bypassed), so a
// non-admin gets a 42501 rather than a partial read — the (admin) route guard
// keeps them off the page in the first place.
const fetchDashboardSummary = authQuery(
  async ({ supabase }): Promise<DashboardSummary> => {
    const { data, error } = await supabase.rpc('dashboard_summary');
    if (error) throw new Error(error.message);
    return {
      pendingLeave: data.pending_leave,
      pendingMedical: data.pending_medical,
      pendingOvertime: data.pending_overtime,
      pendingOnboarding: data.pending_onboarding,
      activeEmployees: data.active_employees,
      payrollCycle: data.payroll_cycle,
    };
  },
);

/** Admin home: the guarded dashboard_summary() bundle. */
export const useDashboardSummary = () =>
  useQuery({
    queryKey: [QueryKeys.DASHBOARD_SUMMARY],
    queryFn: () => fetchDashboardSummary(),
  });

// Admin: count of employees per account_status. Only statuses actually present
// are returned, so callers should treat a missing status as zero.
const fetchEmployeesByStatus = authQuery(
  async ({ supabase }): Promise<EmployeeStatusCount[]> => {
    const { data, error } = await supabase.rpc('employees_by_status');
    if (error) throw new Error(error.message);
    return data.map((row) => ({
      status: row.status as AccountStatus,
      count: row.count,
    }));
  },
);

/** Admin: employee headcount broken down by account_status. */
export const useEmployeesByStatus = () =>
  useQuery({
    queryKey: [QueryKeys.EMPLOYEES_BY_STATUS],
    queryFn: () => fetchEmployeesByStatus(),
  });
