'use client';

import { useMedicalBalance, useMedicalClaims } from '@/hooks/queries/medical';

import { BalanceCard } from '@/components/hrm/balance-card';
import { MedicalClaimsTable } from '@/components/medical/medical-claims-table';
import { Skeleton } from '@/components/ui/skeleton';

import { formatCurrency } from '@/utils/number-functions';

type EmployeeMedicalTabProps = {
  employeeId: string;
};

export function EmployeeMedicalTab({ employeeId }: EmployeeMedicalTabProps) {
  const { data: balance, isLoading: balanceLoading } =
    useMedicalBalance(employeeId);
  const { data: claims, isLoading: claimsLoading } =
    useMedicalClaims(employeeId);

  return (
    <div className='flex flex-col gap-4'>
      {balanceLoading || !balance ? (
        <Skeleton className='h-40 w-full max-w-md rounded-xl' />
      ) : (
        <div className='max-w-md'>
          <BalanceCard
            title='Medical Allowance'
            used={balance.cap - balance.accrued}
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
