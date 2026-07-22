'use client';

import { format } from 'date-fns';
import { Banknote } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { usePayrollCycleCost } from '@/hooks/queries/dashboard-widgets';
import { usePayrollRuns } from '@/hooks/queries/payroll';

import { EmptyState } from '@/components/hrm/empty-state';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import Logger from '@/utils/logger';
import { formatCurrency } from '@/utils/number-functions';

import { payrollCycleStatusLabels } from '@/constants/hrm-labels';
import { paths } from '@/constants/paths';

const cardLink =
  'block rounded-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:ring-2 hover:ring-ring';

/**
 * Admin-home payroll cost widget: the latest run's status badge and total cost
 * (whole PKR, summed from frozen payslip snapshots by the guarded
 * payroll_cycle_cost() RPC — never recomputed), linking into the M2 payroll
 * history. With no run the cost query is skipped and an empty state renders.
 */
export function PayrollCostWidget() {
  const {
    data: runs,
    isPending: runsPending,
    isError: runsError,
    error: runsErr,
  } = usePayrollRuns();

  // Runs arrive newest month first, so the latest cycle is the head. Its id
  // drives the cost RPC; its status/month drive the badge and label.
  const latest = runs?.[0];
  const {
    data: cost,
    isPending: costPending,
    isError: costError,
    error: costErr,
  } = usePayrollCycleCost(latest?.id);

  useEffect(() => {
    if (runsError) {
      Logger.error('Payroll runs fetch failed', runsErr);
      toast.error('Could not load payroll', {
        description: 'The payroll cost widget failed to load. Try refreshing.',
      });
    }
  }, [runsError, runsErr]);

  useEffect(() => {
    if (costError) {
      Logger.error('Payroll cycle cost fetch failed', costErr);
      toast.error('Could not load payroll cost', {
        description: 'The cycle total failed to load. Try refreshing.',
      });
    }
  }, [costError, costErr]);

  if (runsError) {
    return (
      <Card>
        <CardContent className='p-6 text-sm text-muted-foreground'>
          Couldn&apos;t load the payroll cost. Please refresh to try again.
        </CardContent>
      </Card>
    );
  }

  if (runsPending) {
    return <Skeleton className='h-[132px] rounded-xl' />;
  }

  if (!latest) {
    return (
      <Card>
        <CardContent className='p-6'>
          <EmptyState
            icon={Banknote}
            title='No payroll runs yet'
            description='Create a payroll run to see its total cost here.'
          />
        </CardContent>
      </Card>
    );
  }

  const cycle = payrollCycleStatusLabels[latest.status];
  const monthLabel = format(`${latest.month}-01`, 'MMMM yyyy');

  return (
    <Link href={paths.admin.payroll} className={cardLink}>
      <Card>
        <CardContent className='flex items-start justify-between gap-4 p-6'>
          <div className='flex flex-col gap-2'>
            <div className='flex items-center gap-2'>
              <p className='text-sm text-muted-foreground'>Payroll Cost</p>
              <Badge variant={cycle.variant} className='text-xs'>
                {cycle.label}
              </Badge>
            </div>
            {costPending ? (
              <Skeleton className='h-9 w-40' />
            ) : (
              // A calculated run always sums above zero; an uncalculated run
              // (no payslips yet) has no total to show.
              <p className='text-3xl font-bold tracking-tight'>
                {cost ? formatCurrency(cost) : '—'}
              </p>
            )}
            <p className='text-xs text-muted-foreground'>
              {monthLabel} cycle · view payroll history
            </p>
          </div>
          <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground'>
            <Banknote className='size-5' aria-hidden />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
