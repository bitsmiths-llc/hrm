'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useAddPayslipCustomField } from '@/hooks/actions/use-add-payslip-custom-field';

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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ControlledSelect } from '@/components/ui/form/controlled-select';
import { Input } from '@/components/ui/input';

import {
  PAYSLIP_LINE_ITEM_KINDS,
  payslipLineItemCopy,
} from '@/constants/payroll-line-items';
import {
  type BulkPayslipLineItemFormInput,
  bulkPayslipLineItemFormSchema,
} from '@/schema/payroll';

const kindOptions = PAYSLIP_LINE_ITEM_KINDS.map((kind) => ({
  value: kind,
  label: payslipLineItemCopy[kind].optionLabel,
}));

type BulkAdjustmentDialogProps = {
  runId: string;
  /** The selected rows. One action call fans out across all of them. */
  payslipIds: string[];
};

/** Adds the same line item to every selected employee at once. Unlike the grid
 *  cells it isn't anchored to a column, so it asks which one to file under
 *  rather than inferring the sign. */
export function BulkAdjustmentDialog({
  runId,
  payslipIds,
}: BulkAdjustmentDialogProps) {
  const [open, setOpen] = useState(false);
  const count = payslipIds.length;

  const form = useForm<BulkPayslipLineItemFormInput>({
    resolver: zodResolver(bulkPayslipLineItemFormSchema),
    defaultValues: { kind: 'earning', label: '', amount: 0 },
  });

  // Owns its own action rather than taking the grid's: a rejected write has to
  // leave the dialog open with the input intact, and the shared hook upstairs
  // can only report the failure, not re-open what already closed.
  const addField = useAddPayslipCustomField(
    ({ label, amount, count: added }) => {
      const { noun } =
        payslipLineItemCopy[amount > 0 ? 'earning' : 'deduction'];
      toast.success(
        `${noun} "${label}" added to ${added} ${
          added === 1 ? 'employee' : 'employees'
        }`,
      );
      form.reset();
      setOpen(false);
    },
  );

  const onSubmit = ({ kind, label, amount }: BulkPayslipLineItemFormInput) => {
    addField.execute({
      run_id: runId,
      payslip_ids: payslipIds,
      label,
      amount: kind === 'deduction' ? -amount : amount,
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) form.reset();
      }}
    >
      <DialogTrigger asChild>
        <Button type='button' variant='outline' size='sm' iconLeft={Plus}>
          Add line item
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Add a line item</DialogTitle>
          <DialogDescription>
            Applies to the {count} selected{' '}
            {count === 1 ? 'employee' : 'employees'}. Each gets their own copy,
            so you can edit or remove it per employee afterward.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex flex-col gap-4'
          >
            <ControlledSelect<BulkPayslipLineItemFormInput>
              name='kind'
              label='Type'
              options={kindOptions}
              placeholder='Select'
            />
            <div className='grid grid-cols-3 gap-3'>
              <FormField
                control={form.control}
                name='label'
                render={({ field }) => (
                  <FormItem className='col-span-2'>
                    <FormLabel>Label</FormLabel>
                    <FormControl>
                      <Input placeholder='Eid Bonus' {...field} />
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
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type='submit' isLoading={addField.isPending}>
                Add to {count} {count === 1 ? 'employee' : 'employees'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
