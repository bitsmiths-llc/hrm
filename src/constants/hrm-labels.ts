import {
  AccountStatus,
  EmploymentType,
  LeaveType,
  MedicalClaimFor,
  MedicalServiceType,
  PayrollCycleStatus,
  RequestStatus,
} from '@/types/hrm';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

type StatusPresentation = { label: string; variant: BadgeVariant };

export const requestStatusLabels: Record<RequestStatus, StatusPresentation> = {
  pending: { label: 'Pending', variant: 'secondary' },
  approved: { label: 'Approved', variant: 'default' },
  rejected: { label: 'Rejected', variant: 'destructive' },
};

export const accountStatusLabels: Record<AccountStatus, StatusPresentation> = {
  invited: { label: 'Invited', variant: 'outline' },
  onboarding: { label: 'Onboarding', variant: 'secondary' },
  submitted: { label: 'In Review', variant: 'secondary' },
  active: { label: 'Active', variant: 'default' },
};

export const payrollCycleStatusLabels: Record<
  PayrollCycleStatus,
  StatusPresentation
> = {
  open: { label: 'Open', variant: 'secondary' },
  calculating: { label: 'Calculating', variant: 'outline' },
  locked: { label: 'Locked', variant: 'default' },
};

export const leaveTypeLabels: Record<LeaveType, string> = {
  paid: 'Paid Leave',
  sick: 'Sick Leave',
  unpaid: 'Unpaid Leave',
  half_day: 'Half Day',
};

export const employmentTypeLabels: Record<EmploymentType, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
};

export const medicalClaimForLabels: Record<MedicalClaimFor, string> = {
  self: 'Self',
  parent: 'Parent',
  spouse: 'Spouse',
  child: 'Child',
};

export const medicalServiceTypeLabels: Record<MedicalServiceType, string> = {
  opd: 'OPD',
  medicine: 'Prescribed Medicine',
  procedure: 'Medical Procedure',
  hospitalization: 'Hospitalization',
};
