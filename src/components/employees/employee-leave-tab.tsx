'use client';

import { CalendarOff } from 'lucide-react';

import { useLeaveBalance, useLeaveRequests } from '@/hooks/queries/leave';

import { BalanceCard } from '@/components/hrm/balance-card';
import { StatCard } from '@/components/hrm/stat-card';
import { LeaveRequestsTable } from '@/components/leave/leave-requests-table';
import { Skeleton } from '@/components/ui/skeleton';

type EmployeeLeaveTabProps = {
  employeeId: string;
};

export function EmployeeLeaveTab({ employeeId }: EmployeeLeaveTabProps) {
  const { data: balance, isLoading: balanceLoading } =
    useLeaveBalance(employeeId);
  const { data: requests, isLoading: requestsLoading } =
    useLeaveRequests(employeeId);

  return (
    <div className='flex flex-col gap-4'>
      {balanceLoading || !balance ? (
        <Skeleton className='h-40 w-full max-w-md rounded-xl' />
      ) : (
        <div className='grid gap-4 sm:grid-cols-2'>
          <BalanceCard
            title='Leave Pool (Paid · Sick · Half Day)'
            used={balance.poolUsed}
            total={balance.poolTotal}
            format={(days) => `${days} days`}
          />
          <StatCard
            label='Unpaid Leave Taken'
            value={`${balance.unpaidTaken} days`}
            icon={CalendarOff}
            hint='Outside the pool · reduces pay'
          />
        </div>
      )}
      <LeaveRequestsTable
        requests={requests}
        isLoading={requestsLoading}
        emptyDescription="This employee hasn't requested leave yet."
      />
    </div>
  );
}
