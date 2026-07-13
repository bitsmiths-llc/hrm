'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

import { useEmployees } from '@/hooks/queries/employees';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Payslip } from '@/types/hrm';

const BALANCE_CURRENCIES = ['USD', 'GBP', 'EUR'] as const;
type BalanceCurrency = (typeof BALANCE_CURRENCIES)[number];
const DEFAULT_CURRENCY: BalanceCurrency = 'USD';

const formatAmount = (amount: number, currency: BalanceCurrency) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

type ExportPayoneerSheetProps = {
  rows: Payslip[];
  disabled?: boolean;
};

export function ExportPayoneerSheet({
  rows,
  disabled,
}: ExportPayoneerSheetProps) {
  const { data: employees } = useEmployees();
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [currencies, setCurrencies] = useState<Record<string, BalanceCurrency>>(
    {},
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkCurrency, setBulkCurrency] =
    useState<BalanceCurrency>(DEFAULT_CURRENCY);

  const currencyFor = (employeeId: string) =>
    currencies[employeeId] ?? DEFAULT_CURRENCY;

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

  const applyBulkCurrency = () => {
    setCurrencies((prev) => {
      const next = { ...prev };
      selectedIds.forEach((employeeId) => {
        next[employeeId] = bulkCurrency;
      });
      return next;
    });
    toast.success(
      `Set ${bulkCurrency} for ${selectedIds.size} ${selectedIds.size === 1 ? 'employee' : 'employees'}`,
    );
  };

  const breakdown = BALANCE_CURRENCIES.map((currency) => {
    const inCurrency = rows.filter(
      (row) => currencyFor(row.employeeId) === currency,
    );
    return {
      currency,
      count: inCurrency.length,
      total: inCurrency.reduce((sum, row) => sum + row.total, 0),
    };
  }).filter((group) => group.count > 0);

  const handleExport = async () => {
    setIsExporting(true);
    await new Promise((resolve) => setTimeout(resolve, 400));

    const sheetRows = rows.flatMap((row) => {
      const employee = employees?.find((e) => e.id === row.employeeId);
      if (!employee?.bank) return [];
      const currency = currencyFor(row.employeeId);
      return [
        {
          'Bank Account Holder Name': employee.bank.accountHolderName,
          'Bank Account Number/IBAN':
            employee.bank.iban || employee.bank.accountNumber,
          'Payoneer Balance to Pay From': currency,
          'Amount to Pay From Balance': '',
          'Amount Recipient Gets': row.total,
          'Recipient Bank Account Currency': 'PKR',
          'Payment Reference (Optional)': '',
          'Transaction Description (Optional)': '',
        },
      ];
    });

    const worksheet = XLSX.utils.json_to_sheet(sheetRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payoneer Export');
    XLSX.writeFile(
      workbook,
      `payoneer-export-${rows[0]?.cycleMonth ?? 'export'}.xlsx`,
    );

    setIsExporting(false);
    setOpen(false);
    toast.success(`Exported ${sheetRows.length} payslips for Payoneer`);
  };

  const allSelected = rows.length > 0 && selectedIds.size === rows.length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant='outline' disabled={disabled}>
          Export for Payoneer
        </Button>
      </SheetTrigger>
      <SheetContent className='flex w-full flex-col gap-4 overflow-y-auto sm:max-w-2xl'>
        <SheetHeader>
          <SheetTitle>Export for Payoneer</SheetTitle>
          <SheetDescription>
            Choose the balance currency Payoneer should pay each employee from.
            The recipient bank account is always PKR.
          </SheetDescription>
        </SheetHeader>

        {selectedIds.size > 0 && (
          <div className='flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2'>
            <span className='text-sm text-muted-foreground'>
              {selectedIds.size} selected
            </span>
            <Select
              value={bulkCurrency}
              onValueChange={(value) =>
                setBulkCurrency(value as BalanceCurrency)
              }
            >
              <SelectTrigger className='h-8 w-28'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BALANCE_CURRENCIES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type='button' size='sm' onClick={applyBulkCurrency}>
              Apply to selected
            </Button>
          </div>
        )}

        <div className='rounded-lg border border-border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-10'>
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleAll}
                    aria-label='Select all rows'
                  />
                </TableHead>
                <TableHead>Employee</TableHead>
                <TableHead className='text-center'>Amount</TableHead>
                <TableHead className='text-center'>Currency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const currency = currencyFor(row.employeeId);
                return (
                  <TableRow key={row.employeeId}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(row.employeeId)}
                        onCheckedChange={() => toggleRow(row.employeeId)}
                        aria-label={`Select ${row.employeeName}`}
                      />
                    </TableCell>
                    <TableCell className='font-medium'>
                      {row.employeeName}
                    </TableCell>
                    <TableCell className='text-center'>
                      {formatAmount(row.total, currency)}
                    </TableCell>
                    <TableCell className='text-center'>
                      <Select
                        value={currency}
                        onValueChange={(value) =>
                          setCurrencies((prev) => ({
                            ...prev,
                            [row.employeeId]: value as BalanceCurrency,
                          }))
                        }
                      >
                        <SelectTrigger className='mx-auto h-9 w-28'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {BALANCE_CURRENCIES.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {breakdown.length > 0 && (
          <div className='rounded-lg border border-border px-4 py-3'>
            <p className='mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
              Breakdown by currency
            </p>
            <div className='flex flex-col gap-1'>
              {breakdown.map((group) => (
                <div
                  key={group.currency}
                  className='flex items-center justify-between text-sm'
                >
                  <span className='text-muted-foreground'>
                    {group.currency} · {group.count}{' '}
                    {group.count === 1 ? 'employee' : 'employees'}
                  </span>
                  <span className='font-medium'>
                    {formatAmount(group.total, group.currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <SheetFooter className='mt-auto'>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button isLoading={isExporting} onClick={handleExport}>
            Export
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
