'use client';

import { CalendarClock } from 'lucide-react';

import { useMyMedicalBalance } from '@/hooks/queries/medical';

import { BalanceCard } from '@/components/hrm/balance-card';
import { StatCard } from '@/components/hrm/stat-card';
import { Skeleton } from '@/components/ui/skeleton';

import { formatCurrency } from '@/utils/number-functions';

export function MedicalBalanceCards() {
  const { data: balance, isLoading } = useMyMedicalBalance();

  if (isLoading || !balance) {
    return (
      <div className='grid gap-4 md:grid-cols-2'>
        <Skeleton className='h-40 rounded-xl' />
        <Skeleton className='h-40 rounded-xl' />
      </div>
    );
  }

  return (
    <div className='grid gap-4 md:grid-cols-2'>
      <BalanceCard
        title='Medical Allowance'
        mode='accrued'
        used={balance.accrued}
        total={balance.cap}
        format={(amount) => formatCurrency(amount) || '0'}
        hint={`Accrues ${formatCurrency(balance.monthlyAccrual)}/month`}
      />
      <StatCard
        label='Monthly Accrual'
        value={formatCurrency(balance.monthlyAccrual)}
        icon={CalendarClock}
        hint='Adds to your balance each month, up to the cap'
      />
    </div>
  );
}
