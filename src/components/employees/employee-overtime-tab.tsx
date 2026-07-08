'use client';

import { useState } from 'react';

import { useOvertimeLogs } from '@/hooks/queries/overtime';

import { MonthFilter } from '@/components/hrm/month-filter';
import { OvertimeLogsTable } from '@/components/overtime/overtime-logs-table';
import { OvertimeSummaryCards } from '@/components/overtime/overtime-summary-cards';

type EmployeeOvertimeTabProps = {
  employeeId: string;
};

export function EmployeeOvertimeTab({ employeeId }: EmployeeOvertimeTabProps) {
  const [month, setMonth] = useState('all');
  const { data: logs, isLoading } = useOvertimeLogs(employeeId);

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex justify-end'>
        <MonthFilter value={month} onChange={setMonth} />
      </div>
      <OvertimeSummaryCards employeeId={employeeId} month={month} />
      <OvertimeLogsTable
        logs={logs}
        isLoading={isLoading}
        emptyDescription="This employee hasn't logged overtime yet."
        month={month}
      />
    </div>
  );
}
