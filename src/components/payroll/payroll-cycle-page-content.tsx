'use client';

import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ArrowLeft, CalendarX2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import { useEmployees } from '@/hooks/queries/employees';
import {
  useAllPayslips,
  useCurrentCycleRows,
  usePayrollCycles,
} from '@/hooks/queries/payroll';
import { useHrmSettings } from '@/hooks/queries/settings';

import { ConfirmDialog } from '@/components/hrm/confirm-dialog';
import { EmptyState } from '@/components/hrm/empty-state';
import { PageHeader } from '@/components/hrm/page-header';
import { StatusBadge } from '@/components/hrm/status-badge';
import { BulkAdjustmentPopover } from '@/components/payroll/bulk-adjustment-popover';
import { BulkOtRatePopover } from '@/components/payroll/bulk-ot-rate-popover';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { formatCurrency } from '@/utils/number-functions';
import {
  calcOvertimePay,
  calcPayslipTotal,
  calcTotalBase,
} from '@/utils/payroll-functions';

import { mockPayslips } from '@/constants/mock/payroll';
import { paths } from '@/constants/paths';
import { QueryKeys } from '@/constants/query-keys';

import { CurrentCycleTable } from './current-cycle-table';
import { ExportPayoneerSheet } from './export-payoneer-sheet';

import { PayrollCycle, Payslip } from '@/types/hrm';

type PayrollCyclePageContentProps = {
  month: string;
};

