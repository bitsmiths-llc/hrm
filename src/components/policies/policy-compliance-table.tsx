'use client';

import {
  type ExpandedState,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { FileText } from 'lucide-react';
import { useMemo, useState } from 'react';

import { usePolicyCompliance } from '@/hooks/queries/policies';

import { EmptyState } from '@/components/hrm/empty-state';
import { DataTable } from '@/components/ui/data-table';
import { TableSkeleton } from '@/components/ui/data-table/table-skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import { usePolicyComplianceTableColumns } from './policy-compliance-table-columns';

import { PolicyCompliance, PolicyComplianceRow } from '@/types/hrm';

/** Flatten one policy's roster into a rollup row with its employees as
 *  sub-rows, optionally dropping everyone who is already compliant. */
const toRow = (
  policy: PolicyCompliance,
  outstandingOnly: boolean,
): PolicyComplianceRow => {
  const employees = outstandingOnly
    ? policy.employees.filter((employee) => !employee.acknowledged)
    : policy.employees;

  return {
    id: policy.policyId,
    policy,
    subRows: employees.map((employee) => ({
      id: `${policy.policyId}:${employee.employeeId}`,
      policy,
      employee,
    })),
  };
};

export function PolicyComplianceTable() {
  const { data: compliance, isLoading } = usePolicyCompliance();
  const columns = usePolicyComplianceTableColumns();

  const [outstandingOnly, setOutstandingOnly] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const [expanded, setExpanded] = useState<ExpandedState>({});

  // The "not acknowledged" filter is applied here rather than as a column
  // filter: TanStack filters parent and child rows by the same predicate, which
  // would drop whole policies instead of narrowing their rosters. Filtering the
  // sub-rows keeps every policy visible with its rollup intact — a policy at
  // 100% stays listed, showing an empty expansion.
  const data = useMemo(
    () => (compliance ?? []).map((policy) => toRow(policy, outstandingOnly)),
    [compliance, outstandingOnly],
  );

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    getSubRows: (row) => row.subRows,
    // Keep rows open across a refetch or a filter toggle — both change the data
    // reference, and the default would collapse everything each time.
    autoResetExpanded: false,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // Keep a policy whose *employee* matched the search, and vice versa — a
    // leaf-only match would otherwise orphan the row it belongs under.
    filterFromLeafRows: true,
    onExpandedChange: setExpanded,
    onGlobalFilterChange: setGlobalFilter,
    state: { expanded, globalFilter },
  });

  if (isLoading) return <TableSkeleton rows={4} columns={3} />;

  if (!compliance?.length) {
    return (
      <EmptyState
        icon={FileText}
        title='No active policies'
        description='Publish a policy to start tracking acknowledgments.'
      />
    );
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap items-center gap-4'>
        <Input
          placeholder='Search policies or employees…'
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className='h-8 w-64'
        />
        <div className='flex items-center gap-2'>
          <Switch
            id='outstanding-only'
            checked={outstandingOnly}
            onCheckedChange={setOutstandingOnly}
          />
          <Label htmlFor='outstanding-only' className='text-sm font-normal'>
            Not acknowledged only
          </Label>
        </div>
      </div>
      <div className='rounded-lg border border-border'>
        <DataTable table={table} />
      </div>
    </div>
  );
}
