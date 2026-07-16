import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { authQuery } from '@/lib/client/auth-query';

import { QueryKeys } from '@/constants/query-keys';
import { type CustomField, isCustomField } from '@/schema/payroll';

import { PayrollCycle, Payslip } from '@/types/hrm';
import { type Tables } from '@/types/supabase';

/** 'YYYY-MM-DD' (first of month) → 'YYYY-MM', the shape the existing UI uses. */
const toCycleMonth = (periodMonth: string) => periodMonth.slice(0, 7);

/** Coerce a jsonb `custom_fields` value (typed `Json`) into a line-item array,
 *  keeping the well-formed entries and dropping any malformed one. */
const toCustomFields = (value: unknown): CustomField[] =>
  Array.isArray(value) ? value.filter(isCustomField) : [];

// ---------------------------------------------------------------------------
// Run list + a run by month (admin only — RLS `runs_admin_all`).
// ---------------------------------------------------------------------------
type RunRow = Tables<'payroll_runs'> & {
  payslips: { count: number }[];
};

function toPayrollCycle(row: RunRow): PayrollCycle {
  return {
    id: row.id,
    month: toCycleMonth(row.period_month),
    status: row.status,
    totalPayroll: row.total_payroll ?? 0,
    employeeCount: row.payslips?.[0]?.count ?? 0,
    lockedAt: row.locked_at,
  };
}

const fetchPayrollRuns = authQuery(async ({ supabase }) => {
  const { data, error } = await supabase
    .from('payroll_runs')
    .select('*, payslips(count)')
    .order('period_month', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as RunRow[]).map(toPayrollCycle);
});

/** All payroll runs, newest month first (admin run-list screen). */
export const usePayrollRuns = () =>
  useQuery({
    queryKey: [QueryKeys.PAYROLL_RUNS],
    queryFn: () => fetchPayrollRuns(),
  });

const fetchRunByMonth = authQuery(
  async ({ supabase, params }) => {
    const { data, error } = await supabase
      .from('payroll_runs')
      .select('*, payslips(count)')
      .eq('period_month', `${params.month}-01`)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toPayrollCycle(data as RunRow) : null;
  },
  { paramsSchema: z.object({ month: z.string() }) },
);

/** The run for a given 'YYYY-MM' month, or null if none exists yet. */
export const useRunByMonth = (month: string) =>
  useQuery({
    queryKey: [QueryKeys.PAYROLL_RUNS, month],
    queryFn: () => fetchRunByMonth({ month }),
    enabled: !!month,
  });

// ---------------------------------------------------------------------------
// Draft / frozen payslips for a run (admin grid — RLS `payslip_admin_all`).
// ---------------------------------------------------------------------------
/** A payslip row with the employee's name joined, all numerics coerced. Postgres
 *  `numeric` arrives as a string over PostgREST despite the generated `number`
 *  type, so days/hours/rate/multiplier are `Number()`-ed to keep arithmetic right. */
export type RunPayslipRow = {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  baseSalary: number;
  daysInMonth: number;
  daysWorked: number;
  unpaidLeaveDays: number;
  totalBase: number;
  medical: number;
  overtimeHours: number;
  overtimeMultiplier: number;
  overtimeRate: number;
  overtimePay: number;
  taxDeduction: number;
  customFields: CustomField[];
  totalPay: number;
};

type PayslipRow = Tables<'payslips'> & {
  employees?: Pick<Tables<'employees'>, 'full_name'> | null;
};

function toRunPayslipRow(row: PayslipRow): RunPayslipRow {
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employees?.full_name ?? '',
    designation: row.designation ?? '',
    baseSalary: row.base_salary,
    daysInMonth: row.days_in_month,
    daysWorked: Number(row.days_worked),
    unpaidLeaveDays: Number(row.unpaid_leave_days),
    totalBase: row.total_base,
    medical: row.medical,
    overtimeHours: Number(row.overtime_hours),
    overtimeMultiplier: row.overtime_multiplier ? Number(row.overtime_multiplier) : 0,
    overtimeRate: Number(row.overtime_rate),
    overtimePay: row.overtime_pay,
    taxDeduction: row.tax_deduction,
    customFields: toCustomFields(row.custom_fields),
    totalPay: row.total_pay,
  };
}

const fetchRunPayslips = authQuery(
  async ({ supabase, params }) => {
    const { data, error } = await supabase
      .from('payslips')
      .select('*, employees(full_name)')
      .eq('payroll_run_id', params.runId);
    if (error) throw new Error(error.message);
    return (data as PayslipRow[])
      .map(toRunPayslipRow)
      .sort((a, b) => a.employeeName.localeCompare(b.employeeName));
  },
  { paramsSchema: z.object({ runId: z.string() }) },
);

/** Payslips for one run, sorted by employee name. Drives the admin draft grid. */
export const useRunPayslips = (runId?: string) =>
  useQuery({
    queryKey: [QueryKeys.RUN_PAYSLIPS, runId],
    queryFn: () => fetchRunPayslips({ runId: runId! }),
    enabled: !!runId,
  });

// ---------------------------------------------------------------------------
// A single employee's payslips (employee's own page + admin employee-detail
// tab). RLS scopes the employee to their own *locked* payslips; an admin reads
// anyone's. Mapped onto the `Payslip` domain type the PDF / table / export use.
// ---------------------------------------------------------------------------
type EmployeePayslipRow = Tables<'payslips'> & {
  employees?: Pick<Tables<'employees'>, 'full_name'> | null;
};

function toPayslip(row: EmployeePayslipRow): Payslip {
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employees?.full_name ?? '',
    designation: row.designation ?? '',
    // `period_month` is denormalized onto the payslip; employees can't read
    // payroll_runs (admin-only RLS), so an embed would come back null here.
    cycleMonth: toCycleMonth(row.period_month),
    baseSalary: row.base_salary,
    daysWorked: Number(row.days_worked),
    daysInMonth: row.days_in_month,
    totalBase: row.total_base,
    medical: row.medical,
    overtimeHours: Number(row.overtime_hours),
    overtimeRate: Number(row.overtime_rate),
    overtimeMultiplier: row.overtime_multiplier
      ? Number(row.overtime_multiplier)
      : 0,
    overtimePay: row.overtime_pay,
    taxDeduction: row.tax_deduction,
    customFields: toCustomFields(row.custom_fields),
    total: row.total_pay,
  };
}

const fetchEmployeePayslips = authQuery(
  async ({ supabase, params }) => {
    const { data, error } = await supabase
      .from('payslips')
      .select('*, employees(full_name)')
      .eq('employee_id', params.employeeId);
    if (error) throw new Error(error.message);
    return (data as EmployeePayslipRow[]).map(toPayslip);
  },
  { paramsSchema: z.object({ employeeId: z.string() }) },
);

/** One employee's payslips. Admin employee-detail tab passes an id; the
 *  employee's own /payslips page passes their own (RLS returns only locked). */
export const usePayslips = (employeeId?: string) =>
  useQuery({
    queryKey: [QueryKeys.PAYSLIPS, employeeId],
    queryFn: () => fetchEmployeePayslips({ employeeId: employeeId! }),
    enabled: !!employeeId,
  });
