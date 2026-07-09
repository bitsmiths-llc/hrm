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

export const calcPayslipTotal = (
  totalBase: number,
  medical: number,
  overtimePay: number,
) => totalBase + medical + overtimePay;
