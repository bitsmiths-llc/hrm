'use client';

import {
  type ColumnFiltersState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Users } from 'lucide-react';
import { useState } from 'react';

import { useEmployees } from '@/hooks/queries/employees';

import { EmptyState } from '@/components/hrm/empty-state';
import { DataTable } from '@/components/ui/data-table';
import { DataTableFacetedFilter } from '@/components/ui/data-table/faceted-filter';
import { DataTablePagination } from '@/components/ui/data-table/pagination';
import { TableSkeleton } from '@/components/ui/data-table/table-skeleton';
import { Input } from '@/components/ui/input';

import { accountStatusLabels } from '@/constants/hrm-labels';

import { useEmployeesTableColumns } from './employees-table-columns';

const statusOptions = Object.entries(accountStatusLabels).map(
  ([value, { label }]) => ({ value, label }),
);

export function EmployeesTable() {
  const { data: employees, isLoading } = useEmployees();
  const columns = useEmployeesTableColumns();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data: employees ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: { sorting, columnFilters, globalFilter },
  });

  if (isLoading) return <TableSkeleton rows={4} columns={5} />;

  if (!employees?.length) {
    return (
      <EmptyState
        icon={Users}
        title='No employees yet'
        description='Invite your first employee to start onboarding.'
      />
    );
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap items-center gap-2'>
        <Input
          placeholder='Search by name or email…'
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className='h-8 w-64'
        />
        <DataTableFacetedFilter
          column={table.getColumn('status')}
          title='Status'
          options={statusOptions}
        />
      </div>
      <div className='rounded-lg border border-border'>
        <DataTable table={table} />
      </div>
      <DataTablePagination
        pageIndex={table.getState().pagination.pageIndex}
        pageSize={table.getState().pagination.pageSize}
        totalCount={table.getFilteredRowModel().rows.length}
        onPageChange={table.setPageIndex}
        onSizeChange={table.setPageSize}
        showSelected={false}
      />
    </div>
  );
}
