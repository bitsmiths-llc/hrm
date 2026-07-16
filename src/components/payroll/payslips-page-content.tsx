'use client';

import { useCurrentEmployee } from '@/hooks/queries/employees';
import { usePayslips } from '@/hooks/queries/payroll';

import { PageHeader } from '@/components/hrm/page-header';

import { PayslipsTable } from './payslips-table';

export function PayslipsPageContent() {
  // RLS (`payslip_own_locked`) already scopes payslips to the signed-in employee
  // and only their *locked* runs, so passing the caller's own id is sufficient.
  const { data: employee, isLoading: employeeLoading } = useCurrentEmployee();
  const { data: payslips, isLoading: payslipsLoading } = usePayslips(
    employee?.id,
  );

  return (
    <>
      <PageHeader
        title='Payslips'
        description='What you were paid and how each cycle was calculated.'
      />
      <PayslipsTable
        payslips={payslips}
        isLoading={employeeLoading || payslipsLoading}
      />
    </>
  );
}
