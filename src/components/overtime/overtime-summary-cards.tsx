'use client';

import { Clock, Hourglass } from 'lucide-react';
import { useMemo } from 'react';

import { useOvertimeLogs } from '@/hooks/queries/overtime';

import { StatCard } from '@/components/hrm/stat-card';
import { Skeleton } from '@/components/ui/skeleton';

type OvertimeSummaryCardsProps = {
  employeeId: string;
  /** 'all' | 'YYYY' | 'YYYY-MM' — the period selected by the page-level
   *  month filter. 'all' defaults to the current month. */
  month: string;
};

function periodLabel(period: string) {
  if (period.length === 4) return period;
  return new Date(`${period}-01T00:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export function OvertimeSummaryCards({
  employeeId,
  month,
}: OvertimeSummaryCardsProps) {
  const { data: logs, isLoading } = useOvertimeLogs(employeeId);

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const period = month === 'all' ? currentMonth : month;

  const { approvedHours, pendingHours } = useMemo(() => {
    const inPeriod = (logs ?? []).filter((log) => log.date.startsWith(period));
    return {
      approvedHours: inPeriod
        .filter((log) => log.status === 'approved')
        .reduce((sum, log) => sum + log.hours, 0),
      pendingHours: inPeriod
        .filter((log) => log.status === 'pending')
        .reduce((sum, log) => sum + log.hours, 0),
    };
  }, [logs, period]);

  if (isLoading) {
    return (
      <div className='grid gap-4 md:grid-cols-2'>
        <Skeleton className='h-32 rounded-xl' />
        <Skeleton className='h-32 rounded-xl' />
      </div>
    );
  }

  return (
    <div className='grid gap-4 md:grid-cols-2'>
      <StatCard
        label={`Approved Hours · ${periodLabel(period)}`}
        value={`${approvedHours}h`}
        icon={Clock}
        hint='Pay is calculated by admin during the payroll run'
      />
      <StatCard
        label={`Pending Hours · ${periodLabel(period)}`}
        value={`${pendingHours}h`}
        icon={Hourglass}
        hint='Awaiting admin approval'
      />
    </div>
  );
}
