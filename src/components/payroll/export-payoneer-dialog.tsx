'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

import { useEmployees } from '@/hooks/queries/employees';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Payslip } from '@/types/hrm';

const BALANCE_CURRENCIES = ['PKR', 'USD', 'GBP', 'EUR'] as const;
type BalanceCurrency = (typeof BALANCE_CURRENCIES)[number];

const formatAmount = (amount: number, currency: BalanceCurrency) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

type ExportPayoneerDialogProps = {
  rows: Payslip[];
  disabled?: boolean;
};

export function ExportPayoneerDialog({
  rows,
  disabled,
}: ExportPayoneerDialogProps) {
  const { data: employees } = useEmployees();
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [currencies, setCurrencies] = useState<Record<string, BalanceCurrency>>(
    {},
  );

  const handleExport = async () => {
    setIsExporting(true);
    await new Promise((resolve) => setTimeout(resolve, 400));

    const sheetRows = rows.flatMap((row) => {
      const employee = employees?.find((e) => e.id === row.employeeId);
      if (!employee?.bank) return [];
      const currency = currencies[row.employeeId] ?? 'PKR';
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' disabled={disabled}>
          Export for Payoneer
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Export for Payoneer</DialogTitle>
          <DialogDescription>
            Choose the balance currency Payoneer should pay each employee from.
            The recipient bank account is always PKR.
          </DialogDescription>
        </DialogHeader>
        <div className='flex flex-col gap-3'>
          {rows.map((row) => {
            const currency = currencies[row.employeeId] ?? 'PKR';
            return (
              <div
                key={row.employeeId}
                className='flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2'
              >
                <div className='flex flex-col gap-0.5'>
                  <p className='text-sm font-medium'>{row.employeeName}</p>
                  <p className='text-xs text-muted-foreground'>
                    {formatAmount(row.total, currency)}
                  </p>
                </div>
                <Select
                  value={currency}
                  onValueChange={(value) =>
                    setCurrencies((prev) => ({
                      ...prev,
                      [row.employeeId]: value as BalanceCurrency,
                    }))
                  }
                >
                  <SelectTrigger className='h-9 w-28'>
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
              </div>
            );
          })}
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button isLoading={isExporting} onClick={handleExport}>
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