export function PayrollCyclePageContent({
  month,
}: PayrollCyclePageContentProps) {
  const queryClient = useQueryClient();
  const { rows: liveRows, isLoading: liveLoading } = useCurrentCycleRows();
  const { data: cycles, isLoading: cyclesLoading } = usePayrollCycles();
  const { data: allPayslips, isLoading: payslipsLoading } = useAllPayslips();
  const { data: employees } = useEmployees();
  const { data: settings } = useHrmSettings();
  const [multiplierOverrides, setMultiplierOverrides] = useState<
    Record<string, number>
  >({});
  const [customFieldOverrides, setCustomFieldOverrides] = useState<
    Record<string, { label: string; amount: number }[]>
  >({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const cycle = (cycles ?? []).find((c) => c.month === month);
  const locked = cycle?.status === 'locked';
  const isLoading = cyclesLoading || (locked ? payslipsLoading : liveLoading);

  // The edited live rows are also what get frozen into `mockPayslips` at lock
  // time, so they must be computed unconditionally (not only pre-lock).
  const editedLiveRows: Payslip[] = liveRows.map((row) => {
    const totalBase = calcTotalBase(
      row.baseSalary,
      row.daysWorked,
      row.daysInMonth,
    );

    const overtimeMultiplier =
      multiplierOverrides[row.employeeId] ?? row.overtimeMultiplier;
    const employee = employees?.find((e) => e.id === row.employeeId);
    const overtimePay = employee
      ? calcOvertimePay(
          row.baseSalary,
          employee.workingHours,
          row.overtimeHours,
          overtimeMultiplier,
        )
      : row.overtimePay;

    const customFields = customFieldOverrides[row.employeeId] ?? [];
    const customFieldsTotal = customFields.reduce(
      (sum, field) => sum + field.amount,
      0,
    );

    // Same gross-earnings tax base as useCurrentCycleRows, extended with
    // positive adjustments.
    const positiveAdjustments = customFields
      .filter((field) => field.amount > 0)
      .reduce((sum, field) => sum + field.amount, 0);
    const taxDeduction = Math.round(
      ((row.baseSalary + row.medical + overtimePay + positiveAdjustments) *
        (settings?.taxRatePercent ?? 0)) /
        100,
    );

    return {
      ...row,
      totalBase,
      overtimeMultiplier,
      overtimePay,
      taxDeduction,
      customFields,
      total:
        calcPayslipTotal(totalBase, row.medical, overtimePay) +
        customFieldsTotal -
        taxDeduction,
    };
  });

  const rows: Payslip[] = locked
    ? (allPayslips ?? []).filter((payslip) => payslip.cycleMonth === month)
    : editedLiveRows;

  const totalPayroll = rows.reduce((sum, row) => sum + row.total, 0);

  const toggleRow = (employeeId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(employeeId)) next.delete(employeeId);
      else next.add(employeeId);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds((prev) =>
      prev.size === rows.length
        ? new Set()
        : new Set(rows.map((r) => r.employeeId)),
    );
  };

  const handleBulkSendInvoice = async () => {
    const names = rows
      .filter((row) => selectedIds.has(row.employeeId))
      .map((row) => row.employeeName);
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast.success(
      `Invoice sent to ${names.length} ${names.length === 1 ? 'employee' : 'employees'}`,
    );
    setSelectedIds(new Set());
  };

  const handleBulkOtRate = (multiplier: number) => {
    setMultiplierOverrides((prev) => {
      const next = { ...prev };
      selectedIds.forEach((employeeId) => {
        next[employeeId] = multiplier;
      });
      return next;
    });
    toast.success(
      `Overtime multiplier set to ${multiplier}x for ${selectedIds.size} ${selectedIds.size === 1 ? 'employee' : 'employees'}`,
    );
  };

  const handleBulkAddCustomField = (field: {
    label: string;
    amount: number;
  }) => {
    setCustomFieldOverrides((prev) => {
      const next = { ...prev };
      selectedIds.forEach((employeeId) => {
        next[employeeId] = [...(next[employeeId] ?? []), field];
      });
      return next;
    });
    toast.success(
      `Added "${field.label}" to ${selectedIds.size} ${selectedIds.size === 1 ? 'employee' : 'employees'}`,
    );
  };

  const handleRemoveCustomField = (employeeId: string, index: number) => {
    setCustomFieldOverrides((prev) => ({
      ...prev,
      [employeeId]: (prev[employeeId] ?? []).filter((_, i) => i !== index),
    }));
  };

  const handleLock = () => {
    if (!cycle) return;
    queryClient.setQueryData<PayrollCycle[]>(
      [QueryKeys.PAYROLL_CYCLES],
      (old) =>
        old?.map((c) =>
          c.id === cycle.id
            ? {
                ...c,
                status: 'locked',
                lockedAt: format(new Date(), 'yyyy-MM-dd'),
                totalPayroll,
                employeeCount: editedLiveRows.length,
              }
            : c,
        ),
    );
    queryClient.setQueryData<Payslip[]>([QueryKeys.PAYSLIPS], (old) => {
      const base = old ?? mockPayslips;
      return [
        ...base.filter((payslip) => payslip.cycleMonth !== month),
        ...editedLiveRows,
      ];
    });
    toast.success(`${format(`${month}-01`, 'MMMM yyyy')} cycle locked`);
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

      {isLoading ? (
        <Skeleton className='h-48 rounded-xl' />
      ) : !cycle ? (
        <EmptyState
          icon={CalendarX2}
          title='Cycle not found'
          description='This payroll cycle may not exist yet.'
        />
      ) : (
        <>
          <PageHeader
            title={format(`${month}-01`, 'MMMM yyyy')}
            description='Review this cycle, lock it, then export for Payoneer.'
          >
            <StatusBadge status={cycle.status} />
          </PageHeader>

          <div className='flex flex-wrap items-center justify-between gap-2'>
            <div className='flex flex-wrap items-center gap-2'>
              {selectedIds.size > 0 && (
                <>
                  <span className='text-sm text-muted-foreground'>
                    {selectedIds.size} selected
                  </span>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={handleBulkSendInvoice}
                  >
                    Send Invoice
                  </Button>
                  {!locked && (
                    <>
                      <BulkOtRatePopover
                        selectedCount={selectedIds.size}
                        onApply={handleBulkOtRate}
                      />
                      <BulkAdjustmentPopover
                        selectedCount={selectedIds.size}
                        onApply={handleBulkAddCustomField}
                      />
                    </>
                  )}
                </>
              )}
            </div>
            <div className='flex flex-wrap items-center gap-2'>
              <ConfirmDialog
                trigger={
                  <Button variant='outline' disabled={locked}>
                    Lock cycle
                  </Button>
                }
                title='Lock this payroll cycle?'
                description='Figures become read-only once locked. You can still export for Payoneer afterward.'
                confirmLabel='Lock cycle'
                onConfirm={handleLock}
              />
              <ExportPayoneerSheet rows={rows} disabled={!locked} />
            </div>
          </div>

          <CurrentCycleTable
            rows={rows}
            locked={locked}
            selectedIds={selectedIds}
            onToggleRow={toggleRow}
            onToggleAll={toggleAll}
            onOvertimeMultiplierChange={
              locked
                ? undefined
                : (employeeId, overtimeMultiplier) =>
                    setMultiplierOverrides((prev) => ({
                      ...prev,
                      [employeeId]: overtimeMultiplier,
                    }))
            }
            onAddCustomField={(employeeId, field) =>
              setCustomFieldOverrides((prev) => ({
                ...prev,
                [employeeId]: [...(prev[employeeId] ?? []), field],
              }))
            }
            onRemoveCustomField={handleRemoveCustomField}
          />
          <p className='text-sm text-muted-foreground'>
            Total payroll this cycle: {formatCurrency(totalPayroll)} ·{' '}
            {rows.length} employees
          </p>
        </>
      )}
    </>
  );
}
