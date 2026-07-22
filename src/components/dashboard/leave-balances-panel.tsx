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
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  type LeaveBalanceRow,
  useLeaveBalancesAll,
} from '@/hooks/queries/dashboard-widgets';

import { EmptyState } from '@/components/hrm/empty-state';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { CenteredCell } from '@/components/ui/data-table/centered-cell';
import { DataTableColumnHeader } from '@/components/ui/data-table/column-header';
import { TableSkeleton } from '@/components/ui/data-table/table-skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import Logger from '@/utils/logger';

/** The current year and the four before it — the window the year filter offers.
 *  The leave pool resets per calendar year, so older years stay meaningful. */
const YEAR_OPTIONS = Array.from(
  { length: 5 },
  (_, index) => new Date().getFullYear() - index,
);

function useLeaveBalanceColumns() {
  return useMemo<ColumnDef<LeaveBalanceRow>[]>(
    () => [
      {
        accessorKey: 'fullName',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Employee' />
        ),
        cell: ({ row }) => (
          <span className='font-medium'>{row.original.fullName || '—'}</span>
        ),
      },
      {
        accessorKey: 'remaining',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title='Remaining'
            align='center'
          />
        ),
        cell: (props) => <CenteredCell {...props} />,
      },
      {
        accessorKey: 'used',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Used' align='center' />
        ),
        cell: (props) => <CenteredCell {...props} />,
      },
      {
        accessorKey: 'pool',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Pool' align='center' />
        ),
        cell: (props) => <CenteredCell {...props} />,
      },
    ],
    [],
  );
}

/**
 * Admin-home leave panel: every active employee's remaining/used/pool for a
 * selected year, via the guarded leave_balances_all() rollup (one RPC wrapping
 * the canonical leave_balance(), so the figures match the per-employee widget —
 * half-days included). The year filter drives the query key, so changing it
 * re-fetches.
 */
export function LeaveBalancesPanel() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const { data, isPending, isError, error } = useLeaveBalancesAll(year);
  const columns = useLeaveBalanceColumns();
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    if (isError) {
      Logger.error('Leave balances rollup fetch failed', error);
      toast.error('Could not load leave balances', {
        description: 'The balances table failed to load. Try refreshing.',
      });
    }
  }, [isError, error]);

  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  return (
    <Card>
      <CardHeader className='flex-row items-start justify-between space-y-0'>
        <div className='flex flex-col gap-1.5'>
          <CardTitle className='text-xl font-semibold'>
            Leave Balances
          </CardTitle>
          <CardDescription>
            Every active employee&apos;s annual leave pool, in days
          </CardDescription>
        </div>
        <Select
          value={String(year)}
          onValueChange={(next) => setYear(Number(next))}
        >
          <SelectTrigger className='h-10 w-28 shrink-0'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {YEAR_OPTIONS.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isError ? (
          <p className='py-6 text-sm text-muted-foreground'>
            Couldn&apos;t load leave balances. Please refresh to try again.
          </p>
        ) : isPending ? (
          <TableSkeleton rows={4} columns={4} />
        ) : data.length === 0 ? (
          <EmptyState
            icon={Palmtree}
            title='No active employees'
            description='Balances will appear once employees are active.'
          />
        ) : (
          <div className='rounded-lg border border-border'>
            <DataTable table={table} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
