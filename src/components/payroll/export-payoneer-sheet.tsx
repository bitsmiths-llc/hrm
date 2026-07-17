'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { useExportPayoneer } from '@/hooks/actions/use-export-payoneer';

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

import { formatCurrency } from '@/utils/number-functions';

import {
  BALANCE_CURRENCIES,
  type BalanceCurrency,
  DEFAULT_BALANCE_CURRENCY,
  isBalanceCurrency,
} from '@/constants/payroll-export';

import { PayoneerBalanceBreakdown } from './payoneer-balance-breakdown';

/** The only payslip fields the picker needs. `total` is the recipient PKR amount
 *  (shown for context only) — the file's authoritative amount is read from the
 *  frozen `payslips.total_pay` snapshot server-side. */
export type PayoneerExportRow = {
  employeeId: string;
  employeeName: string;
  total: number;
};

type ExportPayoneerSheetProps = {
  runId: string;
  rows: PayoneerExportRow[];
  disabled?: boolean;
};

export function ExportPayoneerSheet({
  runId,
  rows,
  disabled,
}: ExportPayoneerSheetProps) {
  const [open, setOpen] = useState(false);
  const [currencies, setCurrencies] = useState<Record<string, BalanceCurrency>>(
    {},
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkCurrency, setBulkCurrency] = useState<BalanceCurrency>(
    DEFAULT_BALANCE_CURRENCY,
  );

  const exportAction = useExportPayoneer(() => {
    setOpen(false);
    setSelectedIds(new Set());
  });

  const currencyFor = (employeeId: string) =>
    currencies[employeeId] ?? DEFAULT_BALANCE_CURRENCY;

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
        : new Set(rows.map((row) => row.employeeId)),
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
      `Set ${bulkCurrency} for ${selectedIds.size} ${
        selectedIds.size === 1 ? 'employee' : 'employees'
      }`,
    );
  };

  // Group by source balance: how many employees each balance pays, and the
  // total PKR those employees receive. The card converts each total into its
  // own currency for display.
  const breakdown = BALANCE_CURRENCIES.map((currency) => {
    const inCurrency = rows.filter(
      (row) => currencyFor(row.employeeId) === currency,
    );
    return {
      currency,
      count: inCurrency.length,
      totalPkr: inCurrency.reduce((sum, row) => sum + row.total, 0),
    };
  }).filter((group) => group.count > 0);

  const handleExport = () => {
    const currencyByEmployee = Object.fromEntries(
      rows.map((row) => [row.employeeId, currencyFor(row.employeeId)]),
    );
    exportAction.execute({ run_id: runId, currencyByEmployee });
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
            Choose the Payoneer balance to pay each employee from. The recipient
            bank account is always PKR, and the amount is the locked payslip
            total.
          </SheetDescription>
        </SheetHeader>

        {selectedIds.size > 0 && (
          <div className='flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2'>
            <span className='text-sm text-muted-foreground'>
              {selectedIds.size} selected
            </span>
            <CurrencySelect
              value={bulkCurrency}
              onValueChange={setBulkCurrency}
              triggerClassName='h-8 w-28'
            />
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
                <TableHead className='text-center'>Amount (PKR)</TableHead>
                <TableHead className='text-center'>Pay from</TableHead>
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
                      {formatCurrency(row.total)}
                    </TableCell>
                    <TableCell className='text-center'>
                      <CurrencySelect
                        value={currency}
                        onValueChange={(next) =>
                          setCurrencies((prev) => ({
                            ...prev,
                            [row.employeeId]: next,
                          }))
                        }
                        triggerClassName='mx-auto h-9 w-28'
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {breakdown.length > 0 && (
          <PayoneerBalanceBreakdown groups={breakdown} />
        )}

        <SheetFooter className='mt-auto'>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            isLoading={exportAction.isPending}
            disabled={rows.length === 0}
            onClick={handleExport}
          >
            Export
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

type CurrencySelectProps = {
  value: BalanceCurrency;
  onValueChange: (value: BalanceCurrency) => void;
  triggerClassName?: string;
};

/** The USD/GBP/EUR source-balance picker, shared by the bulk bar and each row. */
function CurrencySelect({
  value,
  onValueChange,
  triggerClassName,
}: CurrencySelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (isBalanceCurrency(next)) onValueChange(next);
      }}
    >
      <SelectTrigger className={triggerClassName}>
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
  );
}
