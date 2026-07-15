'use client';

import { format } from 'date-fns';
import { ArrowLeft, Calculator, CalendarX2 } from 'lucide-react';
import Link from 'next/link';

import { useCalculatePayroll } from '@/hooks/actions/use-calculate-payroll';
import { useCreateRun } from '@/hooks/actions/use-create-run';
import { useLockPayroll } from '@/hooks/actions/use-lock-payroll';
import { useOverrideDaysWorked } from '@/hooks/actions/use-override-days-worked';
import { useRunByMonth, useRunPayslips } from '@/hooks/queries/payroll';

import { ConfirmDialog } from '@/components/hrm/confirm-dialog';
import { EmptyState } from '@/components/hrm/empty-state';
import { PageHeader } from '@/components/hrm/page-header';
import { StatusBadge } from '@/components/hrm/status-badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { formatCurrency } from '@/utils/number-functions';

import { paths } from '@/constants/paths';

import { CurrentCycleTable } from './current-cycle-table';
import { ExportPayoneerSheet } from './export-payoneer-sheet';

type PayrollCyclePageContentProps = {
  month: string; // 'YYYY-MM'
};

export function PayrollCyclePageContent({
  month,
}: PayrollCyclePageContentProps) {
  const { data: run, isLoading: runLoading } = useRunByMonth(month);
  const { data: rows, isLoading: rowsLoading } = useRunPayslips(run?.id);

  const calc = useCalculatePayroll();
  const lock = useLockPayroll();
  const override = useOverrideDaysWorked();
  const create = useCreateRun();

  const monthLabel = format(`${month}-01`, 'MMMM yyyy');
  const locked = run?.status === 'locked';
  const busy = calc.isPending || override.isPending || lock.isPending;
  const gridRows = rows ?? [];
  const draftTotal = gridRows.reduce((sum, row) => sum + row.totalPay, 0);
  const totalPayroll = locked ? (run?.totalPayroll ?? 0) : draftTotal;

  const exportRows = gridRows.map((row) => ({
    employeeId: row.employeeId,
    employeeName: row.employeeName,
    total: row.totalPay,
    cycleMonth: month,
  }));

  return (
    <>
      <div>
        <Link href={paths.admin.payroll}>
          <Button variant='ghost' size='sm' iconLeft={ArrowLeft}>
            Back to Payroll
          </Button>
        </Link>
      </div>

      {runLoading ? (
        <Skeleton className='h-48 rounded-xl' />
      ) : !run ? (
        <EmptyState
          icon={CalendarX2}
          title={`No payroll run for ${monthLabel}`}
          description='Create the run to generate its draft payslips.'
        >
          <Button
            isLoading={create.isPending}
            onClick={() => create.execute({ period_month: `${month}-01` })}
          >
            Create {monthLabel} run
          </Button>
        </EmptyState>
      ) : (
        <>
          <PageHeader
            title={monthLabel}
            description='Review this run, lock it, then export for Payoneer.'
          >
            <StatusBadge status={run.status} />
          </PageHeader>

          <div className='flex flex-wrap items-center justify-end gap-2'>
            <Button
              variant='outline'
              isLoading={calc.isPending}
              disabled={locked || busy}
              onClick={() => calc.execute({ run_id: run.id })}
            >
              Recalculate
            </Button>
            <ConfirmDialog
              trigger={
                <Button disabled={locked || busy || gridRows.length === 0}>
                  Lock run
                </Button>
              }
              title='Lock this payroll run?'
              description='Figures become read-only once locked, approved medical and overtime for the month are swept into this run, and employees can see their payslips. You can still export for Payoneer afterward.'
              confirmLabel='Lock run'
              destructive
              isLoading={lock.isPending}
              onConfirm={() => lock.execute({ run_id: run.id })}
            />
            <ExportPayoneerSheet rows={exportRows} disabled={!locked} />
          </div>

          {rowsLoading ? (
            <Skeleton className='h-48 rounded-xl' />
          ) : gridRows.length === 0 ? (
            <EmptyState
              icon={Calculator}
              title='No payslips yet'
              description='Calculate payroll to generate the draft for every active employee.'
            >
              <Button
                isLoading={calc.isPending}
                onClick={() => calc.execute({ run_id: run.id })}
              >
                Calculate payroll
              </Button>
            </EmptyState>
          ) : (
            <>
              <CurrentCycleTable
                rows={gridRows}
                locked={locked}
                isBusy={busy}
                onDaysWorkedCommit={(payslipId, daysWorked) =>
                  override.execute({ payslip_id: payslipId, days_worked: daysWorked })
                }
              />
              <p className='text-sm text-muted-foreground'>
                {locked ? 'Total payroll' : 'Draft total'}:{' '}
                {formatCurrency(totalPayroll)} · {gridRows.length} employees
              </p>
            </>
          )}
        </>
      )}
    </>
  );
}
