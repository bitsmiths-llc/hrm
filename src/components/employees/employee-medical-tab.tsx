'use client';

import { useState } from 'react';

import { useEmployee } from '@/hooks/queries/employees';
import { useMedicalClaims } from '@/hooks/queries/medical';

import { MonthFilter } from '@/components/hrm/month-filter';
import { MedicalBalanceCards } from '@/components/medical/medical-balance-cards';
import { MedicalClaimsTable } from '@/components/medical/medical-claims-table';

import { isMedicalEligible } from '@/lib/medical-eligibility';
import { currentYear } from '@/utils/date-functions';

type EmployeeMedicalTabProps = {
  employeeId: string;
};

export function EmployeeMedicalTab({ employeeId }: EmployeeMedicalTabProps) {
  // Default the claim history to the current year (balance is lifetime).
  const [month, setMonth] = useState(currentYear());
  const { data: employee } = useEmployee(employeeId);
  const { data: claims, isLoading: claimsLoading } =
    useMedicalClaims(employeeId);

  return (
    <div className='flex flex-col gap-4'>
      {!!employee && !isMedicalEligible(employee) && (
        <div className='rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground'>
          This employee is not currently eligible for medical allowance — see
          Employment & Payroll Configuration under the Profile tab.
        </div>
      )}
      <div className='flex justify-end'>
        <MonthFilter value={month} onChange={setMonth} />
      </div>
      <MedicalBalanceCards employeeId={employeeId} />
      <MedicalClaimsTable
        claims={claims}
        isLoading={claimsLoading}
        emptyDescription="This employee hasn't filed a medical claim yet."
        month={month}
      />
    </div>
  );
}
