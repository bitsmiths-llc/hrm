import {
  type ApprovalKind,
  type PendingApproval,
} from '@/hooks/queries/pending-approvals';

import { formatDate } from '@/utils/date-functions';
import { formatCurrency } from '@/utils/number-functions';

import {
  leaveTypeLabels,
  medicalClaimForLabels,
  medicalServiceTypeLabels,
} from '@/constants/hrm-labels';

import {
  EmployeeListItem,
  LeaveRequest,
  MedicalClaim,
  OvertimeLog,
  RequestStatus,
} from '@/types/hrm';

export type { ApprovalKind };

export type ApprovalItem = {
  id: string;
  kind: ApprovalKind;
  employeeName: string;
  title: string;
  summary: string;
  createdAt: string;
  status: RequestStatus;
  fields: { label: string; value: string }[];
  /** Only present for medical claims. */
  proofFiles?: string[];
};

export const approvalKindLabels: Record<ApprovalKind, string> = {
  leave: 'Leave',
  medical: 'Medical',
  overtime: 'Overtime',
  onboarding: 'Onboarding',
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
      { label: 'Submitted', value: formatDate(claim.createdAt) },
    ],
    proofFiles: claim.proofFiles,
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

// Onboarding has no per-request table — a `submitted` employee *is* the item, so
// the timestamp comes from the RPC row (consent_at → updated_at) and the detail
// fields are enriched from the directory list when it's loaded.
export function onboardingToItem(
  row: PendingApproval,
  employee?: EmployeeListItem,
): ApprovalItem {
  return {
    id: row.item_id,
    kind: 'onboarding',
    employeeName: row.employee_name,
    title: 'Onboarding submission',
    summary: employee?.designation
      ? [employee.designation, employee.department].filter(Boolean).join(' · ')
      : 'Submitted for review',
    createdAt: row.submitted_at,
    status: 'pending',
    fields: [
      { label: 'Employee', value: row.employee_name },
      ...(employee?.email ? [{ label: 'Email', value: employee.email }] : []),
      ...(employee?.designation
        ? [{ label: 'Designation', value: employee.designation }]
        : []),
      ...(employee?.department
        ? [{ label: 'Department', value: employee.department }]
        : []),
      { label: 'Submitted', value: formatDate(row.submitted_at) },
    ],
  };
}

// Fallback when the per-module admin read backing a row's rich detail hasn't
// resolved yet (or the row briefly outlives its source). The queue's membership
// and order come from `pending_approvals()`, so a row must always render — here
// from the normalized RPC fields alone.
export function fallbackToItem(row: PendingApproval): ApprovalItem {
  return {
    id: row.item_id,
    kind: row.kind,
    employeeName: row.employee_name,
    title: approvalKindLabels[row.kind],
    summary:
      row.amount != null
        ? `${row.summary} · ${formatCurrency(row.amount)}`
        : row.summary,
    createdAt: row.submitted_at,
    status: 'pending',
    fields: [
      { label: 'Employee', value: row.employee_name },
      { label: 'Summary', value: row.summary },
      ...(row.amount != null
        ? [{ label: 'Amount', value: formatCurrency(row.amount) }]
        : []),
      { label: 'Submitted', value: formatDate(row.submitted_at) },
    ],
  };
}
