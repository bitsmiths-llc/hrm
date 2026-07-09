import { Employee, LeaveBalance, MedicalBalance } from '@/types/hrm';

export const mockEmployees: Employee[] = [
  {
    id: 'emp-1',
    fullName: 'Ayesha Khan',
    email: 'ayesha@bitsmiths.studio',
    phone: '+92 300 1234567',
    emergencyContact: '+92 301 7654321',
    address: 'House 12, Street 4, F-8/3, Islamabad',
    cnic: '61101-1234567-1',
    dateOfBirth: '1996-03-14',
    bank: {
      bankName: 'Meezan Bank',
      accountHolderName: 'Ayesha Khan',
      accountNumber: '01234567890123',
      iban: 'PK36MEZN0001234567890123',
      branch: 'F-8 Markaz, Islamabad',
    },
    social: {
      github: 'https://github.com/ayeshak',
      linkedin: 'https://linkedin.com/in/ayeshak',
    },
    employmentType: 'full_time',
    employmentStage: 'confirmed',
    baseSalary: 250_000,
    workingHours: 160,
    designation: 'Frontend Engineer',
    department: 'Engineering',
    status: 'active',
    reviewNote: null,
    invitedAt: '2025-02-01',
    joinedAt: '2025-02-10',
  },
  {
    id: 'emp-2',
    fullName: 'Hamza Raza',
    email: 'hamza@bitsmiths.studio',
    phone: '+92 321 5551234',
    emergencyContact: '+92 333 9990011',
    address: 'Flat 7B, Askari 11, Lahore',
    cnic: '35202-9876543-3',
    dateOfBirth: '1993-11-02',
    bank: {
      bankName: 'HBL',
      accountHolderName: 'Hamza Raza',
      accountNumber: '98765432101234',
      iban: 'PK24HABB0098765432101234',
    },
    social: {
      github: 'https://github.com/hamzar',
      linkedin: 'https://linkedin.com/in/hamzar',
      twitter: 'https://twitter.com/hamzar',
    },
    employmentType: 'full_time',
    employmentStage: 'confirmed',
    baseSalary: 320_000,
    workingHours: 160,
    designation: 'Backend Engineer',
    department: 'Engineering',
    status: 'active',
    reviewNote: null,
    invitedAt: '2024-09-15',
    joinedAt: '2024-09-20',
  },
  {
    id: 'emp-3',
    fullName: 'Fatima Noor',
    email: 'fatima@bitsmiths.studio',
    phone: '+92 345 2223344',
    emergencyContact: '+92 300 8887766',
    address: 'House 45, Block C, Gulshan-e-Iqbal, Karachi',
    cnic: '42101-5556667-9',
    dateOfBirth: '1999-07-21',
    bank: null,
    social: null,
    employmentType: 'part_time',
    employmentStage: 'probation',
    baseSalary: 120_000,
    workingHours: 80,
    designation: 'UI/UX Designer',
    department: 'Design',
    status: 'onboarding',
    reviewNote: null,
    invitedAt: '2026-06-20',
    joinedAt: null,
  },
  {
    id: 'emp-4',
    fullName: 'Bilal Ahmed',
    email: 'bilal@bitsmiths.studio',
    phone: '',
    emergencyContact: '',
    address: '',
    cnic: '',
    dateOfBirth: '',
    bank: null,
    social: null,
    employmentType: 'full_time',
    employmentStage: 'probation',
    baseSalary: 0,
    workingHours: 160,
    designation: 'QA Engineer',
    department: 'Engineering',
    status: 'invited',
    reviewNote: null,
    invitedAt: '2026-07-01',
    joinedAt: null,
  },
];

/** Per-employee balances, keyed by employee id — admins need to see any
 *  employee's balance, not just the signed-in one. */
export const mockLeaveBalances: Record<string, LeaveBalance> = {
  'emp-1': { poolTotal: 22, poolUsed: 7.5, unpaidTaken: 2 },
  'emp-2': { poolTotal: 22, poolUsed: 12, unpaidTaken: 4 },
  'emp-3': { poolTotal: 22, poolUsed: 0, unpaidTaken: 0 },
  'emp-4': { poolTotal: 22, poolUsed: 0, unpaidTaken: 0 },
};

export const mockMedicalBalances: Record<string, MedicalBalance> = {
  'emp-1': { accrued: 27_500, cap: 50_000, monthlyAccrual: 5_000 },
  'emp-2': { accrued: 45_000, cap: 50_000, monthlyAccrual: 5_000 },
  'emp-3': { accrued: 0, cap: 50_000, monthlyAccrual: 5_000 },
  'emp-4': { accrued: 0, cap: 50_000, monthlyAccrual: 5_000 },
};

/** The employee the mock "employee role" is signed in as. */
export const mockCurrentEmployee = mockEmployees[0];

/** Balances for the signed-in mock employee (emp-1). */
export const mockLeaveBalance = mockLeaveBalances[mockCurrentEmployee.id];
export const mockMedicalBalance = mockMedicalBalances[mockCurrentEmployee.id];
