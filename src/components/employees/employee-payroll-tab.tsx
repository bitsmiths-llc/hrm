'use client';

import { usePayslips } from '@/hooks/queries/payroll';

import { PayslipsTable } from '@/components/payroll/payslips-table';

type EmployeePayrollTabProps = {
  employeeId: string;
};

export function EmployeePayrollTab({ employeeId }: EmployeePayrollTabProps) {
  const { data: payslips, isLoading } = usePayslips(employeeId);

  return <PayslipsTable payslips={payslips} isLoading={isLoading} />;
}
