import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { formatCurrency } from '@/utils/number-functions';

import { DownloadPayslipButton } from './download-payslip-button';

import { Payslip } from '@/types/hrm';

type CurrentCycleTableProps = {
  rows: Payslip[];
  locked: boolean;
  /** Only used (and only rendered as an input) when the cycle isn't locked. */
  onDaysWorkedChange?: (employeeId: string, daysWorked: number) => void;
  /** Per-employee override of the global overtime multiplier. Only used
   *  (and only rendered as an input) when the cycle isn't locked. */
  onOvertimeMultiplierChange?: (
    employeeId: string,
    overtimeMultiplier: number,
  ) => void;
};

export function CurrentCycleTable({
  rows,
  locked,
  onDaysWorkedChange,
  onOvertimeMultiplierChange,
}: CurrentCycleTableProps) {
  return (
    <div className='rounded-lg border border-border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead className='text-center'>Days Worked</TableHead>
            <TableHead className='text-center'>Total Base</TableHead>
            <TableHead className='text-center'>Medical</TableHead>
            <TableHead className='text-center'>OT Rate</TableHead>
            <TableHead className='text-center'>Overtime</TableHead>
            <TableHead className='text-center'>Total</TableHead>
            <TableHead className='text-center'>PDF</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.employeeId}>
              <TableCell className='font-medium'>{row.employeeName}</TableCell>
              <TableCell className='text-center'>
                {locked || !onDaysWorkedChange ? (
                  `${row.daysWorked} of ${row.daysInMonth}`
                ) : (
                  <Input
                    type='number'
                    min={0}
                    max={row.daysInMonth}
                    value={row.daysWorked}
                    onChange={(e) =>
                      onDaysWorkedChange(
                        row.employeeId,
                        Math.min(
                          row.daysInMonth,
                          Math.max(0, Number(e.target.value)),
                        ),
                      )
                    }
                    className='mx-auto h-8 w-20 text-center'
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
                {locked || !onOvertimeMultiplierChange ? (
                  `${row.overtimeMultiplier}x`
                ) : (
                  <Input
                    type='number'
                    step={0.1}
                    min={0}
                    max={5}
                    value={row.overtimeMultiplier}
                    onChange={(e) =>
                      onOvertimeMultiplierChange(
                        row.employeeId,
                        Math.max(0, Number(e.target.value)),
                      )
                    }
                    className='mx-auto h-8 w-20 text-center'
                  />
                )}
              </TableCell>
              <TableCell className='text-center'>
                {row.overtimeHours}h · {formatCurrency(row.overtimePay) || '—'}
              </TableCell>
              <TableCell className='text-center font-semibold'>
                {formatCurrency(row.total)}
              </TableCell>
              <TableCell className='text-center'>
                <DownloadPayslipButton payslip={row} iconOnly />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
