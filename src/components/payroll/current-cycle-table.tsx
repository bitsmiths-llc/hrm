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
  /** Removes the custom field at `index` of the row's full customFields
   *  array (adjustments and deductions share that one array). */
  onRemoveCustomField: (employeeId: string, index: number) => void;
  selectedIds: Set<string>;
  onToggleRow: (employeeId: string) => void;
  onToggleAll: () => void;
};

export function CurrentCycleTable({
  rows,
  locked,
  onOvertimeMultiplierChange,
  onAddCustomField,
  onRemoveCustomField,
  selectedIds,
  onToggleRow,
  onToggleAll,
}: CurrentCycleTableProps) {
  const allSelected = rows.length > 0 && selectedIds.size === rows.length;

  return (
    <div className='rounded-lg border border-border'>
      <Table>
        <TableHeader>
          <TableRow className='hover:bg-transparent'>
            <TableHead colSpan={2} className='h-8' />
            <TableHead
              colSpan={5}
              className='h-8 border-l border-border bg-muted/50 text-center text-xs font-semibold uppercase tracking-wide'
            >
              Earnings
            </TableHead>
            <TableHead
              colSpan={3}
              className='h-8 border-l border-border bg-muted/30 text-center text-xs font-semibold uppercase tracking-wide'
            >
              Deductions
            </TableHead>
            <TableHead colSpan={2} className='h-8 border-l border-border' />
          </TableRow>
          <TableRow>
            <TableHead className='w-10'>
              <Checkbox
                checked={allSelected}
                onCheckedChange={onToggleAll}
                aria-label='Select all rows'
              />
            </TableHead>
            <TableHead>Employee</TableHead>
            <TableHead className='border-l border-border text-center'>
              Base Salary
            </TableHead>
            <TableHead className='text-center'>Medical</TableHead>
            <TableHead className='text-center'>OT Rate</TableHead>
            <TableHead className='text-center'>Overtime</TableHead>
            <TableHead className='text-center'>Adjustments</TableHead>
            <TableHead className='border-l border-border text-center'>
              Unpaid Leaves
            </TableHead>
            <TableHead className='text-center'>Tax</TableHead>
            <TableHead className='text-center'>Others</TableHead>
            <TableHead className='border-l border-border text-center'>
              Net Salary
            </TableHead>
            <TableHead className='text-center'>Invoice</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            // Adjustments (earnings) and Others (deductions) render disjoint
            // slices of the same customFields array; keeping each item's
            // original index lets removal target the right entry.
            const indexedFields = row.customFields.map((field, index) => ({
              field,
              index,
            }));
            const earnedFields = indexedFields.filter(
              ({ field }) => field.amount >= 0,
            );
            const deductedFields = indexedFields.filter(
              ({ field }) => field.amount < 0,
            );

            return (
              <TableRow key={row.employeeId}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(row.employeeId)}
                    onCheckedChange={() => onToggleRow(row.employeeId)}
                    aria-label={`Select ${row.employeeName}`}
                  />
                </TableCell>
                <TableCell className='font-medium'>
                  {row.employeeName}
                </TableCell>
                <TableCell className='border-l border-border text-center'>
                  {formatCurrency(row.baseSalary)}
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
                  {row.overtimeHours}h ·{' '}
                  {formatCurrency(row.overtimePay) || '—'}
                </TableCell>
                <TableCell className='text-center'>
                  <div className='flex justify-center'>
                    <CustomFieldsCell
                      fields={earnedFields.map(({ field }) => field)}
                      disabled={locked}
                      onAdd={(field) =>
                        onAddCustomField(row.employeeId, {
                          label: field.label,
                          amount: Math.abs(field.amount),
                        })
                      }
                      onRemove={(i) =>
                        onRemoveCustomField(
                          row.employeeId,
                          earnedFields[i].index,
                        )
                      }
                    />
                  </div>
                </TableCell>
                <TableCell className='whitespace-nowrap border-l border-border text-center'>
                  {row.daysInMonth - row.daysWorked}d ·{' '}
                  {formatCurrency(row.baseSalary - row.totalBase) || '—'}
                </TableCell>
                <TableCell className='text-center'>
                  {formatCurrency(row.taxDeduction) || '—'}
                </TableCell>
                <TableCell className='text-center'>
                  <div className='flex justify-center'>
                    <CustomFieldsCell
                      fields={deductedFields.map(({ field }) => ({
                        label: field.label,
                        amount: Math.abs(field.amount),
                      }))}
                      disabled={locked}
                      onAdd={(field) =>
                        onAddCustomField(row.employeeId, {
                          label: field.label,
                          amount: -Math.abs(field.amount),
                        })
                      }
                      onRemove={(i) =>
                        onRemoveCustomField(
                          row.employeeId,
                          deductedFields[i].index,
                        )
                      }
                    />
                  </div>
                </TableCell>
                <TableCell className='border-l border-border text-center font-semibold'>
                  {formatCurrency(row.total)}
                </TableCell>
                <TableCell className='text-center'>
                  <div className='flex items-center justify-center gap-1'>
                    <ViewInvoiceButton payslip={row} />
                    <SendInvoiceButton employeeName={row.employeeName} />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
