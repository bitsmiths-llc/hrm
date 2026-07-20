import { format } from 'date-fns';

import { formatCurrency } from '@/utils/number-functions';

import {
  payslipPdfCopy as copy,
  payslipPdfMetaLabels as labels,
} from '@/constants/payslip-pdf';

import { Payslip, PayslipLineItem, PayslipMetaField } from '@/types/hrm';

export const money = (amount: number) => formatCurrency(amount) || 'Rs 0';

export const signedMoney = (amount: number) =>
  amount > 0 ? `- ${money(amount)}` : money(amount);

export const payslipCycleLabel = (cycleMonth: string) =>
  format(`${cycleMonth}-01`, 'MMMM yyyy');

export const payslipPayDate = (cycleMonth: string) =>
  format(
    new Date(Number(cycleMonth.slice(0, 4)), Number(cycleMonth.slice(5, 7)), 0),
    'd MMMM yyyy',
  );

export const payslipUnpaidDays = (payslip: Payslip) =>
  payslip.daysInMonth - payslip.daysWorked;

export const payslipUnpaidLeaveDeduction = (payslip: Payslip) =>
  Math.max(0, payslip.baseSalary - payslip.totalBase);

export const buildPayslipMeta = (payslip: Payslip): PayslipMetaField[] => [
  { label: labels.employee, value: payslip.employeeName },
  { label: labels.payPeriod, value: payslipCycleLabel(payslip.cycleMonth) },
  { label: labels.designation, value: payslip.designation },
  { label: labels.payDate, value: payslipPayDate(payslip.cycleMonth) },
];

const overtimeNote = (payslip: Payslip) => {
  if (!(payslip.overtimeHours > 0 && payslip.overtimeRate)) return undefined;

  const multiplier = payslip.overtimeMultiplier
    ? ` x ${payslip.overtimeMultiplier}`
    : '';

  return `${payslip.overtimeHours}h @ ${money(payslip.overtimeRate)}/h${multiplier}`;
};

export const buildPayslipEarnings = (payslip: Payslip): PayslipLineItem[] => {
  return [
    { label: copy.baseSalaryLabel, amount: payslip.baseSalary },
    { label: copy.medicalLabel, amount: payslip.medical },
    {
      label: copy.overtimeLabel,
      note: overtimeNote(payslip),
      amount: payslip.overtimePay,
    },
    ...payslip.customFields
      .filter((field) => field.amount >= 0)
      .map((field) => ({ label: field.label, amount: field.amount })),
  ];
};

export const buildPayslipDeductions = (payslip: Payslip): PayslipLineItem[] => {
  const unpaidDays = payslipUnpaidDays(payslip);

  return [
    {
      label: copy.unpaidLeavesLabel,
      note:
        unpaidDays > 0
          ? `${unpaidDays} ${unpaidDays === 1 ? 'day' : 'days'} unpaid`
          : undefined,
      amount: payslipUnpaidLeaveDeduction(payslip),
    },
    { label: copy.taxLabel, amount: payslip.taxDeduction },
    ...payslip.customFields
      .filter((field) => field.amount < 0)
      .map((field) => ({ label: field.label, amount: Math.abs(field.amount) })),
  ];
};

export const sumLineItems = (items: PayslipLineItem[]) =>
  items.reduce((sum, item) => sum + item.amount, 0);
