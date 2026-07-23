import { type CustomField, isCustomField } from '@/schema/payroll';

import { Payslip } from '@/types/hrm';
import { type Tables } from '@/types/supabase';

/** 'YYYY-MM-DD' (first of month) → 'YYYY-MM', the shape the existing UI uses. */
export const toCycleMonth = (periodMonth: string) => periodMonth.slice(0, 7);

/** Coerce a jsonb `custom_fields` value (typed `Json`) into a line-item array,
 *  keeping the well-formed entries and dropping any malformed one. */
export const toCustomFields = (value: unknown): CustomField[] =>
  Array.isArray(value) ? value.filter(isCustomField) : [];

/** A `payslips` row with the employee's name joined. */
export type PayslipDbRow = Tables<'payslips'> & {
  employees?: Pick<Tables<'employees'>, 'full_name'> | null;
};

/**
 * `payslips` row → the `Payslip` domain type the PDF, the payslips table and the
 * invoice email all read. Deliberately framework-neutral (no `server-only`, no
 * client-only imports) so the React Query hooks and the server actions share one
 * mapping: the numeric coercions below are easy to get subtly wrong twice.
 *
 * Postgres `numeric` arrives as a string over PostgREST despite the generated
 * `number` type, so days/hours/rate/multiplier are `Number()`-ed to keep the
 * arithmetic right.
 */
export function toPayslip(row: PayslipDbRow): Payslip {
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
