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

import { EmptyState } from '@/components/hrm/empty-state';
import { StatusCell } from '@/components/hrm/status-cell';
import { DataTable } from '@/components/ui/data-table';
import { CenteredCell } from '@/components/ui/data-table/centered-cell';
import { DataTableColumnHeader } from '@/components/ui/data-table/column-header';
import { TableSkeleton } from '@/components/ui/data-table/table-skeleton';

import { formatDate } from '@/utils/date-functions';

import { leaveTypeLabels } from '@/constants/hrm-labels';

import { LeaveRequest } from '@/types/hrm';

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
          <DataTableColumnHeader column={column} title='From' align='center' />
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
          <DataTableColumnHeader column={column} title='Days' align='center' />
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

type LeaveRequestsTableProps = {
  requests: LeaveRequest[] | undefined;
  isLoading: boolean;
  emptyDescription?: string;
  /** Optional heading, e.g. "Recent Requests". */
  title?: string;
  /** 'all' | 'YYYY' | 'YYYY-MM' — the period selected by the page-level
   *  month filter. */
  month: string;
};

/** Presentational leave table — used by both the employee's own /leave
 *  page and the admin's per-employee view. */
export function LeaveRequestsTable({
  requests,
  isLoading,
  emptyDescription = 'Requests and their status will show up here.',
  title,
  month,
}: LeaveRequestsTableProps) {
  const columns = useLeaveHistoryColumns();
  // Default to newest-submitted first (createdAt), not a data column, so a
  // request keeps its place regardless of status — approved/rejected rows stay
  // latest-first. Empty initial sorting preserves this order until the user
  // clicks a column header.
  const [sorting, setSorting] = useState<SortingState>([]);
  const filtered = useMemo(() => {
    const scoped =
      month === 'all'
        ? (requests ?? [])
        : (requests ?? []).filter((request) =>
            request.startDate.startsWith(month),
          );
    return [...scoped].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [requests, month]);

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
      {!!title && <h2 className='text-xl font-semibold'>{title}</h2>}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Palmtree}
          title='No leave requests in this period'
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
