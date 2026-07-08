const OVERTIME_MULTIPLIER = 1.5;

export const calcTotalBase = (
  baseSalary: number,
  daysWorked: number,
  daysInMonth: number,
) => Math.round((baseSalary * daysWorked) / daysInMonth);

export const calcOvertimePay = (
  baseSalary: number,
  workingHours: number,
  overtimeHours: number,
) =>
  Math.round((baseSalary / workingHours) * OVERTIME_MULTIPLIER * overtimeHours);

export const calcPayslipTotal = (
  totalBase: number,
  medical: number,
  overtimePay: number,
) => totalBase + medical + overtimePay;
