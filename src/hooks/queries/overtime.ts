import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { authQuery } from '@/lib/client/auth-query';

import { QueryKeys } from '@/constants/query-keys';

import { OvertimeLog } from '@/types/hrm';
import { type Tables } from '@/types/supabase';

/** An `overtime_logs` row with its project name joined (via project_id FK). */
type OvertimeLogRow = Tables<'overtime_logs'> & {
  projects?: Pick<Tables<'projects'>, 'name'> | null;
};

/** Map an `overtime_logs` row onto the `OvertimeLog` domain type. `project`
 *  carries the joined project name (the FK resolves it even after a project is
 *  deactivated). The admin queue passes the requester's name; self/per-employee
 *  reads leave it '' — those surfaces don't render it. */
export function toOvertimeLog(
  row: OvertimeLogRow,
  employeeName = '',
): OvertimeLog {
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName,
    date: row.work_date,
    // Postgres `numeric` can arrive as a string over PostgREST despite the
    // generated `number` type, so coerce to keep arithmetic (hour sums) correct.
    hours: Number(row.hours),
    project: row.projects?.name ?? '',
    task: row.task,
    status: row.status,
    rejectionReason: row.rejection_reason,
    createdAt: row.created_at,
  };
}

// One employee's history + resolved project names. Admins resolve anyone (RLS
// overtime_admin_all); an employee resolves only themselves. Drives both the
// self /overtime page and the admin employee-detail Overtime tab.
const fetchOvertimeLogs = authQuery(
  async ({ supabase, params }) => {
    const { data, error } = await supabase
      .from('overtime_logs')
      .select('*, projects(name)')
      .eq('employee_id', params.employeeId)
      .order('work_date', { ascending: false });
    if (error) throw new Error(error.message);
    return data.map((row) => toOvertimeLog(row));
  },
  { paramsSchema: z.object({ employeeId: z.string() }) },
);

export const useOvertimeLogs = (employeeId?: string) =>
  useQuery({
    queryKey: [QueryKeys.OVERTIME_LOGS, employeeId],
    queryFn: () => fetchOvertimeLogs({ employeeId: employeeId! }),
    enabled: !!employeeId,
  });
