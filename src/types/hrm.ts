// Domain types for Bitsmiths HRM (PRD-aligned). These mirror the intended
// Supabase schema so the later mock → backend swap only touches the hooks.

/** Onboarding completion moves the account to `submitted`, an admin review
 *  queue. An admin approves it (→ active) or returns it (→ onboarding) with a
 *  note (BIT-10). */
export type AccountStatus = 'invited' | 'onboarding' | 'submitted' | 'active';

export type RequestStatus = 'pending' | 'approved' | 'rejected';

export type EmploymentType = 'full_time' | 'part_time';

/** Paid, Sick, and Half Day draw from the shared 22-day pool (half day = 0.5).
 *  Unpaid is separate, uncapped, and the only type that prorates pay. */
export type LeaveType = 'paid' | 'sick' | 'unpaid' | 'half_day';

export type MedicalClaimFor = 'self' | 'parent' | 'spouse' | 'child';

export type MedicalServiceType =
  | 'opd'
  | 'medicine'
  | 'procedure'
  | 'hospitalization';

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
  baseSalary: number; // PKR
  workingHours: number; // standard hours per pay period
  designation: string;
  department: string;
  status: AccountStatus;
  /** Admin's note when a submission is returned to onboarding (BIT-10). */
  reviewNote: string | null;
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

export type Policy = {
  id: string;
  title: string;
  version: number;
  summary: string;
  updatedAt: string;
  acknowledged: boolean; // for the current viewer (employee side)
};
