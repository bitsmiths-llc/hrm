'use client';

import {
  type ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { HeartPulse } from 'lucide-react';
import { useMemo, useState } from 'react';

import { EmptyState } from '@/components/hrm/empty-state';
import { StatusBadge } from '@/components/hrm/status-badge';
import { DataTable } from '@/components/ui/data-table';
import { CenteredCell } from '@/components/ui/data-table/centered-cell';
import { DataTableColumnHeader } from '@/components/ui/data-table/column-header';
import { TableSkeleton } from '@/components/ui/data-table/table-skeleton';

import { formatDate } from '@/utils/date-functions';
import { formatCurrency } from '@/utils/number-functions';

import {
  medicalClaimForLabels,
  medicalServiceTypeLabels,
} from '@/constants/hrm-labels';

import { MedicalClaim } from '@/types/hrm';

function useMedicalClaimsColumns() {
  return useMemo<ColumnDef<MedicalClaim>[]>(
    () => [
      {
        accessorKey: 'serviceType',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Service' />
        ),
        cell: ({ row }) => (
          <span className='font-medium'>
            {medicalServiceTypeLabels[row.original.serviceType]}
          </span>
        ),
      },
      {
        accessorKey: 'claimFor',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='For' />
        ),
        cell: (props) => (
          <CenteredCell
            {...props}
            formatter={(value) =>
              medicalClaimForLabels[value as MedicalClaim['claimFor']]
            }
          />
        ),
      },
      {
        accessorKey: 'amount',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Amount' />
        ),
        cell: (props) => (
          <CenteredCell
            {...props}
            formatter={(value) => formatCurrency(value as number)}
          />
        ),
      },
      {
        accessorKey: 'expenseDate',
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

type MedicalClaimsTableProps = {
  claims: MedicalClaim[] | undefined;
  isLoading: boolean;
  emptyDescription?: string;
};

export function MedicalClaimsTable({
  claims,
  isLoading,
  emptyDescription = 'Claims and their status will show up here.',
}: MedicalClaimsTableProps) {
  const columns = useMedicalClaimsColumns();
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'expenseDate', desc: true },
  ]);

  const table = useReactTable({
    data: claims ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  if (isLoading) return <TableSkeleton rows={3} columns={5} />;

  if (!claims?.length) {
    return (
      <EmptyState
        icon={HeartPulse}
        title='No medical claims yet'
        description={emptyDescription}
      />
    );
  }

  return (
    <div className='rounded-lg border border-border'>
      <DataTable table={table} />
    </div>
  );
}
