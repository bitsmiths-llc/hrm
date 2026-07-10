import { Checkbox } from '@/components/ui/checkbox';
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

import { CustomFieldsCell } from './custom-fields-cell';
import { SendInvoiceButton } from './send-invoice-button';
import { ViewInvoiceButton } from './view-invoice-button';

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
  onAddCustomField: (
    employeeId: string,
    field: { label: string; amount: number },
  ) => void;
  selectedIds: Set<string>;
  onToggleRow: (employeeId: string) => void;
  onToggleAll: () => void;
};

export function CurrentCycleTable({
  rows,
  locked,
  onDaysWorkedChange,
  onOvertimeMultiplierChange,
  onAddCustomField,
  selectedIds,
  onToggleRow,
  onToggleAll,
}: CurrentCycleTableProps) {
  const allSelected = rows.length > 0 && selectedIds.size === rows.length;

  return (
    <div className='rounded-lg border border-border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-10'>
              <Checkbox
                checked={allSelected}
                onCheckedChange={onToggleAll}
                aria-label='Select all rows'
              />
            </TableHead>
            <TableHead>Employee</TableHead>
            <TableHead className='text-center'>Days Worked</TableHead>
            <TableHead className='text-center'>Total Base</TableHead>
            <TableHead className='text-center'>Medical</TableHead>
            <TableHead className='text-center'>OT Rate</TableHead>
            <TableHead className='text-center'>Overtime</TableHead>
            <TableHead className='text-center'>Adjustments</TableHead>
            <TableHead className='text-center'>Total</TableHead>
            <TableHead className='text-center'>Invoice</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.employeeId}>
              <TableCell>
                <Checkbox
                  checked={selectedIds.has(row.employeeId)}
                  onCheckedChange={() => onToggleRow(row.employeeId)}
                  aria-label={`Select ${row.employeeName}`}
                />
              </TableCell>
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
              <TableCell className='text-center'>
                <div className='flex justify-center'>
                  <CustomFieldsCell
                    fields={row.customFields}
                    disabled={locked}
                    onAdd={(field) => onAddCustomField(row.employeeId, field)}
                  />
                </div>
              </TableCell>
              <TableCell className='text-center font-semibold'>
                {formatCurrency(row.total)}
              </TableCell>
              <TableCell className='text-center'>
                <div className='flex items-center justify-center gap-1'>
                  <ViewInvoiceButton payslip={row} />
                  <SendInvoiceButton employeeName={row.employeeName} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
