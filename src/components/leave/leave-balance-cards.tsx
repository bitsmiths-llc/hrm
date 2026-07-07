'use client';

import { CalendarOff } from 'lucide-react';

import { useMyLeaveBalance } from '@/hooks/queries/leave';

import { BalanceCard } from '@/components/hrm/balance-card';
import { StatCard } from '@/components/hrm/stat-card';
import { Skeleton } from '@/components/ui/skeleton';

export function LeaveBalanceCards() {
  const { data: balance, isLoading } = useMyLeaveBalance();

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
        title='Leave Pool (Paid · Sick · Half Day) · Annual'
        used={balance.poolUsed}
        total={balance.poolTotal}
        format={(days) => `${days} days`}
        hint='Half days consume 0.5 from the pool · resets each year'
      />
      <StatCard
        label='Unpaid Leave Taken This Year'
        value={`${balance.unpaidTaken} days`}
        icon={CalendarOff}
        hint='Outside the pool · reduces salary · reviewed individually'
      />
    </div>
  );
}
