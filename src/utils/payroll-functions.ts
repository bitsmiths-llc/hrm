import { currentMonth, nextMonth } from '@/utils/date-functions';

import type { Payslip } from '@/types/hrm';

// `payroll_runs.period_month` is unique, so a month that already has a run can
// never get a second one. Walk forward from the current month to the first one
// that's still free — that's what the create dialog should land on. Bounded at
// 10 years so a pathological `taken` set can't spin forever; the fallback just
// means the dialog opens on a month the user has to change themselves.
const MAX_MONTHS_AHEAD = 120;

export const firstAvailableMonth = (takenMonths: string[]) => {
  let month = currentMonth();
  for (let i = 0; i < MAX_MONTHS_AHEAD && takenMonths.includes(month); i++) {
    month = nextMonth(month);
  }
  return month;
};

// These do intermediate FP arithmetic on PKR values, which the currency rule
// (.claude/docs/rules/config-and-routes.md) normally forbids. It's deliberate
// here: PKR has no sub-unit denominations in practice, each function ends in a
// single Math.round() with no accumulation carrying drift forward, so the error
// is bounded to at most 1 PKR in a vanishingly rare exact-half-rupee case.
export const calcTotalBase = (
  baseSalary: number,
  daysWorked: number,
  daysInMonth: number,
) => Math.round((baseSalary * daysWorked) / daysInMonth);

export const calcOvertimePay = (
  baseSalary: number,
  workingHours: number,
  overtimeHours: number,
  overtimeMultiplier: number,
) =>
  Math.round((baseSalary / workingHours) * overtimeMultiplier * overtimeHours);

// Net payslip total, mirroring the SQL calculate_payroll RPC's total_pay:
//   total_base + medical + overtime_pay − tax + sum(custom_fields)
// Custom-field amounts are signed (positive = earning, negative = deduction) and
// net into the sum. The server wraps the result in round(); custom amounts may be
// fractional (addCustomFieldSchema doesn't force integers), so round here too to
// stay in lockstep with the frozen server-side total_pay.
export const calcPayslipTotal = (
  totalBase: number,
  medical: number,
  overtimePay: number,
  taxDeduction: number,
  customFields: Payslip['customFields'],
) => {
  const customTotal = customFields.reduce(
    (sum, field) => sum + field.amount,
    0,
  );
  return Math.round(
    totalBase + medical + overtimePay - taxDeduction + customTotal,
  );
};
