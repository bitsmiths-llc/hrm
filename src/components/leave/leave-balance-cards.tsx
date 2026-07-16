'use client';

import { CalendarOff } from 'lucide-react';
import { useMemo } from 'react';

import { useLeaveBalance, useLeaveRequests } from '@/hooks/queries/leave';

import { BalanceCard } from '@/components/hrm/balance-card';
import { StatCard } from '@/components/hrm/stat-card';
import { Skeleton } from '@/components/ui/skeleton';

type LeaveBalanceCardsProps = {
  /** Whose balance to show. Undefined on the self page until the signed-in
   *  identity resolves — the cards render a skeleton until it does. */
  employeeId?: string;
  /** 'all' | 'YYYY' | 'YYYY-MM' — the period selected by the page-level
   *  month filter. Pool usage is always summed per-year regardless of
   *  month, since the pool itself resets annually. */
  month: string;
};

export function LeaveBalanceCards({
  employeeId,
  month,
}: LeaveBalanceCardsProps) {
  const year =
    month === 'all' ? new Date().getFullYear() : Number(month.slice(0, 4));

  // Pool totals come from the canonical leave_balance() RPC (paid + sick +
  // half_day, approved only). Unpaid is excluded there by design, so it's
  // derived separately from the request history and surfaced as informational.
  const { data: balance, isLoading: balanceLoading } = useLeaveBalance(
    employeeId,
    year,
  );
  const { data: requests, isLoading: requestsLoading } =
    useLeaveRequests(employeeId);

  const unpaidTaken = useMemo(
    () =>
      (requests ?? [])
        .filter(
          (request) =>
            request.type === 'unpaid' &&
            request.status === 'approved' &&
            request.startDate.startsWith(String(year)),
        )
        .reduce((sum, request) => sum + request.days, 0),
    [requests, year],
  );

  if (balanceLoading || requestsLoading || !balance) {
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
        used={balance.used}
        total={balance.poolTotal}
        format={(days) => `${days} days`}
        hint='Half days consume 0.5 from the pool · resets each year'
      />
      <StatCard
        label={`Unpaid Leave Taken · ${year}`}
        value={`${unpaidTaken} days`}
        icon={CalendarOff}
        hint='Not counted toward pool · reduces salary · reviewed individually'
      />
    </div>
  );
}
