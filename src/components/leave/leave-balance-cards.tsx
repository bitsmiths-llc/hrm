'use client';

import { CalendarOff } from 'lucide-react';
import { useMemo } from 'react';

import { useLeaveRequests } from '@/hooks/queries/leave';

import { BalanceCard } from '@/components/hrm/balance-card';
import { StatCard } from '@/components/hrm/stat-card';
import { Skeleton } from '@/components/ui/skeleton';

const POOL_TOTAL = 22;

type LeaveBalanceCardsProps = {
  employeeId: string;
  /** 'all' | 'YYYY' | 'YYYY-MM' — the period selected by the page-level
   *  month filter. Pool usage is always summed per-year regardless of
   *  month, since the pool itself resets annually. */
  month: string;
};

export function LeaveBalanceCards({
  employeeId,
  month,
}: LeaveBalanceCardsProps) {
  const { data: requests, isLoading } = useLeaveRequests(employeeId);

  const year =
    month === 'all' ? new Date().getFullYear() : Number(month.slice(0, 4));

  const { poolUsed, unpaidTaken } = useMemo(() => {
    const approvedInYear = (requests ?? []).filter(
      (request) =>
        request.startDate.startsWith(String(year)) &&
        request.status === 'approved',
    );
    return {
      poolUsed: approvedInYear
        .filter((request) => request.type !== 'unpaid')
        .reduce((sum, request) => sum + request.days, 0),
      unpaidTaken: approvedInYear
        .filter((request) => request.type === 'unpaid')
        .reduce((sum, request) => sum + request.days, 0),
    };
  }, [requests, year]);

  if (isLoading) {
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
        title={`Leave Pool (Paid · Sick · Half Day) · ${year}`}
        used={poolUsed}
        total={POOL_TOTAL}
        format={(days) => `${days} days`}
        hint='Half days consume 0.5 from the pool · resets each year'
      />
      <StatCard
        label={`Unpaid Leave Taken · ${year}`}
        value={`${unpaidTaken} days`}
        icon={CalendarOff}
        hint='Outside the pool · reduces salary · reviewed individually'
      />
    </div>
  );
}
