// Domain types for Bitsmiths HRM (PRD-aligned). These mirror the intended
// Supabase schema so the later mock → backend swap only touches the hooks.

import { type CustomField } from '@/schema/payroll';

/** Onboarding completion moves the account to `submitted`, an admin review
 *  queue. An admin approves it (→ active) or returns it (→ onboarding) with a
 *  note (BIT-10). */
export type AccountStatus = 'invited' | 'onboarding' | 'submitted' | 'active';

export type RequestStatus = 'pending' | 'approved' | 'rejected';

export type EmploymentType =
  | 'full_time'
  | 'part_time'
  | 'contract'
  | 'internship';

/** Drives medical-allowance eligibility (Medical Allowance Policy §1) —
 *  probation and notice-period employees aren't eligible even if
 *  full-time. */
export type EmploymentStage = 'probation' | 'confirmed' | 'notice_period';

/** Paid, Sick, and Half Day draw from the shared 22-day pool (half day = 0.5).
 *  Unpaid is separate, uncapped, and the only type that prorates pay. */
export type LeaveType = 'paid' | 'sick' | 'unpaid' | 'half_day';

export type MedicalClaimFor = 'self' | 'parent' | 'spouse' | 'child';

/** Medical Allowance Policy §3 — eligible expense categories. */
export type MedicalServiceType =
  | 'consultation'
  | 'hospitalization'
  | 'medication'
  | 'lab_diagnostics'
  | 'emergency'
  | 'dental'
  | 'vision';

export type PayrollCycleStatus = 'open' | 'calculating' | 'locked';

export type BankInfo = {
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  iban: string;
  branch?: string;
};

export type SocialAccounts = {
  github: string;
  linkedin: string;
  twitter?: string;
};

export type Employee = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  emergencyContact: string;
  address: string;
  city: string;
  postalCode: string;
  cnic: string;
  dateOfBirth: string; // ISO date
  bank: BankInfo | null;
  social: SocialAccounts | null;
  employmentType: EmploymentType;
  employmentStage: EmploymentStage;
  baseSalary: number; // PKR
  workingHours: number; // standard hours per month
  designation: string;
  department: string;
  // Per-employee allowance overrides; null means inherit the global setting.
  leavePoolDaysOverride: number | null;
  medicalAccrualMonthlyOverride: number | null; // PKR
  medicalCapOverride: number | null; // PKR
  status: AccountStatus;
  /** Admin's note when a submission is returned to onboarding (BIT-10). */
  reviewNote: string | null;
  invitedAt: string;
  joinedAt: string | null;
};

/** The subset of `Employee` the admin directory list renders. The list query
 *  fetches only these columns so it never ships bank/CNIC/salary/social data for
 *  every employee to the browser — the full `Employee` is loaded per-row on the
 *  detail page instead. */
export type EmployeeListItem = Pick<
  Employee,
  | 'id'
  | 'fullName'
  | 'email'
  | 'designation'
  | 'department'
  | 'employmentType'
  | 'status'
  | 'invitedAt'
>;

export type LeaveRequest = {
  id: string;
  employeeId: string;
  employeeName: string;
  type: LeaveType;
  reason: string;
  startDate: string;
  days: number; // 0.5 for half day
  status: RequestStatus;
  /** Set by admin when status is 'rejected' — shown to the employee (in the
   *  decision email and their leave history). */
  rejectionReason: string | null;
  createdAt: string;
};

export type MedicalClaim = {
  id: string;
  employeeId: string;
  employeeName: string;
  claimFor: MedicalClaimFor;
  serviceType: MedicalServiceType;
  description: string;
  amount: number; // PKR
  expenseDate: string;
  proofFiles: string[]; // file names/URLs
  status: RequestStatus;
  /** Set by admin when status is 'rejected' — shown to the employee. */
  rejectionReason: string | null;
  createdAt: string;
};

