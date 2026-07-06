import { Metadata } from 'next';

import { ComingSoon } from '@/components/hrm/coming-soon';

export const metadata: Metadata = { title: 'Employees' };

export default function EmployeesPage() {
  return (
    <ComingSoon
      title='Employees'
      description='Directory, invitations, and onboarding reviews.'
    />
  );
}
