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

import { ConfirmDialog } from '@/components/hrm/confirm-dialog';
import { EmptyState } from '@/components/hrm/empty-state';
import { PageHeader } from '@/components/hrm/page-header';
import { StatusBadge } from '@/components/hrm/status-badge';
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
import { ExportPayoneerDialog } from './export-payoneer-dialog';

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
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const [multiplierOverrides, setMultiplierOverrides] = useState<
    Record<string, number>
  >({});

  const cycle = (cycles ?? []).find((c) => c.month === month);
  const locked = cycle?.status === 'locked';
  const isLoading = cyclesLoading || (locked ? payslipsLoading : liveLoading);

  // The edited live rows are also what get frozen into `mockPayslips` at lock
  // time, so they must be computed unconditionally (not only pre-lock).
  const editedLiveRows: Payslip[] = liveRows.map((row) => {
    const daysWorked = overrides[row.employeeId] ?? row.daysWorked;
    const totalBase = calcTotalBase(
      row.baseSalary,
      daysWorked,
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

    return {
      ...row,
      daysWorked,
      totalBase,
      overtimeMultiplier,
      overtimePay,
      total: calcPayslipTotal(totalBase, row.medical, overtimePay),
    };
  });

  const rows: Payslip[] = locked
    ? (allPayslips ?? []).filter((payslip) => payslip.cycleMonth === month)
    : editedLiveRows;

  const totalPayroll = rows.reduce((sum, row) => sum + row.total, 0);

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

          <div className='flex flex-wrap items-center justify-end gap-2'>
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
            <ExportPayoneerDialog rows={rows} disabled={!locked} />
          </div>

          <CurrentCycleTable
            rows={rows}
            locked={locked}
            onDaysWorkedChange={
              locked
                ? undefined
                : (employeeId, daysWorked) =>
                    setOverrides((prev) => ({
                      ...prev,
                      [employeeId]: daysWorked,
                    }))
            }
            onOvertimeMultiplierChange={
              locked
                ? undefined
                : (employeeId, overtimeMultiplier) =>
                    setMultiplierOverrides((prev) => ({
                      ...prev,
                      [employeeId]: overtimeMultiplier,
                    }))
            }
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
