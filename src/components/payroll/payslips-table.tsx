'use client';

import {
  type ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Receipt } from 'lucide-react';
import { useMemo, useState } from 'react';

import { EmptyState } from '@/components/hrm/empty-state';
import { DataTable } from '@/components/ui/data-table';
import { CenteredCell } from '@/components/ui/data-table/centered-cell';
import { DataTableColumnHeader } from '@/components/ui/data-table/column-header';
import { TableSkeleton } from '@/components/ui/data-table/table-skeleton';

import { formatCurrency } from '@/utils/number-functions';

import { Payslip } from '@/types/hrm';

function usePayslipsColumns() {
  return useMemo<ColumnDef<Payslip>[]>(
    () => [
      {
        accessorKey: 'cycleMonth',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Cycle' />
        ),
        cell: ({ getValue }) => (
          <span className='font-medium'>{getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'totalBase',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Base' align='center' />
        ),
        cell: (props) => (
          <CenteredCell
            {...props}
            formatter={(value) => formatCurrency(value as number)}
          />
        ),
      },
      {
        accessorKey: 'medical',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title='Medical'
            align='center'
          />
        ),
        cell: (props) => (
          <CenteredCell
            {...props}
            formatter={(value) => formatCurrency(value as number) || '—'}
          />
        ),
      },
      {
        accessorKey: 'overtimePay',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title='Overtime'
            align='center'
          />
        ),
        cell: (props) => (
          <CenteredCell
            {...props}
            formatter={(value) => formatCurrency(value as number) || '—'}
          />
        ),
      },
      {
        accessorKey: 'total',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Total' align='center' />
        ),
        cell: (props) => (
          <CenteredCell
            {...props}
            formatter={(value) => (
              <span className='font-semibold'>
                {formatCurrency(value as number)}
              </span>
            )}
          />
        ),
      },
    ],
    [],
  );
}

type PayslipsTableProps = {
  payslips: Payslip[] | undefined;
  isLoading: boolean;
};

export function PayslipsTable({ payslips, isLoading }: PayslipsTableProps) {
  const columns = usePayslipsColumns();
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'cycleMonth', desc: true },
  ]);

  const table = useReactTable({
    data: payslips ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  if (isLoading) return <TableSkeleton rows={2} columns={5} />;

  if (!payslips?.length) {
    return (
      <EmptyState
        icon={Receipt}
        title='No payslips yet'
        description='Payslips appear here once a payroll cycle is locked.'
      />
    );
  }

  return (
    <div className='rounded-lg border border-border'>
      <DataTable table={table} />
    </div>
  );
}
