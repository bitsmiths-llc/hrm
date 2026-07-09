export enum QueryKeys {
  USER = 'user',

  // Employee & Onboarding domain
  EMPLOYEES = 'employees', // list
  EMPLOYEE = 'employee', // detail, keyed by id
  MY_PROFILE = 'my-profile', // self-service (M1.5)
  ONBOARDING_QUEUE = 'onboarding-queue', // submitted rows (M1.4)
  EMPLOYEE_DOCUMENTS = 'employee-documents',

  // Payroll, leave & settings domain
  LEAVE_REQUESTS = 'leave-requests',
  MEDICAL_CLAIMS = 'medical-claims',
  MEDICAL_BALANCE = 'medical-balance',
  OVERTIME_LOGS = 'overtime-logs',
  PAYSLIPS = 'payslips',
  PAYROLL_CYCLES = 'payroll-cycles',
  POLICIES = 'policies',
  HRM_SETTINGS = 'hrm-settings',
}
