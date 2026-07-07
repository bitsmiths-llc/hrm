import { formatDate } from '@/utils/date-functions';
import { formatCurrency } from '@/utils/number-functions';

import {
  leaveTypeLabels,
  medicalClaimForLabels,
  medicalServiceTypeLabels,
} from '@/constants/hrm-labels';

import {
  LeaveRequest,
  MedicalClaim,
  OvertimeLog,
  RequestStatus,
} from '@/types/hrm';

export type ApprovalKind = 'leave' | 'medical' | 'overtime';

export type ApprovalItem = {
  id: string;
  kind: ApprovalKind;
  employeeName: string;
  title: string;
  summary: string;
  createdAt: string;
  status: RequestStatus;
  fields: { label: string; value: string }[];
};

export const approvalKindLabels: Record<ApprovalKind, string> = {
  leave: 'Leave',
  medical: 'Medical',
  overtime: 'Overtime',
};

export function leaveToItem(request: LeaveRequest): ApprovalItem {
  return {
    id: request.id,
    kind: 'leave',
    employeeName: request.employeeName,
    title: leaveTypeLabels[request.type],
    summary: `${request.days} day(s) from ${formatDate(request.startDate)}`,
    createdAt: request.createdAt,
    status: request.status,
    fields: [
      { label: 'Employee', value: request.employeeName },
      { label: 'Type', value: leaveTypeLabels[request.type] },
      { label: 'First day', value: formatDate(request.startDate) },
      { label: 'Days', value: String(request.days) },
      { label: 'Reason', value: request.reason },
      { label: 'Requested', value: formatDate(request.createdAt) },
    ],
  };
}

export function medicalToItem(claim: MedicalClaim): ApprovalItem {
  return {
    id: claim.id,
    kind: 'medical',
    employeeName: claim.employeeName,
    title: `Medical · ${medicalServiceTypeLabels[claim.serviceType]}`,
    summary: `${formatCurrency(claim.amount)} · ${medicalClaimForLabels[claim.claimFor]}`,
    createdAt: claim.createdAt,
    status: claim.status,
    fields: [
      { label: 'Employee', value: claim.employeeName },
      { label: 'For', value: medicalClaimForLabels[claim.claimFor] },
      {
        label: 'Service',
        value: medicalServiceTypeLabels[claim.serviceType],
      },
      { label: 'Amount', value: formatCurrency(claim.amount) },
      { label: 'Expense date', value: formatDate(claim.expenseDate) },
      { label: 'Description', value: claim.description },
      { label: 'Proof files', value: claim.proofFiles.join(', ') || '—' },
      { label: 'Submitted', value: formatDate(claim.createdAt) },
    ],
  };
}

export function overtimeToItem(log: OvertimeLog): ApprovalItem {
  return {
    id: log.id,
    kind: 'overtime',
    employeeName: log.employeeName,
    title: `Overtime · ${log.hours}h`,
    summary: `${formatDate(log.date)} · ${log.project}`,
    createdAt: log.createdAt,
    status: log.status,
    fields: [
      { label: 'Employee', value: log.employeeName },
      { label: 'Date', value: formatDate(log.date) },
      { label: 'Hours', value: String(log.hours) },
      { label: 'Project', value: log.project },
      { label: 'Task', value: log.task },
      { label: 'Logged', value: formatDate(log.createdAt) },
    ],
  };
}
