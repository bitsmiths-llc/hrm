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

import { EmptyState } from '@/components/hrm/empty-state';
import { StatusCell } from '@/components/hrm/status-cell';
import { DataTable } from '@/components/ui/data-table';
import { CenteredCell } from '@/components/ui/data-table/centered-cell';
import { DataTableColumnHeader } from '@/components/ui/data-table/column-header';
import { TableSkeleton } from '@/components/ui/data-table/table-skeleton';

import { formatDate } from '@/utils/date-functions';

import { OvertimeLog } from '@/types/hrm';

function useOvertimeLogsColumns() {
  return useMemo<ColumnDef<OvertimeLog>[]>(
    () => [
      {
        accessorKey: 'date',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Date' align='center' />
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
          <DataTableColumnHeader column={column} title='Hours' align='center' />
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
          <StatusCell
            status={row.original.status}
            rejectionReason={row.original.rejectionReason}
          />
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
  title?: string;
  /** 'all' | 'YYYY' | 'YYYY-MM' — the period selected by the page-level
   *  month filter. */
  month: string;
};

export function OvertimeLogsTable({
  logs,
  isLoading,
  emptyDescription = 'Logged hours and their status will show up here.',
  title,
  month,
}: OvertimeLogsTableProps) {
  const columns = useOvertimeLogsColumns();
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'date', desc: true },
  ]);
  const filtered = useMemo(() => {
    if (month === 'all') return logs ?? [];
    return (logs ?? []).filter((log) => log.date.startsWith(month));
  }, [logs, month]);

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
      {!!title && <h2 className='text-xl font-semibold'>{title}</h2>}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Clock}
          title='No overtime logged in this period'
          description='Try a different month or year, or switch back to all time.'
        />
      ) : (
        <div className='rounded-lg border border-border'>
          <DataTable table={table} />
        </div>
      )}
    </div>
  );
}
