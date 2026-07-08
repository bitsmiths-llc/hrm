'use client';

import { format } from 'date-fns';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

import { usePayrollCycles } from '@/hooks/queries/payroll';

import { PageHeader } from '@/components/hrm/page-header';
import { StatusBadge } from '@/components/hrm/status-badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { formatCurrency } from '@/utils/number-functions';

import { paths } from '@/constants/paths';

export function AdminPayrollPageContent() {
  const { data: cycles, isLoading } = usePayrollCycles();

  const openCycle = (cycles ?? []).find((c) => c.status !== 'locked');
  const lockedCycles = (cycles ?? []).filter((c) => c.status === 'locked');

  return (
    <>
      <PageHeader
        title='Payroll'
        description='Review a cycle, lock it, then export for Payoneer.'
      >
        {!!openCycle && (
          <Link href={`${paths.admin.payroll}/${openCycle.month}`}>
            <Button iconLeft={PlusCircle}>
              Create {format(`${openCycle.month}-01`, 'MMMM yyyy')} Payroll
            </Button>
          </Link>
        )}
      </PageHeader>

      <div className='flex flex-col gap-3'>
        <h2 className='text-xl font-semibold'>History</h2>
        {isLoading ? (
          <Skeleton className='h-24 rounded-xl' />
        ) : lockedCycles.length === 0 ? (
          <p className='text-sm text-muted-foreground'>No locked cycles yet.</p>
        ) : (
          <ul className='flex flex-col divide-y divide-border rounded-lg border border-border'>
            {lockedCycles.map((c) => (
              <li key={c.id}>
                <Link
                  href={`${paths.admin.payroll}/${c.month}`}
                  className='flex w-full items-center justify-between gap-3 px-4 py-3 hover:bg-accent hover:text-accent-foreground'
                >
                  <span className='font-medium'>
                    {format(`${c.month}-01`, 'MMMM yyyy')}
                  </span>
                  <span className='flex items-center gap-3 text-sm text-muted-foreground'>
                    {c.employeeCount} employees ·{' '}
                    {formatCurrency(c.totalPayroll)}
                    <StatusBadge status={c.status} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
