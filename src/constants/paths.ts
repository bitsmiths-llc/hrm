export const paths = {
  home: '/',
  auth: {
    login: '/auth/login',
    acceptInvitation: '/auth/accept-invitation',
    confirm: '/auth/confirm',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    callback: '/auth/callback',
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
