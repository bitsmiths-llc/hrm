'use client';

import { useEmployee } from '@/hooks/queries/employees';
import { useMedicalBalance, useMedicalClaims } from '@/hooks/queries/medical';

import { BalanceCard } from '@/components/hrm/balance-card';
import { MedicalClaimsTable } from '@/components/medical/medical-claims-table';
import { Skeleton } from '@/components/ui/skeleton';

import { isMedicalEligible } from '@/lib/medical-eligibility';
import { formatCurrency } from '@/utils/number-functions';

type EmployeeMedicalTabProps = {
  employeeId: string;
};

export function EmployeeMedicalTab({ employeeId }: EmployeeMedicalTabProps) {
  const { data: employee } = useEmployee(employeeId);
  const { data: balance, isLoading: balanceLoading } =
    useMedicalBalance(employeeId);
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
      {balanceLoading || !balance ? (
        <Skeleton className='h-40 w-full max-w-md rounded-xl' />
      ) : (
        <div className='max-w-md'>
          <BalanceCard
            title='Medical Allowance'
            mode='accrued'
            used={balance.accrued}
            total={balance.cap}
            format={(amount) => formatCurrency(amount) || '0'}
            hint={`Accrues ${formatCurrency(balance.monthlyAccrual)}/month`}
          />
        </div>
      )}
      <MedicalClaimsTable
        claims={claims}
        isLoading={claimsLoading}
        emptyDescription="This employee hasn't filed a medical claim yet."
      />
    </div>
  );
}
