'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useCreateMedicalClaim } from '@/hooks/actions/use-create-medical-claim';
import { useMedicalBalance } from '@/hooks/queries/medical';

import { FileUpload } from '@/components/hrm/file-upload';
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
import { ControlledDatePicker } from '@/components/ui/form/controlled-date-picker';
import { ControlledSelect } from '@/components/ui/form/controlled-select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { formatCurrency } from '@/utils/number-functions';

import { hrmConfig } from '@/constants/hrm-config';
import {
  medicalClaimForLabels,
  medicalServiceTypeLabels,
} from '@/constants/hrm-labels';
import {
  createMedicalClaimSchema,
  expenseDateBounds,
  type MedicalClaimInput,
} from '@/schema/medical';

const PROOF_ACCEPT = hrmConfig.proofMimeTypes.join(',');

const claimForOptions = Object.entries(medicalClaimForLabels).map(
  ([value, label]) => ({ value, label }),
);

const serviceTypeOptions = Object.entries(medicalServiceTypeLabels).map(
  ([value, label]) => ({ value, label }),
);

type SubmitClaimDialogProps = {
  /** The signed-in employee's id. The claim files upload under this uid and the
   *  available-balance bound is read for it; the trigger is disabled until it
   *  resolves. */
  employeeId?: string;
  disabled?: boolean;
};

export function SubmitClaimDialog({
  employeeId,
  disabled,
}: SubmitClaimDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: balance } = useMedicalBalance(employeeId);
  const maxAmount = balance?.available ?? 0;

  // Restrict the calendar to the same [today - 30 days, today] window the schema
  // enforces, so a picked date can never fail validation on submit.
  const disabledExpenseDates = useMemo(() => {
    const { earliest, today } = expenseDateBounds();
    return [{ before: earliest }, { after: today }];
  }, []);

  const form = useForm<MedicalClaimInput>({
    resolver: zodResolver(createMedicalClaimSchema(maxAmount)),
    defaultValues: {
      claimFor: undefined,
      serviceType: undefined,
      description: '',
      amount: 0,
      expenseDate: '',
      proofFiles: [],
    },
  });

  const { mutate, isPending } = useCreateMedicalClaim(() => {
    toast.success('Medical claim submitted for approval');
    form.reset();
    setOpen(false);
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) form.reset();
      }}
    >
      <DialogTrigger asChild>
        <Button iconLeft={Plus} disabled={disabled || !employeeId}>
          Submit claim
        </Button>
      </DialogTrigger>
      <ScrollableDialogContent className='sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>Submit a medical claim</DialogTitle>
          <DialogDescription>
            Attach receipts, prescriptions, and proof of payment. The expense
            date must be within the last 30 days, and the amount can&apos;t
            exceed your available balance of{' '}
            {formatCurrency(maxAmount) || 'PKR 0'}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => mutate(values))}
            className='flex flex-col gap-4'
          >
            <div className='grid grid-cols-2 gap-4'>
              <ControlledSelect<MedicalClaimInput>
                name='claimFor'
                label='Reimbursement for'
                options={claimForOptions}
                placeholder='Select'
              />
              <ControlledSelect<MedicalClaimInput>
                name='serviceType'
                label='Service type'
                options={serviceTypeOptions}
                placeholder='Select'
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <ControlledDatePicker<MedicalClaimInput>
                name='expenseDate'
                label='Expense date'
                disabledDates={disabledExpenseDates}
              />
              <FormField
                control={form.control}
                name='amount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (PKR)</FormLabel>
                    <FormControl>
                      <Input type='number' min={0} step={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder='What was the expense for?'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='proofFiles'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proof of expense</FormLabel>
                  <FormControl>
                    <FileUpload
                      value={field.value}
                      onChange={field.onChange}
                      maxFiles={hrmConfig.maxProofFiles}
                      maxSizeMb={hrmConfig.maxProofFileSizeMb}
                      accept={PROOF_ACCEPT}
                      allowedMimeTypes={hrmConfig.proofMimeTypes}
                      label='Upload receipt / prescription'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type='submit' isLoading={isPending}>
                Submit claim
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </ScrollableDialogContent>
    </Dialog>
  );
}
