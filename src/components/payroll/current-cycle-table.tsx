import { type RunPayslipRow } from '@/hooks/queries/payroll';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { formatCurrency } from '@/utils/number-functions';

import { DaysWorkedCell } from './days-worked-cell';

type PayslipGridProps = {
  rows: RunPayslipRow[];
  locked: boolean;
  /** True while a recalc/lock is in flight — freezes the days-worked inputs. */
  isBusy?: boolean;
  onDaysWorkedCommit: (payslipId: string, daysWorked: number) => void;
};

/** The draft (or, once locked, frozen) payslip grid for one run. Days worked is
 *  the only editable column and only while the run is open; everything else is
 *  computed by the engine and shown read-only. */
export function CurrentCycleTable({
  rows,
  locked,
  isBusy,
  onDaysWorkedCommit,
}: PayslipGridProps) {
  return (
    <div className='overflow-x-auto rounded-lg border border-border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead className='text-center'>Days Worked</TableHead>
            <TableHead className='text-center'>Total Base</TableHead>
            <TableHead className='text-center'>Medical</TableHead>
            <TableHead className='text-center'>OT Hours</TableHead>
            <TableHead className='text-center'>OT Rate</TableHead>
            <TableHead className='text-center'>OT Pay</TableHead>
            <TableHead className='text-center'>Total Pay</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className='font-medium'>
                {row.employeeName || '—'}
              </TableCell>
              <TableCell className='text-center'>
                {locked ? (
                  `${row.daysWorked} of ${row.daysInMonth}`
                ) : (
                  <DaysWorkedCell
                    payslipId={row.id}
                    daysWorked={row.daysWorked}
                    daysInMonth={row.daysInMonth}
                    disabled={isBusy}
                    onCommit={onDaysWorkedCommit}
                  />
                )}
              </TableCell>
              <TableCell className='text-center'>
                {formatCurrency(row.totalBase)}
              </TableCell>
              <TableCell className='text-center'>
                {formatCurrency(row.medical) || '—'}
              </TableCell>
              <TableCell className='text-center'>
                {row.overtimeHours || '—'}
              </TableCell>
              <TableCell className='text-center'>
                {row.overtimeRate ? formatCurrency(row.overtimeRate, 2) : '—'}
              </TableCell>
              <TableCell className='text-center'>
                {formatCurrency(row.overtimePay) || '—'}
              </TableCell>
              <TableCell className='text-center font-semibold'>
                {formatCurrency(row.totalPay)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
