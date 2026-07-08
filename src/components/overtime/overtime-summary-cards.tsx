'use client';

import { Clock, Hourglass, Wallet } from 'lucide-react';

import { useMyOvertimeLogs } from '@/hooks/queries/overtime';

import { StatCard } from '@/components/hrm/stat-card';
import { Skeleton } from '@/components/ui/skeleton';

import { formatCurrency } from '@/utils/number-functions';

import { hrmConfig } from '@/constants/hrm-config';
import { mockCurrentEmployee } from '@/constants/mock/employees';

/** PRD 5.3.1: Overtime Rate = Base Salary × Multiplier ÷ Working Hours. */
function overtimeRate() {
  const { baseSalary, workingHours } = mockCurrentEmployee;
  if (!workingHours) return 0;
  return (baseSalary * hrmConfig.overtimeMultiplier) / workingHours;
}

export function OvertimeSummaryCards() {
  const { data: logs, isLoading } = useMyOvertimeLogs();

  if (isLoading) {
    return (
      <div className='grid gap-4 md:grid-cols-3'>
        <Skeleton className='h-32 rounded-xl' />
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

  const estimatedPay = approvedHours * overtimeRate();

  return (
    <div className='grid gap-4 md:grid-cols-3'>
      <StatCard
        label='Approved Hours (this month)'
        value={`${approvedHours}h`}
        icon={Clock}
        hint='Only approved hours are paid'
      />
      <StatCard
        label='Estimated Overtime Pay'
        value={formatCurrency(estimatedPay) || 'PKR 0'}
        icon={Wallet}
        hint={`At ${hrmConfig.overtimeMultiplier}× your hourly rate`}
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
