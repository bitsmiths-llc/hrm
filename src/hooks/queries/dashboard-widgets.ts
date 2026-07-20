import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { authQuery } from '@/lib/client/auth-query';

import { QueryKeys } from '@/constants/query-keys';

// ---------------------------------------------------------------------------
// Payroll cycle cost — total pay for one run, summed from the frozen payslip
// snapshots by the guarded payroll_cycle_cost() RPC (never recomputed). The RPC
// is security definer + asserts is_admin() itself (42501 for non-admins); the
// (admin) route guard keeps non-admins off the page in the first place.
// ---------------------------------------------------------------------------
const fetchPayrollCycleCost = authQuery(
  async ({ supabase, params }): Promise<number> => {
    const { data, error } = await supabase.rpc('payroll_cycle_cost', {
      run_id: params.runId,
    });
    if (error) throw new Error(error.message);
    return data ?? 0;
  },
  { paramsSchema: z.object({ runId: z.string() }) },
);

/** Whole-PKR cost of one payroll run. Disabled when there is no run, so the
 *  widget's empty state never fires a query. */
export const usePayrollCycleCost = (runId?: string | null) =>
  useQuery({
    queryKey: [QueryKeys.PAYROLL_CYCLE_COST, runId],
    queryFn: () => fetchPayrollCycleCost({ runId: runId! }),
    enabled: !!runId,
  });

// ---------------------------------------------------------------------------
// Leave balances rollup — one row per active employee for a given year, each
// wrapping the canonical leave_balance() so the figures match the per-employee
// widget exactly (half-days included). One guarded RPC call, not N.
// ---------------------------------------------------------------------------
export type LeaveBalanceRow = {
  employeeId: string;
  fullName: string;
  remaining: number;
  used: number;
  pool: number;
};

const fetchLeaveBalancesAll = authQuery(
  async ({ supabase, params }): Promise<LeaveBalanceRow[]> => {
    const { data, error } = await supabase.rpc('leave_balances_all', {
      year: params.year,
    });
    if (error) throw new Error(error.message);
    return data.map((row) => ({
      employeeId: row.employee_id,
      // A handful of active employees may not have set a name yet; keep the
      // table from rendering a literal null.
      fullName: row.full_name ?? '',
      // remaining/used are SQL `numeric` and can come back as strings over
      // PostgREST — coerce so callers get real numbers (pool is `int`).
      remaining: Number(row.remaining),
      used: Number(row.used),
      pool: Number(row.pool),
    }));
  },
  { paramsSchema: z.object({ year: z.number() }) },
);

/** Every active employee's leave balance for `year`, sorted by name. */
export const useLeaveBalancesAll = (year: number) =>
  useQuery({
    queryKey: [QueryKeys.LEAVE_BALANCES_ALL, year],
    queryFn: () => fetchLeaveBalancesAll({ year }),
  });
