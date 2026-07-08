'use client';

import { Clock, Hourglass } from 'lucide-react';

import { useMyOvertimeLogs } from '@/hooks/queries/overtime';

import { StatCard } from '@/components/hrm/stat-card';
import { Skeleton } from '@/components/ui/skeleton';

export function OvertimeSummaryCards() {
  const { data: logs, isLoading } = useMyOvertimeLogs();

  if (isLoading) {
    return (
      <div className='grid gap-4 md:grid-cols-2'>
        <Skeleton className='h-32 rounded-xl' />
        <Skeleton className='h-32 rounded-xl' />
      </div>
    );
  }

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonthLogs = (logs ?? []).filter((log) =>
    log.date.startsWith(currentMonth),
  );

  const approvedHours = thisMonthLogs
    .filter((log) => log.status === 'approved')
    .reduce((sum, log) => sum + log.hours, 0);

  const pendingHours = thisMonthLogs
    .filter((log) => log.status === 'pending')
    .reduce((sum, log) => sum + log.hours, 0);

  return (
    <div className='grid gap-4 md:grid-cols-2'>
      <StatCard
        label='Approved Hours (this month)'
        value={`${approvedHours}h`}
        icon={Clock}
        hint='Pay is calculated by admin during the payroll run'
      />
      <StatCard
        label='Pending Hours'
        value={`${pendingHours}h`}
        icon={Hourglass}
        hint='Awaiting admin approval'
      />
    </div>
  );
}
