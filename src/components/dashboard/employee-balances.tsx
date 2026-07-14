'use client';

import { Receipt } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

import { useCurrentEmployee } from '@/hooks/queries/employees';
import { useLeaveBalance, useLeaveRequests } from '@/hooks/queries/leave';
import { useMedicalBalance } from '@/hooks/queries/medical';

import { BalanceCard } from '@/components/hrm/balance-card';
import { StatCard } from '@/components/hrm/stat-card';
import { Skeleton } from '@/components/ui/skeleton';

import { formatCurrency } from '@/utils/number-functions';

import { mockCurrentEmployee } from '@/constants/mock/employees';
import { mockPayslips } from '@/constants/mock/payroll';
import { paths } from '@/constants/paths';

export function EmployeeBalances() {
  // Leave and medical balances are real, scoped to the signed-in employee. The
  // medical hook merges the admin-configured cap/accrual in from settings.
  const { data: me } = useCurrentEmployee();
  const { data: leaveBalance, isLoading: leaveLoading } = useLeaveBalance(
    me?.id,
  );
  const { data: leaveRequests } = useLeaveRequests(me?.id);
  const { data: medicalBalance, isLoading: medicalLoading } = useMedicalBalance(
    me?.id,
  );

  // Unpaid is excluded from the pool RPC by design, so derive it from the
  // request history — mirrors the /leave balance cards.
  const year = new Date().getFullYear();
  const unpaidTaken = useMemo(
    () =>
      (leaveRequests ?? [])
        .filter(
          (request) =>
            request.type === 'unpaid' &&
            request.status === 'approved' &&
            request.startDate.startsWith(String(year)),
        )
        .reduce((sum, request) => sum + request.days, 0),
    [leaveRequests, year],
  );

  // Payslips are still mock (payroll isn't wired yet), keyed by the mock
  // employee.
  const latestPayslip = mockPayslips
    .filter((payslip) => payslip.employeeId === mockCurrentEmployee.id)
    .sort((a, b) => b.cycleMonth.localeCompare(a.cycleMonth))[0];

  if (leaveLoading || medicalLoading || !leaveBalance || !medicalBalance) {
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
        used={leaveBalance.used}
        total={leaveBalance.poolTotal}
        format={(days) => `${days} days`}
        hint={`Unpaid taken this year: ${unpaidTaken} days`}
      />
      <BalanceCard
        title='Medical Allowance'
        mode='accrued'
        used={medicalBalance.accrued}
        total={medicalBalance.cap}
        format={(amount) => formatCurrency(amount) || '0'}
        hint={`Accrues ${formatCurrency(medicalBalance.monthlyAccrual)}/month`}
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
