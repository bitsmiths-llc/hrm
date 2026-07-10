'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';

import { StatusBadge } from '@/components/hrm/status-badge';
import { CenteredCell } from '@/components/ui/data-table/centered-cell';
import { DataTableColumnHeader } from '@/components/ui/data-table/column-header';

import { formatDate } from '@/utils/date-functions';

import { employmentTypeLabels } from '@/constants/hrm-labels';

import { EmployeesTableRowActions } from './employees-table-row-actions';

import { Employee } from '@/types/hrm';

export function useEmployeesTableColumns() {
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
              {row.original.fullName}
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
        filterFn: (row, id, value: string[]) =>
          value.includes(row.getValue(id)),
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
        filterFn: (row, id, value: string[]) =>
          value.includes(row.getValue(id)),
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
        filterFn: (row, id, value: string[]) =>
          value.includes(row.getValue(id)),
      },
      {
        accessorKey: 'invitedAt',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Invited' />
        ),
        cell: (props) => (
          <CenteredCell
            {...props}
            formatter={(value) => formatDate(value as string) || '—'}
            className='whitespace-nowrap'
          />
        ),
      },
      {
        id: 'actions',
        header: () => null,
        cell: ({ row }) => <EmployeesTableRowActions employee={row.original} />,
        enableSorting: false,
      },
    ],
    [],
  );
}
