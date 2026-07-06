export const paths = {
  home: '/',
  auth: {
    login: '/auth/login',
    register: '/auth/register',
  },
  employee: {
    dashboard: '/dashboard',
    onboarding: '/onboarding',
    leave: '/leave',
    medical: '/medical',
    overtime: '/overtime',
    payslips: '/payslips',
    policies: '/policies',
    profile: '/profile',
  },
  admin: {
    dashboard: '/admin',
    approvals: '/admin/approvals',
    employees: '/admin/employees',
    payroll: '/admin/payroll',
    policies: '/admin/policies',
    settings: '/admin/settings',
  },
} as const;
