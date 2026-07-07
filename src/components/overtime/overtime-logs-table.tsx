'use client';

import {
  type ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Clock } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useMonthFilter } from '@/hooks/use-month-filter';

import { EmptyState } from '@/components/hrm/empty-state';
import { MonthFilter } from '@/components/hrm/month-filter';
import { StatusBadge } from '@/components/hrm/status-badge';
import { DataTable } from '@/components/ui/data-table';
import { CenteredCell } from '@/components/ui/data-table/centered-cell';
import { DataTableColumnHeader } from '@/components/ui/data-table/column-header';
import { TableSkeleton } from '@/components/ui/data-table/table-skeleton';

import { formatDate } from '@/utils/date-functions';

import { OvertimeLog } from '@/types/hrm';

const getLogDate = (log: OvertimeLog) => log.date;

function useOvertimeLogsColumns() {
  return useMemo<ColumnDef<OvertimeLog>[]>(
    () => [
      {
        accessorKey: 'date',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Date' />
        ),
        cell: (props) => (
          <CenteredCell
            {...props}
            formatter={(value) => formatDate(value as string)}
            className='whitespace-nowrap'
          />
        ),
      },
      {
        accessorKey: 'hours',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Hours' />
        ),
        cell: (props) => <CenteredCell {...props} />,
      },
      {
        accessorKey: 'project',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Project' />
        ),
        cell: ({ getValue }) => (
          <span className='font-medium'>{getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'task',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Task' />
        ),
        cell: ({ getValue }) => (
          <p className='max-w-[280px] truncate text-muted-foreground'>
            {getValue() as string}
          </p>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Status' />
        ),
        cell: ({ row }) => (
          <div className='flex justify-center'>
            <StatusBadge status={row.original.status} />
          </div>
        ),
      },
    ],
    [],
  );
}

type OvertimeLogsTableProps = {
  logs: OvertimeLog[] | undefined;
  isLoading: boolean;
  emptyDescription?: string;
};

export function OvertimeLogsTable({
  logs,
  isLoading,
  emptyDescription = 'Logged hours and their status will show up here.',
}: OvertimeLogsTableProps) {
  const columns = useOvertimeLogsColumns();
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'date', desc: true },
  ]);
  const { month, setMonth, months, filtered } = useMonthFilter(
    logs,
    getLogDate,
  );

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  if (isLoading) return <TableSkeleton rows={3} columns={5} />;

  if (!logs?.length) {
    return (
      <EmptyState
        icon={Clock}
        title='No overtime logged yet'
        description={emptyDescription}
      />
    );
  }

  return (
    <div className='flex flex-col gap-3'>
      <MonthFilter months={months} value={month} onChange={setMonth} />
      {filtered.length === 0 ? (
        <EmptyState
          icon={Clock}
          title='No overtime logged this month'
          description='Try a different month, or switch back to all time.'
        />
      ) : (
        <div className='rounded-lg border border-border'>
          <DataTable table={table} />
        </div>
      )}
    </div>
  );
}
