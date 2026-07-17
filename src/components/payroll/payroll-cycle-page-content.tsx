'use client';

import { format } from 'date-fns';
import { ArrowLeft, Calculator, CalendarX2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import { useAddPayslipCustomField } from '@/hooks/actions/use-add-payslip-custom-field';
import { useCalculatePayroll } from '@/hooks/actions/use-calculate-payroll';
import { useCreateRun } from '@/hooks/actions/use-create-run';
import { useLockPayroll } from '@/hooks/actions/use-lock-payroll';
import { useOverrideDaysWorked } from '@/hooks/actions/use-override-days-worked';
import { useOverrideOtMultiplier } from '@/hooks/actions/use-override-ot-multiplier';
import { useRemovePayslipCustomField } from '@/hooks/actions/use-remove-payslip-custom-field';
import { useRunByMonth, useRunPayslips } from '@/hooks/queries/payroll';

import { ConfirmDialog } from '@/components/hrm/confirm-dialog';
import { EmptyState } from '@/components/hrm/empty-state';
import { PageHeader } from '@/components/hrm/page-header';
import { StatusBadge } from '@/components/hrm/status-badge';
import { BulkAdjustmentPopover } from '@/components/payroll/bulk-adjustment-popover';
import { BulkOtRatePopover } from '@/components/payroll/bulk-ot-rate-popover';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { formatCurrency } from '@/utils/number-functions';

import { paths } from '@/constants/paths';

import { CurrentCycleTable } from './current-cycle-table';
import { ExportArtifacts } from './export-artifacts';
import { ExportPayoneerSheet } from './export-payoneer-sheet';

type PayrollCyclePageContentProps = {
  month: string; // 'YYYY-MM'
};

export function PayrollCyclePageContent({
  month,
}: PayrollCyclePageContentProps) {
  const { data: run, isLoading: runLoading } = useRunByMonth(month);
  const { data: rows, isLoading: rowsLoading } = useRunPayslips(run?.id);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const calc = useCalculatePayroll();
  // Locking mails every employee their invoice. That fan-out is best-effort
  // server-side (a bounce never undoes the lock), so the toast has to report
  // what actually went out rather than just claiming success.
  const lock = useLockPayroll(({ sent, failed }) => {
    if (failed > 0) {
      toast.warning(
        `Run locked · ${sent} invoice(s) emailed, ${failed} failed. Retry those from the row's send button.`,
      );
      return;
    }
    toast.success(
      sent > 0
        ? `Run locked · ${sent} invoice${sent === 1 ? '' : 's'} emailed`
        : 'Run locked',
    );
  });
  const create = useCreateRun();
  const overrideDays = useOverrideDaysWorked();
  const overrideMult = useOverrideOtMultiplier();
  // The add is silent otherwise: the popover stays open and the row's total only
  // moves once the recalc lands, so nothing confirms the line item stuck. Shared
  // by the per-row cells and the bulk popover, hence the surface-neutral wording.
  const addField = useAddPayslipCustomField(() =>
    toast.success('Adjustment added'),
  );
  const removeField = useRemovePayslipCustomField();

  const monthLabel = format(`${month}-01`, 'MMMM yyyy');
  const locked = run?.status === 'locked';
  const busy =
    calc.isPending ||
    lock.isPending ||
    overrideDays.isPending ||
    overrideMult.isPending ||
    addField.isPending ||
    removeField.isPending;
  const gridRows = rows ?? [];
  const draftTotal = gridRows.reduce((sum, row) => sum + row.totalPay, 0);
  const totalPayroll = locked ? (run?.totalPayroll ?? 0) : draftTotal;

  const exportRows = gridRows.map((row) => ({
    employeeId: row.employeeId,
    employeeName: row.employeeName,
    total: row.totalPay,
  }));

  const toggleRow = (payslipId: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(payslipId)) next.delete(payslipId);
      else next.add(payslipId);
      return next;
    });

  const toggleAll = () =>
    setSelectedIds((prev) =>
      prev.size === gridRows.length
        ? new Set()
        : new Set(gridRows.map((row) => row.id)),
    );

  const handleBulkOtRate = (multiplier: number) => {
    if (!run || selectedIds.size === 0) return;
    overrideMult.execute({
      run_id: run.id,
      payslip_ids: [...selectedIds],
      overtime_multiplier: multiplier,
    });
  };

  const handleBulkAdjustment = (field: { label: string; amount: number }) => {
    if (!run || selectedIds.size === 0) return;
    addField.execute({
      run_id: run.id,
      payslip_ids: [...selectedIds],
      label: field.label,
      amount: field.amount,
    });
  };

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

          <div className='flex flex-wrap items-center justify-between gap-2'>
            <div className='flex flex-wrap items-center gap-2'>
              {selectedIds.size > 0 && !locked && (
                <>
                  <span className='text-sm text-muted-foreground'>
                    {selectedIds.size} selected
                  </span>
                  <BulkOtRatePopover
                    selectedCount={selectedIds.size}
                    onApply={handleBulkOtRate}
                  />
                  <BulkAdjustmentPopover
                    selectedCount={selectedIds.size}
                    onApply={handleBulkAdjustment}
                  />
                </>
              )}
            </div>
            <div className='flex flex-wrap items-center gap-2'>
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
                description='Figures become read-only once locked, approved medical and overtime for the month are swept into this run, and employees can see their payslips. Every employee is emailed their payslip PDF straight away. You can still export for Payoneer afterward.'
                confirmLabel='Lock run'
                destructive
                isLoading={lock.isPending}
                onConfirm={() => lock.execute({ run_id: run.id })}
              />
              <ExportPayoneerSheet
                runId={run.id}
                rows={exportRows}
                disabled={!locked}
              />
            </div>
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
                selectedIds={selectedIds}
                onToggleRow={toggleRow}
                onToggleAll={toggleAll}
                onDaysWorkedCommit={(payslipId, daysWorked) =>
                  overrideDays.execute({
                    payslip_id: payslipId,
                    days_worked: daysWorked,
                  })
                }
                onOtMultiplierCommit={(payslipId, multiplier) =>
                  overrideMult.execute({
                    run_id: run.id,
                    payslip_ids: [payslipId],
                    overtime_multiplier: multiplier,
                  })
                }
                onAddCustomField={(payslipId, field) =>
                  addField.execute({
                    run_id: run.id,
                    payslip_ids: [payslipId],
                    label: field.label,
                    amount: field.amount,
                  })
                }
                onRemoveCustomField={(payslipId, index) =>
                  removeField.execute({ payslip_id: payslipId, index })
                }
              />
              <p className='text-sm text-muted-foreground'>
                {locked ? 'Total payroll' : 'Draft total'}:{' '}
                {formatCurrency(totalPayroll)} · {gridRows.length} employees
              </p>
              {locked && <ExportArtifacts runId={run.id} />}
            </>
          )}
        </>
      )}
    </>
  );
}
