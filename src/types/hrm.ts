// Domain types for Bitsmiths HRM (PRD-aligned). These mirror the intended
// Supabase schema so the later mock → backend swap only touches the hooks.

/** Onboarding completion activates the account directly — there is no
 *  admin review step. */
export type AccountStatus = 'invited' | 'onboarding' | 'active';

export type RequestStatus = 'pending' | 'approved' | 'rejected';

export type EmploymentType = 'full_time' | 'part_time';

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
  cnic: string;
  dateOfBirth: string; // ISO date
  bank: BankInfo | null;
  social: SocialAccounts | null;
  employmentType: EmploymentType;
  employmentStage: EmploymentStage;
  baseSalary: number; // PKR
  workingHours: number; // standard hours per pay period
  designation: string;
  status: AccountStatus;
  invitedAt: string;
  joinedAt: string | null;
};

export type LeaveBalance = {
  poolTotal: number; // 22
  poolUsed: number; // paid + sick + 0.5 * half days, approved only
  unpaidTaken: number; // outside the pool
};

export type MedicalBalance = {
  accrued: number; // current claimable balance, PKR
  cap: number; // 50,000
  monthlyAccrual: number; // 5,000
};

export type LeaveRequest = {
  id: string;
  employeeId: string;
  employeeName: string;
  type: LeaveType;
  reason: string;
  startDate: string;
  days: number; // 0.5 for half day
  status: RequestStatus;
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
  createdAt: string;
};

export type Payslip = {
  id: string;
  employeeId: string;
  employeeName: string;
  cycleMonth: string; // e.g. '2026-06'
  baseSalary: number;
  daysWorked: number;
  daysInMonth: number;
  totalBase: number;
  medical: number;
  overtimeHours: number;
  /** Defaults to the global setting, but admin can override it per employee
   *  while the cycle is open — frozen here once the cycle is locked. */
  overtimeMultiplier: number;
  overtimePay: number;
  total: number;
};

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
  description: string;
  techStack: string[];
  /** Repo or live URL. Optional — some internal projects have none. */
  url: string;
  /** Inactive projects are hidden from overtime logging and onboarding. */
  active: boolean;
};

/** The single reusable invitation email (PRD 6.4) — one template, edited in
 *  admin config and sent on every invite. `{{placeholders}}` are filled in
 *  per recipient when the invite goes out. */
export type OnboardingEmailTemplate = {
  subject: string;
  /** Rich-text body authored in CKEditor, stored as HTML. */
  bodyHtml: string;
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
