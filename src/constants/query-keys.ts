export enum QueryKeys {
  USER = 'user',

  // Employee & Onboarding domain
  EMPLOYEES = 'employees', // list
  EMPLOYEE = 'employee', // detail, keyed by id
  CURRENT_EMPLOYEE = 'current-employee', // signed-in user's identity (sidebar/greeting)
  MY_PROFILE = 'my-profile', // caller's full self-service profile (BIT-11)
  ONBOARDING = 'onboarding', // caller's own onboarding wizard data (M1.4)
  PENDING_STATUS = 'pending-status', // caller's own account_status, polled on /pending
  EMPLOYEE_DOCUMENTS = 'employee-documents',
  IDENTITY_DOC_FILES = 'identity-doc-files', // signed URLs + mime for previews

  // Payroll, leave & settings domain
  LEAVE_REQUESTS = 'leave-requests',
  LEAVE_BALANCE = 'leave-balance',
  MEDICAL_CLAIMS = 'medical-claims',
  MEDICAL_BALANCE = 'medical-balance',
  OVERTIME_LOGS = 'overtime-logs',
  PAYSLIPS = 'payslips',
  PAYROLL_CYCLES = 'payroll-cycles',
  POLICIES = 'policies',
  HRM_SETTINGS = 'hrm-settings',
}
