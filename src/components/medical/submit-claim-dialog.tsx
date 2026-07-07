'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useMyMedicalBalance } from '@/hooks/queries/medical';

import { FileUpload } from '@/components/hrm/file-upload';
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
  type MedicalClaimInput,
} from '@/schema/medical';

const claimForOptions = Object.entries(medicalClaimForLabels).map(
  ([value, label]) => ({ value, label }),
);

const serviceTypeOptions = Object.entries(medicalServiceTypeLabels).map(
  ([value, label]) => ({ value, label }),
);

type SubmitClaimDialogProps = {
  disabled?: boolean;
};

export function SubmitClaimDialog({ disabled }: SubmitClaimDialogProps) {
  const [open, setOpen] = useState(false);
  const { data: balance } = useMyMedicalBalance();
  const maxAmount = balance?.accrued ?? 0;

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

  const onSubmit = async (values: MedicalClaimInput) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    toast.success(
      `${medicalServiceTypeLabels[values.serviceType]} claim submitted for approval`,
    );
    form.reset();
    setOpen(false);
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
        <Button iconLeft={Plus} disabled={disabled}>
          Submit claim
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Submit a medical claim</DialogTitle>
          <DialogDescription>
            Attach receipts, prescriptions, and proof of payment. Claims must be
            submitted within 30 days of the expense date and can&apos;t exceed
            your accrued balance of {formatCurrency(maxAmount) || 'PKR 0'}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
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
                disabledDates={{ after: new Date() }}
              />
              <FormField
                control={form.control}
                name='amount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (PKR)</FormLabel>
                    <FormControl>
                      <Input type='number' min={0} {...field} />
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
                      accept='image/*,.pdf'
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
              <Button type='submit' isLoading={form.formState.isSubmitting}>
                Submit claim
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
