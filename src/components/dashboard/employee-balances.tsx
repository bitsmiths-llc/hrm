import { Receipt } from 'lucide-react';
import Link from 'next/link';

import { BalanceCard } from '@/components/hrm/balance-card';
import { StatCard } from '@/components/hrm/stat-card';

import { formatCurrency } from '@/utils/number-functions';

import {
  mockCurrentEmployee,
  mockLeaveBalance,
  mockMedicalBalance,
} from '@/constants/mock/employees';
import { mockPayslips } from '@/constants/mock/payroll';
import { paths } from '@/constants/paths';

export function EmployeeBalances() {
  const latestPayslip = mockPayslips
    .filter((payslip) => payslip.employeeId === mockCurrentEmployee.id)
    .sort((a, b) => b.cycleMonth.localeCompare(a.cycleMonth))[0];

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
      <BalanceCard
        title='Leave Pool (Annual)'
        used={mockLeaveBalance.poolUsed}
        total={mockLeaveBalance.poolTotal}
        format={(days) => `${days} days`}
        hint={`Unpaid taken this year: ${mockLeaveBalance.unpaidTaken} days`}
      />
      <BalanceCard
        title='Medical Allowance'
        mode='accrued'
        used={mockMedicalBalance.accrued}
        total={mockMedicalBalance.cap}
        format={(amount) => formatCurrency(amount) || '0'}
        hint={`Accrues ${formatCurrency(mockMedicalBalance.monthlyAccrual)}/month`}
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
