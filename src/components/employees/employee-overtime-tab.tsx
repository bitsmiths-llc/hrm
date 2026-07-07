'use client';

import { Clock } from 'lucide-react';

import { useOvertimeLogs } from '@/hooks/queries/overtime';

import { StatCard } from '@/components/hrm/stat-card';
import { OvertimeLogsTable } from '@/components/overtime/overtime-logs-table';

type EmployeeOvertimeTabProps = {
  employeeId: string;
};

export function EmployeeOvertimeTab({ employeeId }: EmployeeOvertimeTabProps) {
  const { data: logs, isLoading } = useOvertimeLogs(employeeId);

  const approvedHours = (logs ?? [])
    .filter((log) => log.status === 'approved')
    .reduce((sum, log) => sum + log.hours, 0);

  return (
    <div className='flex flex-col gap-4'>
      <div className='max-w-xs'>
        <StatCard
          label='Approved Hours (all time)'
          value={`${approvedHours}h`}
          icon={Clock}
        />
      </div>
      <OvertimeLogsTable
        logs={logs}
        isLoading={isLoading}
        emptyDescription="This employee hasn't logged overtime yet."
      />
    </div>
  );
}
