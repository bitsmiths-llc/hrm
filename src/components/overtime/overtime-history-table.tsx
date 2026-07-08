'use client';

import { useMyOvertimeLogs } from '@/hooks/queries/overtime';

import { OvertimeLogsTable } from './overtime-logs-table';

type OvertimeHistoryTableProps = {
  month: string;
};

export function OvertimeHistoryTable({ month }: OvertimeHistoryTableProps) {
  const { data: logs, isLoading } = useMyOvertimeLogs();

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
