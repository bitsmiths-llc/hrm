'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Receipt, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { EmptyState } from '@/components/hrm/empty-state';
import { ScrollableDialogContent } from '@/components/hrm/scrollable-dialog-content';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { formatCurrency } from '@/utils/number-functions';

import {
  payslipLineItemCopy,
  type PayslipLineItemKind,
} from '@/constants/payroll-line-items';
import {
  type PayslipLineItemFormInput,
  payslipLineItemFormSchema,
} from '@/schema/payroll';

type CustomFieldsCellProps = {
  /** This column's line items, as positive magnitudes. */
  fields: { label: string; amount: number }[];
  /** Named in the dialog header — the trigger is a bare figure in a dense grid,
   *  so this is the user's only confirmation they opened the right row. */
  employeeName: string;
  /** Which column this cell sits in. Drives the copy; the caller applies the
   *  matching sign. */
  kind: PayslipLineItemKind;
  onAdd: (field: { label: string; amount: number }) => void;
  /** Removes the item at the given index of `fields` (the caller maps it
   *  back to its own storage). Omit to disallow removal. */
  onRemove?: (index: number) => void;
  /** True once the cycle is locked — the dialog drops to read-only. */
  disabled?: boolean;
  /** True while a payroll write is in flight — freezes the dialog's actions. */
  isSubmitting?: boolean;
};

/** Per-employee ad-hoc line items (bonus, loan, etc.) that fold into the row's
 *  total. The cell itself stays a compact trigger — the running sum once items
 *  exist, a plain "+" before that — and opens a dialog that lists what's there
 *  and adds more. */
export function CustomFieldsCell({
  fields,
  employeeName,
  kind,
  onAdd,
  onRemove,
  disabled,
  isSubmitting,
}: CustomFieldsCellProps) {
  const [open, setOpen] = useState(false);
  const copy = payslipLineItemCopy[kind];
  const total = fields.reduce((sum, field) => sum + field.amount, 0);

  const form = useForm<PayslipLineItemFormInput>({
    resolver: zodResolver(payslipLineItemFormSchema),
    defaultValues: { label: '', amount: 0 },
  });

  // The dialog deliberately stays open after an add — listing the items is half
  // its job, and a second bonus shouldn't cost another trip through the grid.
  // The new row appears when the recalc lands and `fields` comes back changed.
  const onSubmit = (values: PayslipLineItemFormInput) => {
    onAdd(values);
    form.reset();
  };

  if (disabled && fields.length === 0) {
    return <span className='text-muted-foreground'>—</span>;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) form.reset();
      }}
    >
      <DialogTrigger asChild>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='h-7 gap-1.5 px-2 text-xs'
          aria-label={`${copy.title} for ${employeeName}`}
        >
          {fields.length > 0 ? (
            <>
              {formatCurrency(total) || '0'}
              {fields.length > 1 && (
                <span className='text-muted-foreground'>·{fields.length}</span>
              )}
            </>
          ) : (
            <Plus className='size-3.5' />
          )}
        </Button>
      </DialogTrigger>

      <ScrollableDialogContent className='flex flex-col gap-6 sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {copy.title} · {employeeName}
          </DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>

        {fields.length === 0 ? (
          <EmptyState icon={Receipt} title={copy.emptyTitle} />
        ) : (
          <div className='rounded-lg border border-border'>
            <ul className='divide-y divide-border'>
              {fields.map((field, index) => (
                <li
                  key={index}
                  className='flex items-center justify-between gap-3 px-3 py-2'
                >
                  <span className='min-w-0 truncate text-sm font-medium'>
                    {field.label}
                  </span>
                  <span className='flex shrink-0 items-center gap-1'>
                    <span className='text-sm tabular-nums'>
                      {formatCurrency(field.amount)}
                    </span>
                    {!disabled && !!onRemove && (
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='size-7 text-muted-foreground hover:text-destructive'
                        disabled={isSubmitting}
                        onClick={() => onRemove(index)}
                        aria-label={`Remove ${field.label}`}
                      >
                        <X className='size-4' />
                      </Button>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <div className='flex items-center justify-between gap-3 border-t border-border bg-muted/40 px-3 py-2'>
              <span className='text-sm font-medium'>Total</span>
              <span className='text-sm font-semibold tabular-nums'>
                {formatCurrency(total) || '0'}
              </span>
            </div>
          </div>
        )}

        {!disabled && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='flex flex-col gap-4 border-t border-border pt-6'
            >
              <p className='text-sm font-medium'>
                Add {copy.noun.toLowerCase()}
              </p>
              <div className='grid grid-cols-3 gap-3'>
                <FormField
                  control={form.control}
                  name='label'
                  render={({ field }) => (
                    <FormItem className='col-span-2'>
                      <FormLabel>Label</FormLabel>
                      <FormControl>
                        <Input placeholder={copy.labelPlaceholder} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='amount'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input type='number' min={0} step={1} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type='submit' iconLeft={Plus} isLoading={isSubmitting}>
                Add {copy.noun.toLowerCase()}
              </Button>
            </form>
          </Form>
        )}

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => setOpen(false)}
          >
            Done
          </Button>
        </DialogFooter>
      </ScrollableDialogContent>
    </Dialog>
  );
}
