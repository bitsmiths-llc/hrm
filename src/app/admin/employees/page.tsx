import { Metadata } from 'next';

import { EmployeesTable } from '@/components/employees/employees-table';
import { InviteEmployeeDialog } from '@/components/employees/invite-employee-dialog';
import { PageHeader } from '@/components/hrm/page-header';

export const metadata: Metadata = { title: 'Employees' };

export default function EmployeesPage() {
  return (
    <>
      <PageHeader
        title='Employees'
        description='Directory, invitations, and onboarding reviews.'
      >
        <InviteEmployeeDialog />
      </PageHeader>
      <EmployeesTable />
    </>
  );
}
