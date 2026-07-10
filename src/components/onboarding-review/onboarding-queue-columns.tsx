'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';

import { CenteredCell } from '@/components/ui/data-table/centered-cell';
import { DataTableColumnHeader } from '@/components/ui/data-table/column-header';

import { employmentTypeLabels } from '@/constants/hrm-labels';

import { OnboardingQueueRowActions } from './onboarding-queue-row-actions';

import { Employee } from '@/types/hrm';

export function useOnboardingQueueColumns() {
  return useMemo<ColumnDef<Employee>[]>(
    () => [
      {
        id: 'fullName',
        // Accessor spans name + email so the global search box (which only
        // indexes column values) matches on either.
        accessorFn: (row) => `${row.fullName} ${row.email}`,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Name' />
        ),
        cell: ({ row }) => (
          <div className='flex max-w-[220px] flex-col'>
            <span className='truncate font-medium'>
              {row.original.fullName || '—'}
            </span>
            <span className='truncate text-xs text-muted-foreground'>
              {row.original.email}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'designation',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Designation' />
        ),
        cell: (props) => (
          <CenteredCell
            {...props}
            formatter={(value) => (value as string) || '—'}
          />
        ),
      },
      {
        accessorKey: 'department',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Department' />
        ),
        cell: (props) => (
          <CenteredCell
            {...props}
            formatter={(value) => (value as string) || '—'}
          />
        ),
      },
      {
        accessorKey: 'employmentType',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Type' />
        ),
        cell: (props) => (
          <CenteredCell
            {...props}
            formatter={() =>
              employmentTypeLabels[props.row.original.employmentType]
            }
          />
        ),
      },
      {
        id: 'actions',
        header: () => null,
        cell: ({ row }) => (
          <OnboardingQueueRowActions employee={row.original} />
        ),
        enableSorting: false,
      },
    ],
    [],
  );
}
