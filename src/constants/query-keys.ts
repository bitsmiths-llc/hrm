export enum QueryKeys {
  USER = 'user',

  // Employee & Onboarding domain
  EMPLOYEES = 'employees', // list
  EMPLOYEE = 'employee', // detail, keyed by id
  MY_PROFILE = 'my-profile', // self-service (M1.5)
  ONBOARDING = 'onboarding', // caller's own onboarding wizard data (M1.4)
  ONBOARDING_QUEUE = 'onboarding-queue', // submitted rows (M1.4)
  EMPLOYEE_DOCUMENTS = 'employee-documents',

  LEAVE_REQUESTS = 'leave-requests',
  LEAVE_BALANCE = 'leave-balance',
  MEDICAL_CLAIMS = 'medical-claims',
  MEDICAL_BALANCE = 'medical-balance',
  OVERTIME_LOGS = 'overtime-logs',
  PAYSLIPS = 'payslips',
  PAYROLL_CYCLES = 'payroll-cycles',
  POLICIES = 'policies',
}