export type OvertimeLog = {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  hours: number;
  project: string;
  task: string;
  status: RequestStatus;
  /** Set by admin when status is 'rejected' — shown to the employee. */
  rejectionReason: string | null;
  createdAt: string;
};

export type Payslip = {
  id: string;
  employeeId: string;
  employeeName: string;
  /** Job title at the time the cycle ran — shown on the payslip PDF. */
  designation: string;
  cycleMonth: string; // e.g. '2026-06'
  baseSalary: number;
  daysWorked: number;
  daysInMonth: number;
  totalBase: number;
  medical: number;
  overtimeHours: number;
  /** Per-hour overtime rate (base ÷ working hours × multiplier), frozen on the
   *  snapshot. Shown on the itemized payslip alongside hours and pay. */
  overtimeRate?: number;
  /** Defaults to the global setting, but admin can override it per employee
   *  while the cycle is open — frozen here once the cycle is locked. */
  overtimeMultiplier: number;
  overtimePay: number;
  /** Tax withheld this cycle (global taxRatePercent × gross earnings),
   *  frozen here once the cycle is locked. */
  taxDeduction: number;
  /** Ad-hoc per-employee line items (bonus, deduction, etc.) admin adds
   *  during the cycle — each folds into `total`. */
  customFields: CustomField[];
  total: number;
};

export type PayslipMetaField = {
  label: string;
  value: string;
};

export type PayslipLineItem = {
  label: string;
  note?: string;
  amount: number;
};

export type PayslipLogoVariant = 'default' | 'light' | 'watermark';

export type PayslipContactKind = 'site' | 'phone' | 'pin';

export type PayrollCycle = {
  id: string;
  month: string; // e.g. '2026-06'
  status: PayrollCycleStatus;
  totalPayroll: number;
  employeeCount: number;
  lockedAt: string | null;
};

export type HrmSettings = {
  /** Applied to the hourly rate when calculating overtime pay during a
   *  payroll run. Admin-configured only — never shown to employees
   *  (PRD 5.3.1). */
  overtimeMultiplier: number;
  /** Percentage of gross earnings withheld as tax each payroll cycle.
   *  0 disables tax withholding entirely. */
  taxRatePercent: number;
  /** Size of the shared annual leave pool (Paid + Sick + Half Day), in
   *  days. Resets each year. */
  leavePoolDays: number;
  /** Monthly medical allowance accrual, in PKR. */
  medicalMonthlyAccrual: number;
  /** Absolute cap on accrued medical allowance, in PKR. */
  medicalBalanceCap: number;
};

/** Admin-managed list employees pick from when logging overtime. */
export type Project = {
  id: string;
  name: string;
};

export type PolicyCategory = 'leave' | 'medical' | 'overtime' | 'general';

export type PolicyVersion = {
  version: number;
  /** Rich-text content authored in CKEditor, stored as HTML — not a PDF —
   *  so a diff against the previous version can highlight exactly what
   *  changed for employees, instead of just swapping in a new file. */
  contentHtml: string;
  publishedAt: string;
};

export type Policy = {
  id: string;
  title: string;
  category: PolicyCategory;
  /** Oldest first; the last entry is the current version. */
  versions: PolicyVersion[];
};

/** One employee's acknowledgment of a policy — separate from `Policy`
 *  itself since each employee can be at a different acknowledged version. */
export type PolicyAcknowledgment = {
  policyId: string;
  employeeId: string;
  acknowledgedVersion: number;
  acknowledgedAt: string;
};

export type ContractVersion = {
  version: number;
  fileName: string;
  uploadedAt: string;
  /** e.g. "Annual renewal", "Promoted to Senior Engineer". */
  note: string | null;
};

/** One contract per employee (PRD 6.2 — assumed manual PDF upload, not
 *  system-generated). Admin sees the full version history; the employee
 *  only ever sees their current version. */
export type EmployeeContract = {
  employeeId: string;
  /** Oldest first; the last entry is the current version. */
  versions: ContractVersion[];
};
