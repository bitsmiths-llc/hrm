'use client';

import { type ColumnDef } from '@tanstack/react-table';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDashed,
} from 'lucide-react';
import { useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table/column-header';
import { Progress } from '@/components/ui/progress';

import { formatDate } from '@/utils/date-functions';

import { PolicyComplianceRow } from '@/types/hrm';

/** Whole percent acknowledged. A policy with no active employees at all reads
 *  as 100% rather than dividing by zero — there is nobody out of compliance. */
const compliancePercent = (acknowledged: number, total: number) =>
  total === 0 ? 100 : Math.round((acknowledged / total) * 100);

/** Two-level grid: each policy is a rollup row, its employees are sub-rows
 *  revealed by the expander in the first column. Cells branch on
 *  `row.original.employee` — present only on the employee level. */
export function usePolicyComplianceTableColumns() {
  return useMemo<ColumnDef<PolicyComplianceRow>[]>(
    () => [
      {
        id: 'name',
        // Spans policy title and employee name so the search box (which only
        // indexes column values) matches either level.
        accessorFn: (row) => row.employee?.fullName ?? row.policy.title,
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title='Policy'
            className='text-left'
          />
        ),
        cell: ({ row }) => {
          const { policy, employee } = row.original;

          if (employee) {
            return (
              <span className='block pl-9 text-sm'>{employee.fullName}</span>
            );
          }

          return (
            <div className='flex items-center gap-1'>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='size-7 shrink-0'
                onClick={row.getToggleExpandedHandler()}
                aria-expanded={row.getIsExpanded()}
                aria-label={`${row.getIsExpanded() ? 'Collapse' : 'Expand'} ${policy.title}`}
              >
                {row.getIsExpanded() ? (
                  <ChevronDown className='size-4' />
                ) : (
                  <ChevronRight className='size-4' />
                )}
              </Button>
              <div className='flex min-w-0 flex-col'>
                <span className='truncate font-medium'>{policy.title}</span>
                <span className='truncate text-xs text-muted-foreground'>
                  Version {policy.version}
                </span>
              </div>
            </div>
          );
        },
        enableSorting: false,
      },
      {
        id: 'acknowledged',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title='Acknowledged'
            align='center'
          />
        ),
        cell: ({ row }) => {
          const { policy, employee } = row.original;

          if (!employee) {
            return (
              <span className='block text-center text-sm tabular-nums'>
                {policy.acknowledgedCount} of {policy.totalCount}
              </span>
            );
          }

          return (
            <div className='flex justify-center'>
              {employee.acknowledged ? (
                <Badge variant='secondary' className='gap-1.5 font-normal'>
                  <CheckCircle2 className='size-3.5 text-primary' aria-hidden />
                  {formatDate(employee.acknowledgedAt) || 'Acknowledged'}
                </Badge>
              ) : (
                <Badge
                  variant='outline'
                  className='gap-1.5 font-normal text-amber-600 dark:text-amber-400'
                >
                  <CircleDashed className='size-3.5' aria-hidden />
                  Not acknowledged
                </Badge>
              )}
            </div>
          );
        },
        enableSorting: false,
      },
      {
        id: 'progress',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Progress' />
        ),
        // Employee rows leave this blank — the badge beside it already says
        // where that one person stands.
        cell: ({ row }) => {
          const { policy, employee } = row.original;
          if (employee) return null;

          const percent = compliancePercent(
            policy.acknowledgedCount,
            policy.totalCount,
          );

          return (
            <div className='flex items-center gap-2'>
              <Progress value={percent} className='h-2 w-24' />
              <span className='w-9 shrink-0 text-xs tabular-nums text-muted-foreground'>
                {percent}%
              </span>
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    [],
  );
}
