'use client';

import {
  type ColumnDef,
  type ColumnFiltersState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  type Table as TTable,
  useReactTable,
} from '@tanstack/react-table';
import { type LucideIcon } from 'lucide-react';
import { type ReactNode, useState } from 'react';

import { EmptyState } from '@/components/hrm/empty-state';
import { DataTable } from '@/components/ui/data-table';
import { DataTablePagination } from '@/components/ui/data-table/pagination';
import { TableSkeleton } from '@/components/ui/data-table/table-skeleton';
import { Input } from '@/components/ui/input';

type PendingQueueTableProps<TData> = {
  data: TData[] | undefined;
  columns: ColumnDef<TData>[];
  isLoading?: boolean;
  emptyState: { icon?: LucideIcon; title: string; description?: string };
  /** Enables a global search box with this placeholder; omit to hide it. */
  searchPlaceholder?: string;
  /** Extra toolbar controls (e.g. faceted filters), given the table instance. */
  toolbar?: (table: TTable<TData>) => ReactNode;
};

/**
 * Generic review-queue shell (BIT-10): a `DataTable` parametrised by columns +
 * row actions, wrapping the boilerplate every pending queue shares — sorting,
 * filtering, pagination, and loading/empty states. Later modules (the unified
 * approvals queue) reuse this shell by passing their own columns.
 */
export function PendingQueueTable<TData>({
  data,
  columns,
  isLoading,
  emptyState,
  searchPlaceholder,
  toolbar,
}: PendingQueueTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data: data ?? [],
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

  if (isLoading) return <TableSkeleton rows={4} columns={columns.length} />;

  if (!data?.length) {
    return (
      <EmptyState
        icon={emptyState.icon}
        title={emptyState.title}
        description={emptyState.description}
      />
    );
  }

  return (
    <div className='flex flex-col gap-4'>
      {(!!searchPlaceholder || !!toolbar) && (
        <div className='flex flex-wrap items-center gap-2'>
          {!!searchPlaceholder && (
            <Input
              placeholder={searchPlaceholder}
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className='h-8 w-64'
            />
          )}
          {toolbar?.(table)}
        </div>
      )}
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
