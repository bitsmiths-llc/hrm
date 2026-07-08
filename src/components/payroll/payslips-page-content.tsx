'use client';

import { usePayslips } from '@/hooks/queries/payroll';

import { PageHeader } from '@/components/hrm/page-header';

import { mockCurrentEmployee } from '@/constants/mock/employees';

import { PayslipsTable } from './payslips-table';

export function PayslipsPageContent() {
  const { data: payslips, isLoading } = usePayslips(mockCurrentEmployee.id);

  return (
    <>
      <PageHeader
        title='Payslips'
        description='What you were paid and how each cycle was calculated.'
      />
      <PayslipsTable payslips={payslips} isLoading={isLoading} />
    </>
  );
}
