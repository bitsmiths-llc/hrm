'use client';

import { Receipt } from 'lucide-react';
import Link from 'next/link';

import { useHrmSettings } from '@/hooks/queries/settings';

import { BalanceCard } from '@/components/hrm/balance-card';
import { StatCard } from '@/components/hrm/stat-card';
import { Skeleton } from '@/components/ui/skeleton';

import { formatCurrency } from '@/utils/number-functions';

import {
  mockCurrentEmployee,
  mockLeaveBalance,
  mockMedicalBalance,
} from '@/constants/mock/employees';
import { mockPayslips } from '@/constants/mock/payroll';
import { paths } from '@/constants/paths';

export function EmployeeBalances() {
  const { data: settings, isLoading } = useHrmSettings();

  const latestPayslip = mockPayslips
    .filter((payslip) => payslip.employeeId === mockCurrentEmployee.id)
    .sort((a, b) => b.cycleMonth.localeCompare(a.cycleMonth))[0];

  if (isLoading || !settings) {
    return (
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <Skeleton className='h-40 rounded-xl' />
        <Skeleton className='h-40 rounded-xl' />
        <Skeleton className='h-40 rounded-xl' />
      </div>
    );
  }

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
      <BalanceCard
        title='Leave Pool (Annual)'
        used={mockLeaveBalance.poolUsed}
        total={settings.leavePoolDays}
        format={(days) => `${days} days`}
        hint={`Unpaid taken this year: ${mockLeaveBalance.unpaidTaken} days`}
      />
      <BalanceCard
        title='Medical Allowance'
        mode='accrued'
        used={mockMedicalBalance.accrued}
        total={settings.medicalBalanceCap}
        format={(amount) => formatCurrency(amount) || '0'}
        hint={`Accrues ${formatCurrency(settings.medicalMonthlyAccrual)}/month`}
      />
      {!!latestPayslip && (
        <Link
          href={paths.employee.payslips}
          className='block rounded-xl transition-shadow hover:shadow-md'
        >
          <StatCard
            label='Latest Payslip'
            value={formatCurrency(latestPayslip.total)}
            icon={Receipt}
            hint={`Cycle ${latestPayslip.cycleMonth}`}
          />
        </Link>
      )}
    </div>
  );
}
