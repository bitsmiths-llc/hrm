'use client';

import { useOvertimeLogs } from '@/hooks/queries/overtime';

import { OvertimeLogsTable } from './overtime-logs-table';

type OvertimeHistoryTableProps = {
  /** The signed-in employee's id (undefined while their identity loads). */
  employeeId?: string;
  month: string;
};

export function OvertimeHistoryTable({
  employeeId,
  month,
}: OvertimeHistoryTableProps) {
  const { data: logs, isLoading } = useOvertimeLogs(employeeId);

  return (
    <OvertimeLogsTable
      logs={logs}
      isLoading={isLoading}
      emptyDescription='Your logged hours and their status will show up here.'
      title='Recent Logs'
      month={month}
    />
  );
}
