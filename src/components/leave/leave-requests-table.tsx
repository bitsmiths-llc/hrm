'use client';

import {
  type ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Palmtree } from 'lucide-react';
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

import { leaveTypeLabels } from '@/constants/hrm-labels';

import { LeaveRequest } from '@/types/hrm';

const getStartDate = (request: LeaveRequest) => request.startDate;

function useLeaveHistoryColumns() {
  return useMemo<ColumnDef<LeaveRequest>[]>(
    () => [
      {
        accessorKey: 'type',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Type' />
        ),
        cell: ({ row }) => (
          <span className='font-medium'>
            {leaveTypeLabels[row.original.type]}
          </span>
        ),
      },
      {
        accessorKey: 'startDate',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='From' />
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
        accessorKey: 'days',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Days' />
        ),
        cell: (props) => <CenteredCell {...props} />,
      },
      {
        accessorKey: 'reason',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Reason' />
        ),
        cell: ({ getValue }) => (
          <p className='max-w-[320px] truncate text-muted-foreground'>
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

type LeaveRequestsTableProps = {
  requests: LeaveRequest[] | undefined;
  isLoading: boolean;
  emptyDescription?: string;
};

/** Presentational leave table — used by both the employee's own /leave
 *  page and the admin's per-employee view. */
export function LeaveRequestsTable({
  requests,
  isLoading,
  emptyDescription = 'Requests and their status will show up here.',
}: LeaveRequestsTableProps) {
  const columns = useLeaveHistoryColumns();
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'startDate', desc: true },
  ]);
  const { month, setMonth, months, filtered } = useMonthFilter(
    requests,
    getStartDate,
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

  if (!requests?.length) {
    return (
      <EmptyState
        icon={Palmtree}
        title='No leave requests yet'
        description={emptyDescription}
      />
    );
  }

  return (
    <div className='flex flex-col gap-3'>
      <MonthFilter months={months} value={month} onChange={setMonth} />
      {filtered.length === 0 ? (
        <EmptyState
          icon={Palmtree}
          title='No leave requests this month'
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
