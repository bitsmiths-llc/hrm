'use client';

import { Banknote, CheckSquare, Users } from 'lucide-react';

import {
  useAllLeaveRequests,
  useAllMedicalClaims,
  useAllOvertimeLogs,
} from '@/hooks/queries/approvals';

import { StatCard } from '@/components/hrm/stat-card';

import { formatCurrency } from '@/utils/number-functions';

import { payrollCycleStatusLabels } from '@/constants/hrm-labels';
import { mockEmployees } from '@/constants/mock/employees';
import { mockPayrollCycles } from '@/constants/mock/payroll';

export function AdminStats() {
  const { data: leaveRequests } = useAllLeaveRequests();
  const { data: medicalClaims } = useAllMedicalClaims();
  const { data: overtimeLogs } = useAllOvertimeLogs();
  const pendingApprovals =
    (leaveRequests?.filter((r) => r.status === 'pending').length ?? 0) +
    (medicalClaims?.filter((c) => c.status === 'pending').length ?? 0) +
    (overtimeLogs?.filter((o) => o.status === 'pending').length ?? 0);

  const activeEmployees = mockEmployees.filter(
    (e) => e.status === 'active',
  ).length;

  const currentCycle = mockPayrollCycles[0];
  const lastLocked = mockPayrollCycles.find((c) => c.status === 'locked');

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      <StatCard
        label='Pending Approvals'
        value={pendingApprovals}
        icon={CheckSquare}
        hint='Leave, medical, and overtime requests'
      />
      <StatCard
        label='Active Employees'
        value={activeEmployees}
        icon={Users}
        hint={`${mockEmployees.length} total in directory`}
      />
      <StatCard
        label={`Payroll · ${currentCycle.month}`}
        value={payrollCycleStatusLabels[currentCycle.status].label}
        icon={Banknote}
        hint={
          lastLocked
            ? `Last cycle: ${formatCurrency(lastLocked.totalPayroll)}`
            : undefined
        }
      />
    </div>
  );
}
